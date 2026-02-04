from playwright.sync_api import sync_playwright, expect
import os
import json

def test_markdown_viewer():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Inject a markdown file
        md_content = "# Hello World\nThis is a **bold** test."
        filename = "test_doc.md"

        js_content = json.dumps(md_content)

        page.evaluate(f"""
            fileSystem['{filename}'] = {js_content};
            saveFileSystem();
        """)

        # Open File Explorer
        page.evaluate("openApp('file-explorer')")

        # Wait for explorer content
        page.wait_for_selector(f"text={filename}")

        # Click the file
        page.locator(f"text={filename}").click()

        # Check for Markdown Viewer Window class
        expect(page.locator(".markdown-window")).to_be_visible()

        # Check title if possible (should be filename)
        expect(page.locator(".markdown-window .title-bar-text")).to_have_text(filename)

        # Wait for content
        expect(page.locator("h1", has_text="Hello World")).to_be_visible()
        expect(page.locator("strong", has_text="bold")).to_be_visible()

        print("Markdown Viewer Test Passed")
        browser.close()

if __name__ == "__main__":
    test_markdown_viewer()
