from playwright.sync_api import sync_playwright
import os

def verify_markdown_editor_visual():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto(url)

        # Open Markdown Editor
        page.click("#start-button")
        page.click("text=Markdown Editor")

        # Wait for window
        page.wait_for_selector(".markdown-editor-window")

        # Type some content
        content = """# Markdown Editor Demo
* This is a list item
* This is another item

## Subheader
**Bold Text** and *Italic Text*.

[Link to Google](https://google.com)
"""
        page.fill("textarea.markdown-editor-pane", content)

        # Wait for preview to update
        page.wait_for_selector(".markdown-preview-pane h1")

        # Take screenshot
        page.screenshot(path="verification/markdown_editor_visual.png")
        browser.close()

if __name__ == "__main__":
    verify_markdown_editor_visual()
