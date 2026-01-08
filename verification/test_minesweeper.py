
from playwright.sync_api import sync_playwright, expect
import os

def test_minesweeper():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        print("Opening Minesweeper...")
        # Check if icon exists
        expect(page.locator(".icon", has_text="Minesweeper")).to_be_visible()
        page.locator(".icon", has_text="Minesweeper").click()

        # Check if window opened by looking for title bar
        expect(page.locator(".title-bar-text", has_text="Minesweeper")).to_be_visible()

        # Check for grid
        expect(page.locator(".minesweeper-grid")).to_be_visible()

        # Check for cells (9x9 = 81)
        cells = page.locator(".minesweeper-cell")
        count = cells.count()
        print(f"Found {count} cells")
        assert count == 81

        browser.close()

if __name__ == "__main__":
    test_minesweeper()
