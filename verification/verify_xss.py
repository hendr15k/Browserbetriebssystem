
from playwright.sync_api import sync_playwright, expect
import os
import time

def verify_xss_safety():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Trigger XSS Notification
        page.evaluate("showNotification('XSS Test', '<img src=x onerror=alert(1)>')")
        time.sleep(0.5)

        # Verify safety
        notification = page.locator(".notification-toast", has_text="XSS Test")
        expect(notification).to_contain_text("<img src=x onerror=alert(1)>")

        page.screenshot(path="verification/verification_xss.png")
        browser.close()

if __name__ == "__main__":
    verify_xss_safety()
