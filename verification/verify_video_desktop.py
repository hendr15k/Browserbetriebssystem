import pytest
from playwright.sync_api import Page, expect

import os

def test_video_player_opens(page: Page):
    # Load the page
    page.goto(f"file://{os.path.abspath('index.html')}")

    # Open Video Player from Desktop
    page.locator(".icon").filter(has_text="Video").click()

    # Check if window opened
    window = page.locator(".video-player-window")
    expect(window).to_be_visible()

    # Check title
    expect(window.locator(".title-bar-text")).to_have_text("Video Player")

    # Check content
    expect(window.locator("video")).to_be_visible()
    expect(window.locator("label:has-text('Open Video')")).to_be_visible()

    # Close window
    window.locator(".close-button").click()
    expect(window).not_to_be_visible()

def test_show_desktop(page: Page):
    # Load the page
    page.goto(f"file://{os.path.abspath('index.html')}")

    # Open a window (Terminal)
    page.locator(".icon").filter(has_text="Terminal").click()
    terminal_window = page.locator(".terminal-window")
    expect(terminal_window).to_be_visible()

    # Click Show Desktop button
    page.locator("#show-desktop").click()

    # Verify window is hidden
    expect(terminal_window).not_to_be_visible()

    # Click Show Desktop button again
    page.locator("#show-desktop").click()

    # Verify window is visible again
    expect(terminal_window).to_be_visible()

def test_video_file_in_explorer(page: Page):
    # Load the page
    page.goto(f"file://{os.path.abspath('index.html')}")

    # This test assumes we can mock the file system or create a file first.
    # Since we can't easily interact with the `fileSystem` object directly from Playwright
    # (unless we evaluate JS), we will use eval.

    # Create a dummy video file in JS
    page.evaluate("""
        fileSystem['testvideo.mp4'] = 'blob:dummy';
        saveFileSystem();
    """)

    # Open Explorer
    page.locator(".icon").filter(has_text="Explorer").click()

    # Refresh explorer if needed or close and reopen
    # Explorer refreshes on open, but we just opened it.
    # Actually, renderFileExplorer is called on open.

    # Check for the file icon
    # .window-content contains all explorer content, but also toolbar.
    # We want to find the specific item div that contains the text 'testvideo.mp4'
    # The structure is: <div> <div>ICON</div> <div>NAME</div> <div>ACTIONS</div> </div>

    # We target the item inside explorer content
    explorer_content = page.locator("[id^=explorer-content]") # Select by ID prefix as window ID changes
    file_item = explorer_content.locator("div").filter(has_text="testvideo.mp4").first

    expect(file_item).to_be_visible()
    expect(file_item.locator("div").first).to_have_text("🎞️")

    # Click it to open Video Player
    file_item.click()

    # Check if Video Player opened
    video_window = page.locator(".video-player-window")
    expect(video_window).to_be_visible()
    expect(video_window.locator(".title-bar-text")).to_have_text("Video Player")

    # Clean up
    page.evaluate("delete fileSystem['testvideo.mp4']; saveFileSystem();")
