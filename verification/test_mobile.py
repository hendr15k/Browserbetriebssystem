import pytest
import os
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "viewport": {"width": 375, "height": 812},
        "is_mobile": True,
        "has_touch": True
    }

def test_mobile_view(page: Page):
    # Load the local file
    cwd = os.getcwd()
    page.goto(f"file://{cwd}/index.html")

    # Wait for desktop to load
    page.wait_for_selector("#desktop")

    # Open Calculator (it should maximize automatically)
    page.evaluate("openApp('calculator')")

    # Wait for window to appear
    page.wait_for_selector(".window.calculator-window")

    # Screenshot calculator maximized
    page.screenshot(path="verification/mobile_view_calculator.png")

    # Also check Start Menu full width
    page.evaluate("toggleStartMenu()")
    page.wait_for_selector("#start-menu", state="visible")
    page.screenshot(path="verification/mobile_view_startmenu.png")

    # Test Paint drawing
    # Reload to clear
    page.reload()
    page.evaluate("openApp('paint')")
    # Wait for window-0 again, or window-1 if counter incremented (reload resets JS state, so window-0)
    page.wait_for_selector("#paint-canvas-window-0")

    canvas = page.locator("#paint-canvas-window-0")
    box = canvas.bounding_box()

    # Start touch via touchscreen API
    page.touchscreen.tap(box['x'] + 50, box['y'] + 50)

    # Let's trigger touch events via JS to be sure my listener works.
    page.evaluate("""
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();

        const touchStart = new Touch({
            identifier: 0,
            target: canvas,
            clientX: rect.left + 50,
            clientY: rect.top + 50
        });

        const touchMove = new Touch({
            identifier: 0,
            target: canvas,
            clientX: rect.left + 100,
            clientY: rect.top + 100
        });

        const touchEnd = new Touch({
            identifier: 0,
            target: canvas,
            clientX: rect.left + 100,
            clientY: rect.top + 100
        });

        const startEvent = new TouchEvent('touchstart', {
            touches: [touchStart],
            targetTouches: [touchStart],
            changedTouches: [touchStart],
            bubbles: true
        });

        const moveEvent = new TouchEvent('touchmove', {
            touches: [touchMove],
            targetTouches: [touchMove],
            changedTouches: [touchMove],
            bubbles: true
        });

        const endEvent = new TouchEvent('touchend', {
            touches: [touchEnd],
            targetTouches: [touchEnd],
            changedTouches: [touchEnd],
            bubbles: true
        });

        canvas.dispatchEvent(startEvent);
        canvas.dispatchEvent(moveEvent);
        canvas.dispatchEvent(endEvent);
    """)

    page.wait_for_timeout(500)
    page.screenshot(path="verification/mobile_view_paint.png")

