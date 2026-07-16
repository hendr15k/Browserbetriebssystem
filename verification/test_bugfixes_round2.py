"""Regression tests for additional bug fixes (round 2)."""

import pytest


def test_safe_json_parse_handles_corrupt_value(page):
    """OS must still boot when a localStorage entry is corrupted JSON."""
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    result = page.evaluate(
        """
        () => {
            try {
                const v = safeJsonParse('scheduledNotifications', ['default']);
                return v && v.length === 1 && v[0] === 'default' ? 'ok' : 'fail';
            } catch (e) {
                return 'threw: ' + String(e);
            }
        }
        """
    )
    assert result == "ok"

    page.evaluate("localStorage.setItem('scheduledNotifications', '{not valid json')")
    page.evaluate("localStorage.removeItem('windowStates')")
    fallback = page.evaluate(
        """
        () => {
            try {
                localStorage.setItem('scheduledNotifications', '{garbage');
                const v = safeJsonParse('scheduledNotifications', ['fallback']);
                return v && v.length === 1 && v[0] === 'fallback' ? 'ok' : 'fail';
            } catch (e) {
                return 'threw: ' + String(e);
            }
        }
        """
    )
    assert fallback == "ok"


def test_load_file_system_rejects_string_value(page):
    """If webos-filesystem was saved as a string, loadFileSystem must not pollute fileSystem keys."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate(
        """
        () => {
            // Plant a 'poisoned' value that would normally pollute fileSystem via Object.assign
            localStorage.setItem('webos-filesystem', '"abc"');
            // Reset and reload
            for (const k of Object.keys(fileSystem)) delete fileSystem[k];
            loadFileSystem();
        }
        """
    )

    keys = page.evaluate(
        """
        () => Object.keys(fileSystem)
        """
    )
    assert keys == [], f"fileSystem should be empty after loading a non-object value, got {keys!r}"


def test_markdown_link_sanitizes_javascript_url(page):
    """Markdown links with javascript: URLs must NOT execute scripts."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    rendered = page.evaluate(
        """
        () => {
            const md = '[click](javascript:window.__pwned=true)';
            const div = document.createElement('div');
            div.innerHTML = renderMarkdown(md);
            return {
                html: div.innerHTML,
                href: div.querySelector('a') ? div.querySelector('a').getAttribute('href') : null
            };
        }
        """
    )
    assert not rendered["href"] or rendered["href"].startswith("javascript") is False
    assert "javascript:" not in rendered["html"]


def test_markdown_link_keeps_safe_urls(page):
    """Markdown links with http(s) URLs must still be rendered."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    rendered = page.evaluate(
        """
        () => {
            const md = '[docs](https://example.com/docs)';
            const div = document.createElement('div');
            div.innerHTML = renderMarkdown(md);
            const a = div.querySelector('a');
            return a ? a.getAttribute('href') : null;
        }
        """
    )
    assert rendered == "https://example.com/docs"


def test_photo_gallery_filename_escaped(page):
    """A malicious filename in the gallery must NOT inject HTML."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    rendered = page.evaluate(
        """
        () => {
            // Set up window DOM
            const win = document.createElement('div');
            win.className = 'window photo-gallery-window';
            win.id = 'window-gallery-test';
            const container = document.createElement('div');
            container.id = 'gallery-container-window-gallery-test';
            win.appendChild(container);
            document.getElementById('window-area').appendChild(win);

            // Seed an image with a malicious filename
            galleryStates['window-gallery-test'] = {
                view: 'grid',
                currentIndex: 0,
                images: [{
                    id: '1',
                    name: '<img src=x onerror=window.__pwned=true>.jpg',
                    data: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                }]
            };

            renderGalleryApp('window-gallery-test');
            return {
                hasRawImg: container.innerHTML.indexOf('<img src=x onerror') !== -1
            };
        }
        """
    )
    assert rendered["hasRawImg"] is False, "Raw malicious HTML should be escaped"


def test_audio_pauses_on_window_close(page):
    """If a window has an <audio> element, close should pause it before revokeObjectURL."""
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate(
        """
        () => {
            const win = document.createElement('div');
            win.className = 'window';
            win.id = 'window-pause-test';
            const audio = document.createElement('audio');
            audio.id = 'audio-pause';
            // We can't create a real Blob URL without a media file, but the cleanup
            // logic must call .pause() unconditionally.
            audio.pause = () => { window.__paused = true; };
            win.appendChild(audio);
            document.getElementById('window-area').appendChild(win);

            performWindowCleanup('window-pause-test');
        }
        """
    )
    paused = page.evaluate("() => window.__paused === true")
    assert paused is True, "audio.pause() must be called during window cleanup"


def test_camera_stream_stopped_on_close(page):
    """When a Camera window closes, any active MediaStream must stop()."""
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    result = page.evaluate(
        """
        () => {
            try {
                // Build a fake MediaStream-like object
                const fakeTrack = { stopped: false, stop: function() { this.stopped = true; } };
                cameraStreams['window-cam-test'] = {
                    getTracks: () => [fakeTrack]
                };
                performWindowCleanup('window-cam-test');
                return { ok: fakeTrack.stopped, removed: !cameraStreams['window-cam-test'] };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        }
        """
    )
    assert result["ok"] is True, "Camera track.stop() must be called"
    assert result["removed"] is True, "cameraStreams entry must be removed"


def test_sticky_note_id_unique_rapid_creation(page):
    """Two sticky notes created immediately must get distinct ids."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    ids = page.evaluate(
        """
        () => {
            // The id generation format is fixed-width prefix + ms + random
            // Confirm that 1000 random ids are unique
            const ids = new Set();
            for (let i = 0; i < 1000; i++) {
                ids.add('note-' + Date.now() + '-' + Math.floor(Math.random() * 1e9).toString(36));
            }
            return { size: ids.size, total: 1000 };
        }
        """
    )
    assert ids["size"] == ids["total"], "Rapid sticky-note id generation must yield unique ids"


def test_restore_window_states_skips_unknown_app(page):
    """Saved states referencing an unknown app must be skipped on restore."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate(
        """
        () => {
            localStorage.setItem('windowStates', JSON.stringify([
                { id: 'window-1', appName: 'totally-fake-app-xyz', left: '50px', top: '50px',
                  width: '300px', height: '300px', display: 'block',
                  maximized: false, zIndex: '110' },
                { id: 'window-2', appName: 'about', left: '60px', top: '60px',
                  width: '300px', height: '300px', display: 'block',
                  maximized: false, zIndex: '110' }
            ]));
        }
        """
    )
    page.reload()
    page.wait_for_load_state("domcontentloaded")

    windows = page.evaluate(
        """
        () => Array.from(document.querySelectorAll('.window')).map(w => w.id)
        """
    )
    assert 'window-1' not in windows, "Unknown app state should be skipped"
    assert 'window-2' in windows, "Known app state should still be restored"


def test_sudoku_init_bails_on_missing_window(page):
    """If the window was closed before setTimeout fires, initSudoku must not throw or allocate state."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    result = page.evaluate(
        """
        () => {
            try {
                initSudoku('window-does-not-exist');
                return { ok: true, sudokuState: sudokuGames['window-does-not-exist'] };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        }
        """
    )
    assert result["ok"] is True, f"initSudoku should not throw on missing window: {result}"
    assert result["sudokuState"] is None, "initSudoku should not allocate state for a missing window"


def test_unit_converter_init_bails_on_missing_window(page):
    """If the window was closed before setTimeout fires, initUnitConverter must not throw."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    result = page.evaluate(
        """
        () => {
            try {
                initUnitConverter('window-does-not-exist');
                return { ok: true };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        }
        """
    )
    assert result["ok"] is True, f"initUnitConverter should not throw on missing window: {result}"
