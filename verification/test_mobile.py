from playwright.sync_api import sync_playwright

def test_mobile_view():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport size AND enable has_touch
        context = browser.new_context(viewport={'width': 375, 'height': 667}, has_touch=True)
        page = context.new_page()

        # Load the local file
        import os
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

        # Simulate touch drawing
        # Playwright's touch support is a bit limited in high level API, but we enabled has_touch.
        # Let's try simple tap, and then perhaps direct dispatch event via evaluation if needed.
        # But wait, my code dispatches mouse events on touch events.
        # So I need to simulate TOUCH events.

        # Use CDPJession to synthesize touch events if needed, but page.touchscreen.tap works for tap.
        # For drag:

        # Start touch
        page.touchscreen.tap(box['x'] + 50, box['y'] + 50)

        # Manual touch sequence for drawing line
        # Note: Playwright API doesn't have a simple "touch drag".
        # We can use CDP directly or just evaluate JS to fire events.
        # But 'page.mouse' usage in previous script was wrong for touch simulation.

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

        browser.close()

if __name__ == "__main__":
    test_mobile_view()
