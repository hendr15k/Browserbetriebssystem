from playwright.sync_api import sync_playwright, expect
import os

def run():

    # Load the page
    page.goto(f"file://{os.path.abspath('index.html')}")

    # 1. Open Video Player
    page.locator(".icon").filter(has_text="Video").click()

    # Check Video Player
    video_window = page.locator(".video-player-window")
    expect(video_window).to_be_visible()

    # Take a screenshot with Video Player open
    page.screenshot(path="verification/video_player_open.png")

    # 2. Open Terminal
    page.locator(".icon").filter(has_text="Terminal").click()
    expect(page.locator(".terminal-window")).to_be_visible()

    # 3. Use Show Desktop
    page.locator("#show-desktop").click()
    page.wait_for_timeout(500) # Wait for potential transition

    # Verify windows are hidden
    expect(video_window).not_to_be_visible()
    expect(page.locator(".terminal-window")).not_to_be_visible()

    # Take screenshot of desktop (windows hidden)
    page.screenshot(path="verification/desktop_shown.png")

    # 4. Show Desktop again (restore)
    page.locator("#show-desktop").click()
    page.wait_for_timeout(500)

    # Verify windows are visible
    expect(video_window).to_be_visible()
    expect(page.locator(".terminal-window")).to_be_visible()


if __name__ == "__main__":
    run()
