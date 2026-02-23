import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "permissions": ["microphone"]
    }

@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        "args": [
            *browser_type_launch_args.get("args", []),
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream"
        ]
    }

import os

def test_voice_recorder(page: Page):
    # Load the page
    page.goto("file://" + os.path.abspath("index.html"))

    # Open Voice Recorder
    page.click("text=Recorder")

    # Check if window opened
    expect(page.locator(".voice-recorder-window")).to_be_visible()

    # Check initial state
    timer = page.locator("[id^=vr-timer-]")
    expect(timer).to_have_text("00:00")

    record_btn = page.locator(".vr-btn.record")
    stop_btn = page.locator(".vr-btn.stop")

    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()

    # Start Recording
    record_btn.click()

    # Check if recording started
    expect(record_btn).to_be_disabled()
    expect(stop_btn).to_be_enabled()

    # Wait for some recording time (fake stream produces data immediately)
    page.wait_for_timeout(2000)

    # Check timer updated (at least 00:01)
    # Note: fake stream might not progress time accurately if not handled, but setInterval uses Date.now(), so it should work.
    timer_text = timer.inner_text()
    assert timer_text != "00:00", f"Timer should have updated, got {timer_text}"

    # Stop Recording
    stop_btn.click()

    # Check if recording stopped
    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()

    # Check if recording added to list
    recordings_list = page.locator(".vr-list")
    expect(recordings_list.locator(".vr-recording-item")).to_have_count(1)

    # Check recording item content
    item = recordings_list.locator(".vr-recording-item").first
    expect(item.locator(".vr-rec-name")).to_contain_text("Recording 1")
    expect(item.locator(".vr-rec-time")).not_to_be_empty()

    # Check play button exists
    play_btn = item.locator("button").first
    expect(play_btn).to_have_text("▶")

    # Check download link exists
    download_link = item.locator("a.vr-download-btn")
    expect(download_link).to_be_visible()

    # Delete recording
    # Handle confirm dialog
    page.on("dialog", lambda dialog: dialog.accept())

    delete_btn = item.locator("button").last
    delete_btn.click()

    # Check list is empty
    expect(recordings_list.locator(".vr-recording-item")).to_have_count(0)
    expect(recordings_list).to_contain_text("No recordings yet")
