from playwright.sync_api import sync_playwright, expect
import os
import time

def test_markdown_viewer():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        page.goto(url)

        # Clear local storage
        page.evaluate("localStorage.clear()")
        page.reload()

        # --- Test 1: Open via Explorer ---
        print("Testing Explorer integration...")
        page.locator(".icon", has_text="Explorer").click()

        explorer = page.locator(".window", has_text="File Explorer")
        expect(explorer).to_be_visible()

        # Use get_by_text with exact=True which should hit the nameDiv
        # Clicking nameDiv bubbles to fileDiv
        page.get_by_text("example.md", exact=True).click()

        viewer = page.locator(".window.markdown-viewer-window")
        expect(viewer).to_be_visible()
        expect(viewer.locator(".title-bar-text")).to_have_text("example.md")
        expect(viewer.locator("h1")).to_have_text("Welcome to Markdown")

        # Close viewer
        viewer.locator(".close-button").click()
        expect(viewer).not_to_be_visible()

        # Close Explorer
        explorer.locator(".close-button").click()

        # --- Test 2: Open via Terminal ---
        print("Testing Terminal integration...")
        page.locator(".icon", has_text="Terminal").click()
        terminal = page.locator(".window.terminal-window")
        expect(terminal).to_be_visible()

        terminal_input = terminal.locator(".terminal-input")
        terminal_input.fill("open example.md")
        terminal_input.press("Enter")

        viewer = page.locator(".window.markdown-viewer-window")
        expect(viewer).to_be_visible()
        expect(viewer.locator(".title-bar-text")).to_have_text("example.md")
        expect(viewer.locator("h1")).to_have_text("Welcome to Markdown")

        # --- Test 3: Link Navigation ---
        print("Testing Link Navigation...")
        link = viewer.locator("a", has_text="Links")
        link.click()

        browser_win = page.locator(".window.browser-window")
        expect(browser_win).to_be_visible()
        url_input = browser_win.locator(".browser-toolbar input")
        expect(url_input).to_have_value("https://www.google.com")

        # Screenshot
        page.screenshot(path="verification/markdown_viewer_verified.png")

        browser.close()

if __name__ == "__main__":
    test_markdown_viewer()
