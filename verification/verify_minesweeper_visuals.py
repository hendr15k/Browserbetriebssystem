
from playwright.sync_api import sync_playwright, expect
import os

def verify_minesweeper_visuals():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Minesweeper
        page.locator(".icon", has_text="Minesweeper").click()

        # Wait for window to render
        expect(page.locator(".minesweeper-window")).to_be_visible()

        # Click a center cell to reveal area (hopefully not a mine)
        # Use first click safety logic implemented
        # Row 4, Col 4 (index)
        page.locator("#ms-cell-window-0-4-4").click()

        # Wait a bit for flood fill if any
        page.wait_for_timeout(500)

        # Take screenshot
        page.screenshot(path="verification/minesweeper_screenshot.png")
        browser.close()

if __name__ == "__main__":
    verify_minesweeper_visuals()
