import pytest
import os
from playwright.sync_api import Page, expect

@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        "args": [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream"
        ]
    }

def test_voice_recorder(page: Page):
    # Load the app
    file_url = f"file://{os.path.abspath('index.html')}"
    page.goto(file_url)

    # Open Voice Recorder from Start Menu
    page.click('#start-button')
    # Filter by text strictly to avoid partial matches if any
    page.click('.start-item:has-text("Voice Recorder")')

    # Check window title
    expect(page.locator('.voice-recorder-window .title-bar-text')).to_have_text("Voice Recorder")

    # Check initial state
    # We use regex or partial match for IDs because window ID is dynamic
    record_btn = page.locator('button[id^="record-btn-"]')
    stop_btn = page.locator('button[id^="stop-btn-"]')
    status = page.locator('div[id^="recorder-status-"]')

    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()
    expect(status).to_have_text("Ready to record")

    # Start Recording
    record_btn.click()

    # Check state during recording
    expect(status).to_have_text("Recording...")
    expect(record_btn).to_be_disabled()
    expect(stop_btn).to_be_enabled()

    # Wait for a bit (simulated recording)
    page.wait_for_timeout(2000)

    # Stop Recording
    stop_btn.click()

    # Check state after recording
    expect(status).to_have_text("Recording saved locally.")
    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()

    # Check if recording item exists
    recording_list = page.locator('div[id^="recording-list-"]')
    expect(recording_list.locator('div').first).to_contain_text("Recording 1")

    # Test Save (Mock prompt)
    page.on("dialog", lambda dialog: dialog.accept("test_recording.ogg"))

    # Click save button (floppy disk icon 💾)
    # The save button is the second one in the controls div
    # Structure: div > span(name), div(controls) > button(play), button(save), button(delete)
    # So we target the save button.
    save_btn = recording_list.locator('button').nth(1)
    save_btn.click()

    # Check if file exists in system
    file_exists = page.evaluate("() => !!window.fileSystem['test_recording.ogg']")
    assert file_exists, "File should be saved to fileSystem"
