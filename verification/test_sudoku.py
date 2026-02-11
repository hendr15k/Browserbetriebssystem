import os
import re
from playwright.sync_api import sync_playwright, expect

def test_sudoku_app():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use large viewport to avoid overlapping icons
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(url)

        # Click on the Sudoku icon on the desktop
        # Locate by text "Sudoku" inside .icon-label
        icon = page.locator("#desktop .icon").filter(has_text="Sudoku").first
        expect(icon).to_be_visible()
        icon.click()

        # Wait for the window to open
        window = page.locator('.sudoku-window')
        expect(window).to_be_visible()

        # Check for title
        expect(window.locator('.title-bar-text')).to_have_text("Sudoku")

        # Check for grid
        grid = window.locator('.sudoku-grid')
        expect(grid).to_be_visible()

        # Check for cells (should be 81)
        cells = grid.locator('.sudoku-cell')
        expect(cells).to_have_count(81)

        # Find a non-fixed cell to interact with
        # .fixed class is added to fixed cells
        # We need a cell that does NOT have .fixed class
        # But initially all cells are generated. Some are fixed.
        # Let's find the first non-fixed cell.
        # Wait for generation to complete (it's fast but setTimeout 0)
        page.wait_for_timeout(500)

        non_fixed_cells = page.locator('.sudoku-cell:not(.fixed)')
        first_cell = non_fixed_cells.first
        first_cell.click()

        # Check if it has .selected class
        expect(first_cell).to_have_class(re.compile(r'selected'))

        # Input number 5
        # The window should be focused, but let's click first (done above).
        # We also added keyboard listener to window.
        page.keyboard.press("5")

        # Check if cell text is "5"
        expect(first_cell).to_have_text("5")

        # Take screenshot
        page.screenshot(path='verification/sudoku_game.png')
        print("Sudoku App Test Passed")

        browser.close()

if __name__ == "__main__":
    test_sudoku_app()
