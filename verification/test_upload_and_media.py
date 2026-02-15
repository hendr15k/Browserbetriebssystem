import os
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def app_page(page: Page):
    cwd = os.getcwd()
    url = f"file://{os.path.abspath('index.html')}"
    page.goto(url)
    return page

def test_upload_button_exists(app_page: Page):
    # Open File Explorer
    app_page.click("#desktop .icon:has-text('Explorer')")

    # Check for Upload button
    expect(app_page.locator("button:text('Upload')")).to_be_visible()

def test_media_playback_from_filesystem(app_page: Page):
    # Inject mock file into fileSystem
    app_page.evaluate("""
        fileSystem['test_music.mp3'] = 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
        fileSystem['test_video.mp4'] = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAAC...';
        saveFileSystem();
    """)

    # Open File Explorer
    app_page.click("#desktop .icon:has-text('Explorer')")

    # Refresh explorer to see new files
    app_page.click("button:text('Refresh')")

    # Check for Music File Icon in Explorer content
    # Note: text=🎵 matches inner text.
    # Use exact match or look inside explorer content div
    explorer_content = app_page.locator("[id^=explorer-content-]")

    expect(explorer_content.locator("text=🎵")).to_be_visible()
    expect(explorer_content.locator("text=test_music.mp3")).to_be_visible()

    # Click Music File
    explorer_content.locator("text=test_music.mp3").click()

    # Verify Music Player Opens
    expect(app_page.locator(".music-player-window")).to_be_visible()

    # Verify Track Name
    expect(app_page.locator("[id^=music-track-name-]")).to_have_text("test_music.mp3")

    # Verify Audio Src
    src = app_page.get_attribute("audio", "src")
    assert "data:audio/mp3;base64" in src

    # Close Music Player
    app_page.click(".music-player-window .close-button")

    # Check for Video File Icon in Explorer content
    expect(explorer_content.locator("text=🎞️")).to_be_visible()
    expect(explorer_content.locator("text=test_video.mp4")).to_be_visible()

    # Click Video File
    explorer_content.locator("text=test_video.mp4").click()

    # Verify Video Player Opens
    expect(app_page.locator(".video-player-window")).to_be_visible()

    # Verify Video Name
    expect(app_page.locator("[id^=video-name-]")).to_have_text("test_video.mp4")

    # Verify Video Src
    src = app_page.get_attribute("video", "src")
    assert "data:video/mp4;base64" in src
