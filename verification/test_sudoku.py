from playwright.sync_api import sync_playwright, expect
import os
import re

def test_sudoku_app():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(url)

        # Open Sudoku
        page.locator("#desktop .icon").filter(has_text="Sudoku").first.click()

        # Wait for window
        window = page.locator('.sudoku-window')
        expect(window).to_be_visible()

        # Check title
        expect(window.locator('.title-bar-text')).to_have_text("Sudoku")

        # Check board
        board = window.locator('.sudoku-board')
        expect(board).to_be_visible()

        # Check cells count
        cells = board.locator('.sudoku-cell')
        expect(cells).to_have_count(81)

        # Check controls
        expect(window.locator('select.sudoku-difficulty')).to_be_visible()
        expect(window.locator('button', has_text="New Game")).to_be_visible()
        expect(window.locator('button', has_text="Check")).to_be_visible()

        # Test interaction: Select a cell and input number
        # Find an empty cell (not prefilled) using CSS selector
        empty_cell = page.locator(".sudoku-cell:not(.prefilled)").first
        empty_cell.click()

        # Click number 5 on numpad
        window.locator('.sudoku-numpad button', has_text="5").click()

        # Verify cell has 5
        expect(empty_cell).to_have_text("5")

        # Verify class contains user-filled
        expect(empty_cell).to_have_class(re.compile(r"user-filled"))

        print("Sudoku App Test Passed")
        browser.close()

if __name__ == "__main__":
    test_sudoku_app()
