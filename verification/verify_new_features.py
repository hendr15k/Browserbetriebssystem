from playwright.sync_api import sync_playwright, expect
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the index.html from the current directory
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Test Date Command
        page.click("text=Terminal")
        page.fill("input.terminal-input", "date")
        page.press("input.terminal-input", "Enter")

        page.wait_for_timeout(500)
        terminal_output = page.locator(".terminal-output")
        expect(terminal_output).to_contain_text("-")
        expect(terminal_output).to_contain_text(":")

        page.screenshot(path="verification/terminal_date.png")

        # Close Terminal
        page.click(".close-button")
        page.wait_for_timeout(200)

        # 2. Test Snake High Score
        page.click("text=Snake")
        page.wait_for_timeout(500)

        snake_window = page.locator(".snake-window")
        expect(snake_window).to_contain_text("High Score:")

        page.screenshot(path="verification/snake_highscore.png")

        # Close Snake
        page.click(".close-button")
        page.wait_for_timeout(200)

        # 3. Test Settings Reset
        page.click("text=Settings")
        settings_window = page.locator(".window:has-text('Settings')")

        expect(settings_window.locator("button:has-text('Reset to Defaults')")).to_be_visible()

        page.screenshot(path="verification/settings_reset.png")

        # Close Settings
        page.click(".close-button")
        page.wait_for_timeout(200)

        # 4. Test File Explorer Delete
        page.click("text=Explorer")
        explorer_window = page.locator(".window:has-text('File Explorer')")

        # We need to hover over a file to see the delete button
        # There should be 'readme.txt' by default
        file_item = explorer_window.locator("text=readme.txt").locator("..")
        file_item.hover()

        # Check if delete button appears (it has trash icon 🗑️)
        delete_btn = file_item.locator("text=🗑️")
        expect(delete_btn).to_be_visible()

        page.screenshot(path="verification/explorer_delete.png")

        # Close Explorer
        page.click(".close-button")
        page.wait_for_timeout(200)

        print("Screenshots generated!")
        browser.close()

if __name__ == "__main__":
    run()
