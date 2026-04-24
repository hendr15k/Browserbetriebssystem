import os
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="module")
def app_url():
    return f"file://{os.path.abspath('index.html')}"

def test_code_editor_open(page: Page, app_url):
    page.goto(app_url)
    # Click the "Code Editor" icon
    page.click(".icon:has-text('Code')")

    # Check if window opened
    window = page.locator(".code-editor-window")
    expect(window).to_be_visible()

    # Check for toolbar
    toolbar = window.locator(".code-editor-toolbar")
    expect(toolbar).to_be_visible()

    # Check for gutter and textarea
    gutter = window.locator(".code-gutter")
    expect(gutter).to_be_visible()
    # Initially 1 line
    expect(gutter).to_contain_text("1")

    textarea = window.locator(".code-textarea")
    expect(textarea).to_be_visible()

def test_code_editor_input_lines(page: Page, app_url):
    page.goto(app_url)
    page.click(".icon:has-text('Code')")

    textarea = page.locator(".code-textarea")
    gutter = page.locator(".code-gutter")

    # Type 3 lines
    textarea.fill("Line 1\nLine 2\nLine 3")

    # Check gutter has 3 divs
    expect(gutter.locator("div")).to_have_count(3)
    expect(gutter.locator("div").nth(0)).to_have_text("1")
    expect(gutter.locator("div").nth(1)).to_have_text("2")
    expect(gutter.locator("div").nth(2)).to_have_text("3")

def test_code_editor_tab(page: Page, app_url):
    page.goto(app_url)
    page.click(".icon:has-text('Code')")

    textarea = page.locator(".code-textarea")
    textarea.focus()
    page.keyboard.press("Tab")

    # Check value has 4 spaces
    expect(textarea).to_have_value("    ")

def test_code_editor_save(page: Page, app_url):
    page.goto(app_url)
    page.click(".icon:has-text('Code')")

    textarea = page.locator(".code-textarea")
    textarea.fill("console.log('Hello');")

    # Mock prompt
    page.on("dialog", lambda dialog: dialog.accept("test_script.js"))

    # Click Save button in toolbar
    # Look for button inside toolbar specifically
    page.click(".code-editor-toolbar button:has-text('Save')")

    # Verify file saved in fileSystem
    # Wait a bit for execution
    page.wait_for_timeout(500)

    content = page.evaluate("window.fileSystem['test_script.js']")
    assert content == "console.log('Hello');"
