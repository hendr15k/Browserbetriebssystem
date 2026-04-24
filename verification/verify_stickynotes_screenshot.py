import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Load local file
        file_path = f"file://{os.getcwd()}/index.html"
        page.goto(file_path)

        # Open Sticky Notes
        page.click("#start-button")
        page.wait_for_selector("#start-menu", state="visible")
        page.click("text=Sticky Notes")

        # Check window appears
        page.wait_for_selector(".sticky-note-window", state="visible")

        # Type something
        test_text = "Verify Sticky Note Screenshot"
        page.fill(".sticky-note-textarea", test_text)

        time.sleep(1) # Wait for render/layout

        # Screenshot
        page.screenshot(path="verification/stickynotes.png")
        print("Screenshot saved to verification/stickynotes.png")

        browser.close()

if __name__ == "__main__":
    run()
