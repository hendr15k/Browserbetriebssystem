import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
        )
        context = browser.new_context(
            permissions=['microphone']
        )
        page = context.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})

        # Load the page
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Wait for desktop to load
        page.wait_for_selector("#desktop")

        # Click Voice Recorder icon
        # The icon label is 'Recorder'
        # We find the icon div that contains 'Recorder'
        recorder_icon = page.locator(".icon", has_text="Recorder")
        recorder_icon.click()

        # Wait for window to open
        # The window has class 'voice-recorder-window'
        # But windows are created dynamically.
        # We can wait for .voice-recorder-window
        page.wait_for_selector(".voice-recorder-window")

        # Check title
        title_el = page.locator(".voice-recorder-window .title-bar-text")
        print(f"Window Title: {title_el.text_content()}")

        # Start recording
        # The button has id starting with 'voice-rec-btn-'
        # We can find it by class 'voice-recorder-btn record'
        rec_btn = page.locator(".voice-recorder-btn.record")
        rec_btn.click()

        # Wait 2 seconds
        page.wait_for_timeout(2000)

        # Take screenshot of recording
        page.screenshot(path="verification/voice_recorder_recording.png")
        print("Screenshot saved to verification/voice_recorder_recording.png")

        # Stop recording
        rec_btn.click()

        # Wait for save
        page.wait_for_timeout(1000)

        # Check list
        items = page.locator(".voice-recorder-item")
        count = items.count()
        print(f"Recordings count: {count}")

        # Take screenshot of list
        page.screenshot(path="verification/voice_recorder_list.png")
        print("Screenshot saved to verification/voice_recorder_list.png")

        browser.close()

if __name__ == "__main__":
    run()
