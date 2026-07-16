"""Regression tests for bugs fixed in script.js.

Each test name maps to a fix described in the recent "bug fixes" commit.
"""

import pytest


def test_window_states_restore_advances_window_count(page):
    """After restoring windows with explicit IDs, new windows must NOT reuse those IDs.

    Bug: windowCount was not advanced past restored IDs, so a fresh openApp() call
    could reuse IDs like "window-0" that were already on restored windows.
    """
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate(
        """
        () => {
            const states = [
                { id: 'window-5', appName: 'about', left: '100px', top: '100px',
                  width: '300px', height: '300px', display: 'block',
                  maximized: false, zIndex: '110' },
                { id: 'window-7', appName: 'about', left: '120px', top: '100px',
                  width: '300px', height: '300px', display: 'block',
                  maximized: false, zIndex: '110' }
            ];
            localStorage.setItem('windowStates', JSON.stringify(states));
        }
        """
    )

    page.reload()
    page.wait_for_load_state("domcontentloaded")

    new_id = page.evaluate("openApp('about')")
    page.wait_for_function(
        "document.getElementById(" + repr(new_id) + ") !== null"
    )

    duplicate_count = page.evaluate(
        """
        () => {
            const ids = Array.from(document.querySelectorAll('.window')).map(w => w.id);
            const seen = new Set();
            let dups = 0;
            for (const id of ids) {
                if (seen.has(id)) dups++;
                seen.add(id);
            }
            return dups;
        }
        """
    )
    assert duplicate_count == 0, "No duplicate window IDs after restore + new openApp"


def test_terminal_states_cleaned_up_on_close(page):
    """Closing a Terminal window should remove its entry from terminalStates."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("openApp('terminal')")
    page.wait_for_selector(".terminal-window", timeout=5000)

    terminal_id = page.evaluate(
        """
        () => {
            const w = document.querySelector('.terminal-window');
            return w ? w.id : null;
        }
        """
    )
    assert terminal_id is not None

    page.evaluate(
        """
        (id) => {
            const w = document.getElementById(id);
            w.classList.add('window-closing');
            w.dispatchEvent(new Event('animationend'));
        }
        """,
        terminal_id,
    )

    has_state = page.evaluate(
        """
        (id) => typeof terminalStates !== 'undefined' && !!terminalStates[id]
        """,
        terminal_id,
    )
    assert has_state is False, "terminalStates entry should be removed after close"


def test_shutdown_screen_id_isolation(page):
    """updateClock() must not overwrite the shutdown screen content."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("shutdownSystem()")

    title_text = page.evaluate(
        """
        () => document.getElementById('shutdown-title') ? document.getElementById('shutdown-title').textContent : null
        """
    )
    assert title_text == "System"

    page.wait_for_timeout(2500)

    shutdown_title = page.evaluate(
        """
        () => document.getElementById('shutdown-title') ? document.getElementById('shutdown-title').textContent : null
        """
    )
    shutdown_msg = page.evaluate(
        """
        () => document.getElementById('shutdown-message') ? document.getElementById('shutdown-message').textContent : null
        """
    )
    assert shutdown_title == "System"
    assert shutdown_msg and "heruntergefahren" in shutdown_msg


def test_speak_text_null_guard(page):
    """speakText must not throw when called for a non-existent windowId."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    error = page.evaluate(
        """
        () => {
            try {
                speakText('window-that-does-not-exist');
                return null;
            } catch (e) {
                return String(e);
            }
        }
        """
    )
    assert error is None, f"speakText should not throw, got: {error!r}"


def test_play_tic_tac_toe_null_guard(page):
    """playTicTacToe on closed window must not throw."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    error = page.evaluate(
        """
        () => {
            try {
                playTicTacToe('window-that-does-not-exist', 0);
                return null;
            } catch (e) {
                return String(e);
            }
        }
        """
    )
    assert error is None, f"playTicTacToe should not throw, got: {error!r}"


def test_perform_cleanup_handles_drag_during_close(page):
    """Closing a window mid-drag should release document-level drag listeners."""
    page.evaluate("localStorage.clear()")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("openApp('about')")
    page.wait_for_selector(".window .title-bar", timeout=5000)

    result = page.evaluate(
        """
        () => {
            try {
                const w = document.querySelector('.window');
                if (!w) return { ok: false, error: 'no window' };
                const id = w.id;
                const fakeEvent = {
                    clientX: 100,
                    clientY: 100,
                    touches: [{ clientX: 100, clientY: 100 }],
                    target: w.querySelector('.title-bar'),
                    preventDefault: () => {}
                };
                startDrag(fakeEvent, id);
                w.classList.add('window-closing');
                w.dispatchEvent(new Event('animationend'));
                document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500 }));
                return {
                    ok: true,
                    isDragging: typeof isDragging !== 'undefined' ? isDragging : null
                };
            } catch (e) {
                return { ok: false, error: String(e) };
            }
        }
        """
    )
    assert result["ok"], f"Close-while-dragging should not throw: {result}"
    assert result["isDragging"] is False, "isDragging flag must be cleared after close"
