import os
from playwright.sync_api import sync_playwright, expect

def test_markdown_editor():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Markdown Editor from Desktop Icon
        # The icon has label "MD Editor"
        page.locator(".icon", has_text="MD Editor").click()

        # Wait for window
        expect(page.locator(".markdown-editor-window")).to_be_visible()

        # Type into textarea
        textarea = page.locator(".markdown-editor-textarea")
        # fill triggers input event
        textarea.fill("# Hello Playwright\nThis is a **live** preview.")

        # Check Preview Pane
        preview = page.locator(".markdown-preview")
        expect(preview.locator("h1")).to_have_text("Hello Playwright")
        expect(preview.locator("strong")).to_have_text("live")

        # Handle Prompt (for filename) and Alert (confirmation)
        def handle_dialog(dialog):
            print(f"Dialog type: {dialog.type}, message: {dialog.message}")
            if dialog.type == "prompt":
                dialog.accept("my_notes.md")
            elif dialog.type == "alert":
                dialog.accept()

        page.on("dialog", handle_dialog)

        # Click Save Button
        page.locator("button", has_text="Save").click()

        # Check if file exists in fileSystem via JS
        exists = page.evaluate("fileSystem['my_notes.md'] !== undefined")
        assert exists, "File 'my_notes.md' was not saved to fileSystem"

        content = page.evaluate("fileSystem['my_notes.md']")
        assert "# Hello Playwright" in content, "File content mismatch"

        print("Markdown Editor Test Passed")
        browser.close()

if __name__ == "__main__":
    test_markdown_editor()
