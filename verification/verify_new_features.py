
from playwright.sync_api import sync_playwright, expect
import os
import time

def verify_new_features():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # 1. Trigger Notification (for screenshot)
        page.evaluate("showNotification('Verification', 'This is a test notification for screenshot.')")

        # Test XSS safety in notification
        page.evaluate("showNotification('XSS Test', '<img src=x onerror=alert(1)>')")

        # Verify the HTML tag is rendered as text, not HTML
        # We look for the text literal "<img..."
        xss_notification = page.locator(".notification-toast", has_text="XSS Test")
        expect(xss_notification).to_contain_text("<img src=x onerror=alert(1)>")

        # Ensure no alert was triggered (Playwright handles dialogs via event, but we'd see it if we hooked it)
        # The content check is sufficient.

        time.sleep(0.5) # Wait for animation

        # 2. Open Clock App (for screenshot)
        page.locator("#clock").click()
        time.sleep(0.5)

        # 3. Open Image Viewer (for screenshot)
        page.evaluate("""
            fileSystem['screenshot_test.png'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            saveFileSystem();
        """)
        page.evaluate("openApp('image-viewer', 'screenshot_test.png')")
        time.sleep(0.5)

        # Arrange windows for screenshot
        # Move Image Viewer
        page.evaluate("""
            const win = document.querySelector('.image-viewer-window');
            if(win) { win.style.left = '300px'; win.style.top = '100px'; }
        """)

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        browser.close()

if __name__ == "__main__":
    verify_new_features()
