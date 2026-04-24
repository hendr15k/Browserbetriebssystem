import os
import pytest
from playwright.sync_api import Page, expect

def test_piano_app(page: Page):
    # Load the app
    file_path = os.path.abspath("index.html")
    page.goto(f"file://{file_path}")

    # Open Piano app via Desktop Icon
    page.locator(".icon").filter(has_text="Piano").click()

    # Check if window opened
    window = page.locator(".piano-window")
    expect(window).to_be_visible()

    # Check for keys
    keys = window.locator(".piano-key")
    # We added 13 notes in the initPiano function
    expect(keys).to_have_count(13)

    # Check a specific key (White C4) - it should have text "A" (the keyboard mapping)
    # The first key is C4
    c4 = keys.nth(0)
    expect(c4).to_have_class("piano-key white")
    expect(c4).to_have_text("A")

    # Check a black key (C#4) - it is the second key (index 1)
    c_sharp_4 = keys.nth(1)
    expect(c_sharp_4).to_have_class("piano-key black")
    # Black keys might not have text displayed or it might be different,
    # but based on my code: keyDiv.textContent = n.key.toUpperCase() ONLY for white keys.
    # So black key should be empty text.
    expect(c_sharp_4).to_have_text("")

    # Close window
    window.locator(".close-button").click()
    expect(window).not_to_be_visible()
