
from playwright.sync_api import sync_playwright, expect
import os

def test_minesweeper(page):
    page.goto("file://" + os.path.abspath("index.html"))

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


if __name__ == "__main__":
    test_minesweeper()
