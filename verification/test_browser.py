from playwright.sync_api import sync_playwright, expect
import os

def test_browser(page):
    page.goto("file://" + os.path.abspath("index.html"))

    # Click "Web Browser" icon on Desktop
    # Using exact text match if possible or contain
    page.locator(".icon", has_text="Web Browser").click()

    # Check window opens
    window = page.locator(".window", has_text="Web Browser")
    expect(window).to_be_visible()

    # Check for toolbar elements
    toolbar = window.locator(".browser-toolbar")
    expect(toolbar).to_be_visible()

    expect(toolbar.locator("button", has_text="Back")).to_be_visible()
    expect(toolbar.locator("button", has_text="Forward")).to_be_visible()
    expect(toolbar.locator("button", has_text="Refresh")).to_be_visible()
    expect(toolbar.locator("button", has_text="Home")).to_be_visible()

    url_input = toolbar.locator("input[type='text']")
    expect(url_input).to_be_visible()
    # Check default value
    expect(url_input).to_have_value("https://www.wikipedia.org")

    # Check iframe
    iframe = window.locator("iframe")
    expect(iframe).to_be_visible()
    expect(iframe).to_have_attribute("src", "https://www.wikipedia.org")

    # Test Navigation
    url_input.fill("https://example.com")
    toolbar.locator("button", has_text="Go").click()

    # Expect iframe src to update
    expect(iframe).to_have_attribute("src", "https://example.com")

    # Take screenshot
    page.screenshot(path="verification/browser.png")


if __name__ == "__main__":
    test_browser()
