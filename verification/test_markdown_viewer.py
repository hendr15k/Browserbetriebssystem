import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function", autouse=True)
def set_viewport(page: Page):
    page.set_viewport_size({"width": 1920, "height": 1080})

def test_markdown_viewer(page: Page):
    page.goto("http://localhost:8000/index.html")

    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    # Inject test file
    page.evaluate("""
        if (typeof fileSystem !== 'undefined') {
            fileSystem['test.md'] = '# Hello World\\n**Bold Text**\\n- List Item\\n[Link](https://example.com)';
            saveFileSystem();
            console.log("Injected test.md");
        } else {
            console.error("fileSystem is undefined!");
        }
    """)

    # Open Explorer via Desktop Icon
    page.locator('.icon:has-text("Explorer")').click()

    # Wait for Explorer window
    page.wait_for_selector('.window .title-bar-text:has-text("File Explorer")')

    # Refresh explorer just in case
    page.click('button:has-text("Refresh")')

    # Find the test.md file
    file_item = page.locator('.window-content div').filter(has_text="test.md").last
    expect(file_item).to_be_visible()

    # Click it to open
    file_item.click()

    # Wait for Markdown Viewer window
    markdown_window = page.locator('.window .title-bar-text:has-text("Markdown Viewer")')
    expect(markdown_window).to_be_visible()

    # Check content
    content_area = page.locator('.markdown-viewer-window .markdown-content')

    # Check Header
    expect(content_area.locator('h1')).to_have_text("Hello World")

    # Check Bold
    expect(content_area.locator('strong')).to_have_text("Bold Text")

    # Check List
    expect(content_area.locator('li')).to_have_text("List Item")

    # Check Link
    link = content_area.locator('a')
    expect(link).to_have_text("Link")
    expect(link).to_have_attribute("href", "https://example.com")

    # Screenshot
    page.screenshot(path="verification/markdown_viewer.png")

    # Close window
    page.locator('.markdown-viewer-window .close-button').click(force=True)
    expect(markdown_window).not_to_be_visible()

def test_markdown_viewer_start_menu(page: Page):
    page.goto("http://localhost:8000/index.html")

    # Open Start Menu
    page.click('#start-button')

    # Click Markdown Viewer
    page.click('.start-item:has-text("Markdown Viewer")')

    # Wait for window
    markdown_window = page.locator('.window .title-bar-text:has-text("Markdown Viewer")')
    expect(markdown_window).to_be_visible()

    # Check default content (Welcome message)
    content_area = page.locator('.markdown-viewer-window .markdown-content')
    expect(content_area.locator('h1')).to_contain_text("Welcome to Markdown Viewer")
