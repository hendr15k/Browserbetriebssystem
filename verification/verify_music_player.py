import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path to index.html
        cwd = os.getcwd()
        filepath = f"file://{cwd}/index.html"

        print(f"Navigating to {filepath}")
        page.goto(filepath)

        # Wait for desktop to load
        page.wait_for_selector("#desktop")

        # Open Music Player via Desktop Icon
        # Look for the Music icon
        print("Clicking Music icon...")
        # The icon has a label "Music"
        page.click(".icon:has-text('Music')")

        # Wait for window to open
        print("Waiting for Music Player window...")
        music_window = page.wait_for_selector(".music-player-window")

        # Take screenshot of Music Player
        page.screenshot(path="verification/music_player.png")
        print("Screenshot of Music Player saved to verification/music_player.png")

        # Test Show Desktop
        # Click the Show Desktop button (it has title "Show Desktop")
        print("Clicking Show Desktop button...")
        page.click("button[title='Show Desktop']")

        # Wait a bit for animation/hide
        time.sleep(1)

        # Verify window is hidden
        if not music_window.is_visible():
            print("Music Player window is hidden.")
        else:
            print("Music Player window is NOT hidden.")

        page.screenshot(path="verification/desktop_shown.png")
        print("Screenshot of Desktop (hidden windows) saved to verification/desktop_shown.png")

        # Click Show Desktop again to restore
        print("Clicking Show Desktop button again...")
        page.click("button[title='Show Desktop']")
        time.sleep(1)

        if music_window.is_visible():
            print("Music Player window is restored.")
        else:
            print("Music Player window is NOT restored.")

        page.screenshot(path="verification/desktop_restored.png")
        print("Screenshot of Desktop (restored windows) saved to verification/desktop_restored.png")

        browser.close()

if __name__ == "__main__":
    run()
