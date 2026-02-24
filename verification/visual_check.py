import os
from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # 1. Piano
        page.locator(".icon").filter(has_text="Piano").click()
        page.locator(".piano-window").wait_for(state="visible")
        # Wait a bit for layout
        page.wait_for_timeout(500)
        page.screenshot(path="verification/piano_visual.png")
        print("Captured piano_visual.png")
        page.locator(".piano-window .close-button").click()

        # 2. PDF Viewer
        page.click("#start-button")
        page.locator(".start-item").filter(has_text="PDF Viewer").click()
        page.locator(".pdf-viewer-window").wait_for(state="visible")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/pdf_visual.png")
        print("Captured pdf_visual.png")
        page.locator(".pdf-viewer-window .close-button").click()

        browser.close()

if __name__ == "__main__":
    verify_visuals()
