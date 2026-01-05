from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the index.html from the current directory
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Open Terminal
        page.click("text=Terminal")

        # 2. Type 'open' command
        # It seems the previous attempt to open notepad might have failed or it takes time to populate?
        # Let's try to list files first to ensure system is loaded?
        page.fill("input.terminal-input", "ls")
        page.press("input.terminal-input", "Enter")
        page.wait_for_timeout(500) # Wait a bit

        page.fill("input.terminal-input", "open readme.txt")
        page.press("input.terminal-input", "Enter")

        # 3. Verify Notepad opens with readme.txt content
        # Note: We expect a new window to appear with title "Notepad"
        # and textarea should contain "Welcome to WebOS"
        # We need to be more specific with the selector to avoid matching "Paint" if it has "Notepad" text (unlikely)
        # But wait, Paint opens later.

        # Use to_have_value instead of contain_text for textarea
        notepad_area = page.locator(".notepad-area")
        expect(notepad_area).to_have_value("Welcome to WebOS! This is a simple browser-based OS.")

        # 4. Open Paint using 'open' command
        # Create a dummy file in fileSystem using JS
        page.evaluate("fileSystem['test.png'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';")

        page.fill("input.terminal-input", "open test.png")
        page.press("input.terminal-input", "Enter")

        # 5. Verify Paint opens
        # We target the window that has class 'paint-window'
        paint_window = page.locator(".window.paint-window")
        expect(paint_window).to_be_visible()

        # 6. Verify "Save to System" button exists in Paint
        # Restrict scope to Paint window
        download_btn = paint_window.locator("button:has-text('Download')")
        save_btn = paint_window.locator("button:has-text('Save')")

        expect(download_btn).to_be_visible()
        expect(save_btn).to_be_visible()

        # Take screenshot
        page.screenshot(path="verification/test_features.png")
        print("Verification successful!")

        browser.close()

if __name__ == "__main__":
    run()
