from playwright.sync_api import sync_playwright, expect
import os

def test_markdown_editor():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(url)

        # Open Markdown Editor
        page.locator("#desktop .icon").filter(has_text="MD Editor").first.click()

        # Wait for window
        window = page.locator('.markdown-editor-window')
        expect(window).to_be_visible()

        # Check title
        expect(window.locator('.title-bar-text')).to_have_text("Markdown Editor")

        # Check split pane
        textarea = window.locator('.markdown-input')
        expect(textarea).to_be_visible()

        preview = window.locator('.markdown-preview')
        expect(preview).to_be_visible()

        # Type markdown
        md_text = "# Hello\n\nThis is **bold**."
        textarea.fill(md_text)

        # Verify preview updates
        expect(preview.locator("h1")).to_have_text("Hello")
        expect(preview.locator("strong")).to_have_text("bold")

        print("Markdown Editor Test Passed")
        browser.close()

if __name__ == "__main__":
    test_markdown_editor()
