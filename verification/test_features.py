
from playwright.sync_api import sync_playwright, expect
import os

def test_features(page):
    # Get absolute path to index.html
    page.goto("file://" + os.path.abspath("index.html"))

    # Wait for startup apps to open, then close them to avoid interference
    page.wait_for_timeout(1500)
    page.evaluate("""() => {
        document.querySelectorAll('.window .close-button').forEach(btn => btn.click());
    }""")
    page.wait_for_selector("#desktop")

    # 1. Test Terminal History
    # Open Terminal
    page.locator(".icon", has_text="Terminal").click()
    terminal_input = page.locator(".terminal-input")
    expect(terminal_input).to_be_visible()

    # Type commands
    terminal_input.fill("date")
    terminal_input.press("Enter")
    terminal_input.fill("whoami")
    terminal_input.press("Enter")

    # Test ArrowUp
    terminal_input.press("ArrowUp")
    expect(terminal_input).to_have_value("whoami")
    terminal_input.press("ArrowUp")
    expect(terminal_input).to_have_value("date")

    # Test ArrowDown
    terminal_input.press("ArrowDown")
    expect(terminal_input).to_have_value("whoami")

    # Close Terminal (scope to terminal window to avoid matching startup app windows)
    page.locator(".terminal-window .close-button").click()

    # 2. Test Tic Tac Toe
    # Open App
    page.locator(".icon", has_text="Tic Tac Toe").click()
    expect(page.locator("text=Player X's Turn")).to_be_visible()

    # Play a move
    # IDs are dynamic with window ID. We need to find the cells.
    # The window ID is generated. We can find cells inside the active window.
    cells = page.locator(".ttt-cell")
    cells.nth(0).click() # X at 0
    expect(cells.nth(0)).to_have_text("X")
    expect(page.locator("text=Player O's Turn")).to_be_visible()

    cells.nth(1).click() # O at 1
    expect(cells.nth(1)).to_have_text("O")
    expect(page.locator("text=Player X's Turn")).to_be_visible()

    # Close Tic Tac Toe (scope to the window containing ttt-cell)
    page.locator(".window:has(.ttt-cell) .close-button").click()

    # 3. Test File Explorer Rename
    # Open Explorer
    page.locator(".icon", has_text="Explorer").click()

    # Find a file (readme.txt is default)
    file_item = page.locator("#window-area .window-content > div > div", has_text="readme.txt")
    file_item.hover()

    # Click Rename (pencil)
    # We need to handle the prompt
    def handle_dialog(dialog):
        if "Rename" in dialog.message:
            dialog.accept("newname.txt")
        else:
            dialog.accept()

    page.on("dialog", handle_dialog)

    rename_btn = file_item.locator("div[title='Rename']")
    rename_btn.click()

    # Verify rename
    expect(page.locator("#window-area .window-content").last).to_contain_text("newname.txt")
    expect(page.locator("#window-area .window-content").last).not_to_contain_text("readme.txt")

    # Take Screenshot
    page.screenshot(path="verification/verification.png")


if __name__ == "__main__":
    test_features()
