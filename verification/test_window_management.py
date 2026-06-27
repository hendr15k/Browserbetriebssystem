from playwright.sync_api import expect
import os


def _goto(page):
    page.goto("file://" + os.path.abspath("index.html"))
    page.set_viewport_size({"width": 1280, "height": 800})
    # Allow startup apps / welcome to settle
    page.wait_for_timeout(800)


def _open_clock(page):
    page.locator("#clock").click()
    win = page.locator(".clock-window")
    expect(win).to_be_visible()
    return win


def _open_about(page):
    # Open About via its desktop icon
    page.locator("#desktop-icons .icon", has_text="About").click()
    win = page.locator(".window[data-app-name='about']")
    expect(win).to_be_visible()
    return win


def test_window_snap_left(page):
    _goto(page)
    win = _open_clock(page)
    box = win.bounding_box()

    # Drag the title bar to the left edge of the screen
    tb = win.locator(".title-bar")
    start_x = box["x"] + box["width"] / 2
    start_y = box["y"] + 10
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    # Move in steps toward the left edge
    steps = 8
    for i in range(1, steps + 1):
        page.mouse.move(start_x - (start_x - 8) * (i / steps), 300)
    page.mouse.up()
    page.wait_for_timeout(200)

    classes = win.get_attribute("class")
    assert "snapped-left" in classes, f"Window should snap left, got classes: {classes}"
    left = win.evaluate("el => el.style.left")
    assert left == "0px", f"Snapped-left window should be at left:0, got {left}"


def test_window_snap_right(page):
    _goto(page)
    win = _open_clock(page)
    vw = page.evaluate("window.innerWidth")
    box = win.bounding_box()

    start_x = box["x"] + box["width"] / 2
    start_y = box["y"] + 10
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    steps = 8
    for i in range(1, steps + 1):
        page.mouse.move(start_x + (vw - start_x - 6) * (i / steps), 300)
    page.mouse.up()
    page.wait_for_timeout(200)

    classes = win.get_attribute("class")
    assert "snapped-right" in classes, f"Window should snap right, got classes: {classes}"


def test_window_snap_drag_away_restores(page):
    _goto(page)
    win = _open_clock(page)
    box = win.bounding_box()

    # Snap to the left
    start_x = box["x"] + box["width"] / 2
    start_y = box["y"] + 10
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    for i in range(1, 9):
        page.mouse.move(start_x - (start_x - 8) * (i / 8), 300)
    page.mouse.up()
    page.wait_for_timeout(150)
    assert "snapped-left" in win.get_attribute("class")

    # Now drag away toward the center → should unsnap
    tb = win.locator(".title-bar")
    tb_box = tb.bounding_box()
    cx = tb_box["x"] + 40
    cy = tb_box["y"] + 10
    page.mouse.move(cx, cy)
    page.mouse.down()
    for i in range(1, 9):
        page.mouse.move(cx + 200 * (i / 8), 350)
    page.mouse.up()
    page.wait_for_timeout(150)

    classes = win.get_attribute("class")
    assert "snapped-left" not in classes, "Dragging a snapped window away should restore it"


def test_window_snap_top_maximizes(page):
    _goto(page)
    win = _open_clock(page)
    box = win.bounding_box()

    start_x = box["x"] + box["width"] / 2
    start_y = box["y"] + 10
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    # Drag the title bar up to the very top edge
    for i in range(1, 9):
        page.mouse.move(start_x - 80 * (i / 8), box["y"] - box["y"] * (i / 8) + 6)
    page.mouse.up()
    page.wait_for_timeout(200)

    classes = win.get_attribute("class")
    assert "maximized" in classes, f"Dragging to the top edge should maximize the window, got: {classes}"


def test_escape_closes_start_menu(page):
    _goto(page)
    page.locator("#start-button").click()
    expect(page.locator("#start-menu")).to_be_visible()
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)
    display = page.locator("#start-menu").get_attribute("style") or ""
    assert "display: none" in display or "display:none" in display, "Escape should close the start menu"


def test_show_desktop_shortcut(page):
    _goto(page)
    win = _open_clock(page)
    expect(win).to_be_visible()
    # Ctrl+Shift+D is the reliable fallback for Show Desktop
    page.keyboard.press("Control+Shift+D")
    page.wait_for_timeout(200)
    is_hidden = win.evaluate("el => getComputedStyle(el).display") == "none"
    if not is_hidden:
        page.keyboard.press("Control+Shift+D")
        page.wait_for_timeout(200)
        is_hidden = win.evaluate("el => getComputedStyle(el).display") == "none"
    assert is_hidden, "Ctrl+Shift+D should hide all windows (Show Desktop)"


def test_close_focused_window_shortcut(page):
    _goto(page)
    win = _open_clock(page)
    win_id = win.get_attribute("id")
    page.keyboard.press("Control+Alt+W")
    page.wait_for_timeout(300)
    exists = page.evaluate(f"!!document.getElementById({repr(win_id)})")
    assert not exists, "Ctrl+Alt+W should close the focused window"


def test_alt_tab_switches_focus(page):
    _goto(page)
    win_a = _open_clock(page)  # opened first
    win_b = _open_about(page)  # opened second -> focused
    win_a_id = win_a.get_attribute("id")
    win_b_id = win_b.get_attribute("id")

    # Initially B is focused (no inactive), A is inactive
    assert "inactive" in page.evaluate(f"document.getElementById({repr(win_a_id)}).className")
    assert "inactive" not in page.evaluate(f"document.getElementById({repr(win_b_id)}).className")

    page.keyboard.press("Alt+Tab")
    page.wait_for_timeout(150)

    # After Alt+Tab, A should be focused and B inactive
    assert "inactive" not in page.evaluate(f"document.getElementById({repr(win_a_id)}).className")
    assert "inactive" in page.evaluate(f"document.getElementById({repr(win_b_id)}).className")


def test_window_drag_via_touch(page):
    _goto(page)
    win = _open_clock(page)
    before = win.evaluate("el => el.style.left")
    moved = page.evaluate("""
        (win) => {
            const tb = win.querySelector('.title-bar');
            const rect = tb.getBoundingClientRect();
            const start = new Touch({identifier: 1, target: tb,
                clientX: rect.x + 20, clientY: rect.y + 10});
            tb.dispatchEvent(new TouchEvent('touchstart',
                {touches: [start], cancelable: true}));
            const mv = new Touch({identifier: 1, target: tb,
                clientX: 360, clientY: 360});
            document.dispatchEvent(new TouchEvent('touchmove',
                {touches: [mv], changedTouches: [mv], cancelable: true}));
            document.dispatchEvent(new TouchEvent('touchend',
                {changedTouches: [mv], cancelable: true}));
            return win.style.left;
        }
    """, win.element_handle())
    assert moved != before, "Touch drag should move the window"