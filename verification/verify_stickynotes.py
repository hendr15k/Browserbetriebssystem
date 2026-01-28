import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        file_path = f"file://{os.getcwd()}/index.html"
        page.goto(file_path)

        print("Opened Page")

        # Open Sticky Notes via Start Menu
        page.click("#start-button")
        page.wait_for_selector("#start-menu", state="visible")
        page.click("text=Sticky Notes")

        print("Clicked Sticky Notes")

        # Check window appears
        page.wait_for_selector(".sticky-note-window", state="visible")
        print("Sticky Note Window Visible")

        # Check for textarea
        textarea = page.wait_for_selector(".sticky-note-textarea")

        # Type something
        test_text = "Verify Sticky Note Persistence"
        textarea.fill(test_text)

        # Trigger input event explicitly to ensure our oninput handler fires
        page.dispatch_event(".sticky-note-textarea", "input")

        # Wait a bit for save
        time.sleep(0.5)

        # Check if saved to localStorage
        notes = page.evaluate("() => JSON.parse(localStorage.getItem('stickyNotes') || '{}')")
        print(f"Notes in LS: {notes}")
        assert len(notes) > 0, "No notes saved in localStorage"

        note_id = list(notes.keys())[0]
        assert notes[note_id]['content'] == test_text, "Content mismatch in LS"

        # Reload Page to verify persistence
        page.reload()

        # Wait for init
        page.wait_for_selector(".sticky-note-window", state="visible")

        # Check content again
        # We need to find the specific window. Since it's the only one, simple selector works,
        # but let's be robust using the ID from before.
        new_val = page.input_value(f".window[data-note-id='{note_id}'] .sticky-note-textarea")
        assert new_val == test_text, "Content mismatch after reload"

        print("Persistence Verified")

        # Test Delete
        page.on("dialog", lambda dialog: dialog.accept()) # Handle confirm dialog
        page.click(f".window[data-note-id='{note_id}'] .sticky-btn") # Click Delete Trash Icon

        time.sleep(0.5)

        # Verify gone
        count = page.evaluate("() => document.querySelectorAll('.sticky-note-window').length")
        assert count == 0, "Window did not close after delete"

        notes_after = page.evaluate("() => JSON.parse(localStorage.getItem('stickyNotes') || '{}')")
        assert len(notes_after) == 0, "Note not removed from LS"

        print("Deletion Verified")

        browser.close()

if __name__ == "__main__":
    run()
