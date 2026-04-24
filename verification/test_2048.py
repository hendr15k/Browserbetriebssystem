from playwright.sync_api import sync_playwright, expect
import os

def test_2048_app(page):
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto(url)

    # Click on the 2048 icon on the desktop
    # Locate by text "2048" inside .icon-label
    icon = page.locator("#desktop .icon").filter(has_text="2048").first
    expect(icon).to_be_visible()
    icon.click()

    # Wait for the window to open
    window = page.locator('.game-2048-window')
    expect(window).to_be_visible()

    # Check for title
    expect(window.locator('.title-bar-text')).to_have_text("2048")

    # Check for grid
    grid = window.locator('.game-2048-grid')
    expect(grid).to_be_visible()

    # Check for cells (should be 16)
    cells = grid.locator('.game-2048-cell')
    expect(cells).to_have_count(16)

    # Check for tiles (should be 2 initially)
    # Note: waitFor might be needed if animation, but our init is synchronous in setTimeout
    tiles = grid.locator('.game-2048-tile')
    # Wait for at least one tile to ensure JS ran
    tiles.first.wait_for()
    expect(tiles).to_have_count(2)

    # Take screenshot
    page.screenshot(path='verification/2048_game.png')
    print("2048 App Test Passed")


if __name__ == "__main__":
    test_2048_app()
