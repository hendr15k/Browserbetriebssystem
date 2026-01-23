
from playwright.sync_api import sync_playwright, expect
import os

def verify_browser():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Browser App
        # Note: Icon hasn't been added yet, but this script will be used after changes.
        # So it will fail now if I run it. That's fine.
        page.locator(".icon", has_text="Browser").click()

        # Check for window title
        # Window logic removes 'inactive' class when focused, doesn't necessarily add 'active'
        window = page.locator(".window").filter(has=page.locator(".title-bar-text", has_text="Web Browser"))
        expect(window).to_be_visible()

        # Check for toolbar elements
        toolbar = window.locator(".browser-toolbar")
        expect(toolbar).to_be_visible()
        expect(toolbar.locator("button", has_text="←")).to_be_visible()
        expect(toolbar.locator("button", has_text="→")).to_be_visible()
        expect(toolbar.locator("button", has_text="⟳")).to_be_visible()
        expect(toolbar.locator("button", has_text="🏠")).to_be_visible()

        # Check Address Bar
        address_bar = toolbar.locator("input[type='text']")
        expect(address_bar).to_be_visible()

        # Check Go Button
        go_btn = toolbar.locator("button", has_text="Go")
        expect(go_btn).to_be_visible()

        # Check Iframe
        iframe = window.locator("iframe")
        expect(iframe).to_be_visible()

        # Test Navigation
        address_bar.fill("https://example.com")
        go_btn.click()

        # Verify iframe src update (might not load content due to security, but src attribute should change)
        # We need to wait a bit or check the attribute
        expect(iframe).to_have_attribute("src", "https://example.com")

        # Take Screenshot
        page.screenshot(path="verification/browser_screenshot.png")

        print("Browser verification passed!")
        browser.close()

if __name__ == "__main__":
    verify_browser()
