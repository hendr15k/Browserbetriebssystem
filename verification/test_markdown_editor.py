from playwright.sync_api import sync_playwright, expect
import os

def test_markdown_editor(page):
    page.goto("file://" + os.path.abspath("index.html"))

    # Open Markdown Editor from Start Menu
    # page.click("#start-button")
    # Use exact text match or specific selector if needed
    page.evaluate("openApp('markdown-editor')")

    # Check for Editor Window
    expect(page.locator(".markdown-editor-window")).to_be_visible()

    # Type in the editor
    # The selector might match multiple if multiple windows, but we just opened one.
    editor = page.locator("textarea.markdown-editor-pane")
    editor.fill("# Hello Editor\nThis is a **preview** test.")

    # Check Preview Pane
    preview = page.locator(".markdown-preview-pane")
    expect(preview.locator("h1")).to_have_text("Hello Editor")
    expect(preview.locator("strong")).to_have_text("preview")

    # Test Save
    # Handle Prompt (first for filename, second for alert "File saved")
    # We need to handle multiple dialogs.

    dialog_count = 0
    def handle_dialog(dialog):
        nonlocal dialog_count
        dialog_count += 1
        if dialog.type == "prompt":
            dialog.accept("new_doc.md")
        else:
            dialog.accept() # Alert

    page.on("dialog", handle_dialog)

    # Click Save
    page.click("button:text('Save')")

    # Verify file is saved in fileSystem
    saved_content = page.evaluate("fileSystem['new_doc.md']")
    assert saved_content == "# Hello Editor\nThis is a **preview** test."

    print("Markdown Editor Test Passed")

if __name__ == "__main__":
    test_markdown_editor()
