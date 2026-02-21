import os
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def app_page(page: Page):
    cwd = os.getcwd()
    url = f"file://{os.path.abspath('index.html')}"
    page.goto(url)
    return page

@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        "args": [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream"
        ]
    }

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "permissions": ["microphone"]
    }

def test_voice_recorder_opens(app_page: Page):
    # Open Voice Recorder
    app_page.click("#desktop .icon:has-text('Voice Rec')")

    # Check Window Title
    expect(app_page.locator(".voice-recorder-window .title-bar-text")).to_have_text("Voice Recorder")

    # Check Controls
    record_btn = app_page.locator("[id^=voice-record-btn-]")
    stop_btn = app_page.locator("[id^=voice-stop-btn-]")

    expect(record_btn).to_be_visible()
    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()

def test_voice_recording_flow(app_page: Page):
    # Open Voice Recorder
    app_page.click("#desktop .icon:has-text('Voice Rec')")

    record_btn = app_page.locator("[id^=voice-record-btn-]")
    stop_btn = app_page.locator("[id^=voice-stop-btn-]")
    status = app_page.locator("[id^=voice-status-]")

    # Start Recording
    record_btn.click()

    # Verify UI Update
    expect(record_btn).to_be_disabled()
    expect(stop_btn).to_be_enabled()
    expect(status).to_contain_text("Recording...")

    # Wait a bit (simulate recording)
    app_page.wait_for_timeout(2000)

    # Stop Recording
    stop_btn.click()

    # Verify UI Update
    expect(record_btn).to_be_enabled()
    expect(stop_btn).to_be_disabled()
    expect(status).to_contain_text("Saved to system")

    # Check List
    voice_list = app_page.locator("[id^=voice-list-]")
    expect(voice_list.locator(".voice-item")).to_have_count(1)

    # Verify File System
    file_system = app_page.evaluate("window.fileSystem")
    recordings = [k for k in file_system.keys() if k.startswith("recording_") and k.endswith(".webm")]
    assert len(recordings) == 1

    # Verify Content (Base64)
    content = file_system[recordings[0]]
    assert content.startswith("data:audio/webm;base64,")

    # Take Screenshot
    app_page.screenshot(path="verification/voice_recorder_flow.png")

def test_voice_recorder_persistence(app_page: Page):
    # Create a mock recording in fileSystem
    app_page.evaluate("""
        fileSystem['recording_test.webm'] = 'data:audio/webm;base64,mockdata';
        saveFileSystem();
    """)

    # Open App
    app_page.click("#desktop .icon:has-text('Voice Rec')")

    # Check List
    voice_list = app_page.locator("[id^=voice-list-]")
    expect(voice_list.locator(".voice-item")).to_contain_text("recording_test.webm")

    # Delete Recording
    app_page.on("dialog", lambda dialog: dialog.accept())
    voice_list.locator("button[title='Delete']").click()

    # Check List Empty
    expect(voice_list.locator(".voice-item")).to_have_count(0)

    # Verify File System
    file_system = app_page.evaluate("window.fileSystem")
    assert "recording_test.webm" not in file_system
