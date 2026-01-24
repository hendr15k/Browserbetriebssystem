import os
import sys
from playwright.sync_api import sync_playwright

def verify_browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set viewport
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Construct file URL
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # Check Desktop Icon
        icon = page.locator(".icon").filter(has_text="Browser").first

        if icon.count() == 0:
            print("Web Browser icon not found on desktop.")
            sys.exit(1)

        print("Clicking Web Browser icon...")
        icon.click()

        # Wait for window
        try:
            page.wait_for_selector(".browser-window", timeout=3000)
            page.wait_for_timeout(1000) # Wait for animation/render
        except:
            print("Browser window did not open.")
            sys.exit(1)

        # Check Iframe
        iframe = page.locator("iframe.browser-content")
        if iframe.count() > 0:
            print("Iframe found.")
        else:
            print("Iframe not found.")
            sys.exit(1)

        # Take Screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved to verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_browser()
