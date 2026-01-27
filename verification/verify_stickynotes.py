import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Load local file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Click Sticky Notes icon
        page.locator(".icon").filter(has_text="Sticky Notes").click()

        # Wait for window to appear
        note_window = page.locator(".stickynote-window").first
        note_window.wait_for()

        # Type text
        textarea = note_window.locator("textarea")
        textarea.fill("Hello Sticky Note!")

        # Change color to Green (second button)
        note_window.locator("button[title='Green']").click()

        # Wait a bit for save
        page.wait_for_timeout(1000)

        # Reload page to test persistence
        page.reload()

        # Check if note exists
        note_window = page.locator(".stickynote-window").first
        note_window.wait_for()

        # Check text
        textarea = note_window.locator("textarea")
        val = textarea.input_value()
        if val != "Hello Sticky Note!":
            print(f"Text mismatch: {val}")
            exit(1)

        # Take screenshot
        page.screenshot(path="verification/stickynotes.png")
        print("Verification successful!")

        browser.close()

if __name__ == "__main__":
    run()
