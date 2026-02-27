
from playwright.sync_api import sync_playwright, expect
import os
import time

def test_new_features():
    # Get absolute path to index.html
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # 1. Test Taskbar Clock Click
        # Ensure clock is visible
        clock = page.locator("#clock")
        expect(clock).to_be_visible()

        # Click clock
        clock.click()

        # Verify Clock app opens
        clock_window = page.locator(".clock-window")
        expect(clock_window).to_be_visible()

        # Close Clock app
        clock_window.locator(".close-button").click()
        expect(clock_window).not_to_be_visible()

        # 2. Test Image Viewer
        # We need to simulate having an image file.
        # Since we can't easily upload a real image in this headless test without a file,
        # we'll inject an image into the virtual fileSystem via JS.

        page.evaluate("""
            fileSystem['test_image.png'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            saveFileSystem();
            // Refresh explorer if open, but it's not open yet.
        """)

        # Open File Explorer
        page.locator(".icon", has_text="Explorer").click()

        # Find the image file
        image_file = page.locator("#window-area .window-content > div > div", has_text="test_image.png")
        expect(image_file).to_be_visible()

        # Click to open
        image_file.click()

        # Verify Image Viewer opens
        image_viewer = page.locator(".image-viewer-window")
        expect(image_viewer).to_be_visible()

        # Verify content contains img tag with correct src start
        img_tag = image_viewer.locator("img")
        expect(img_tag).to_be_visible()
        src = img_tag.get_attribute("src")
        assert src.startswith("data:image/png;base64"), "Image source should be a data URL"

        # Close Image Viewer
        image_viewer.locator(".close-button").click()
        expect(image_viewer).not_to_be_visible()

        # 3. Test Notifications (Basic Check)
        # We know a welcome notification fires on load.
        # Or we can trigger one manually to be sure timing isn't an issue.
        page.evaluate("showNotification('Test Title', 'Test Message')")

        notification = page.locator(".notification-toast", has_text="Test Title")
        expect(notification).to_be_visible()
        expect(notification).to_contain_text("Test Message")

        browser.close()

if __name__ == "__main__":
    test_new_features()
