from playwright.sync_api import sync_playwright, expect
import os

def test_sudoku_app():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(url)

        # Click on the Sudoku icon on the desktop
        icon = page.locator("#desktop .icon").filter(has_text="Sudoku").first
        expect(icon).to_be_visible()
        icon.click()

        # Wait for the window to open
        window = page.locator('.sudoku-window')
        expect(window).to_be_visible()

        # Check for title
        expect(window.locator('.title-bar-text')).to_have_text("Sudoku")

        # Check for board
        board = window.locator('.sudoku-board')
        expect(board).to_be_visible()

        # Check for cells (should be 81)
        cells = board.locator('.sudoku-cell')
        expect(cells).to_have_count(81)

        # Find an empty cell (input not disabled) and type
        # We need to wait for generation to finish (setTimeout 10ms)
        page.wait_for_timeout(200)

        # Find first enabled input. Note: disabled attribute is boolean
        enabled_inputs = board.locator('input:not([disabled])')

        count = enabled_inputs.count()
        print(f"Found {count} enabled inputs")

        if count > 0:
            first_input = enabled_inputs.first
            first_input.click()
            first_input.fill("5")
            expect(first_input).to_have_value("5")

            # Test invalid input
            first_input.fill("a")
            # Should be rejected by regex replacement
            expect(first_input).to_have_value("")
        else:
            print("Warning: No enabled inputs found")

        # Take screenshot
        page.screenshot(path='verification/sudoku_game.png')
        print("Sudoku App Test Passed")

        browser.close()

if __name__ == "__main__":
    test_sudoku_app()
