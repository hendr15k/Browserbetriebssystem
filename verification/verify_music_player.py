import os
from playwright.sync_api import sync_playwright, expect

def test_music_player():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local index.html
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Wait for desktop to load
        page.wait_for_selector("#desktop")

        # Click the Music Player icon
        # The icon has text "Music"
        page.get_by_text("Music", exact=True).click()

        # Wait for the Music Player window to appear
        # It has class 'music-player-window'
        expect(page.locator(".music-player-window")).to_be_visible()

        # Verify title is "Music Player"
        expect(page.locator(".title-bar-text", has_text="Music Player")).to_be_visible()

        # Verify content elements
        expect(page.locator(".music-player-content")).to_be_visible()
        expect(page.get_by_text("No file selected")).to_be_visible()
        expect(page.get_by_text("Open Music File")).to_be_visible()

        # Take screenshot
        page.screenshot(path="verification/music_player.png")

        browser.close()

if __name__ == "__main__":
    test_music_player()
