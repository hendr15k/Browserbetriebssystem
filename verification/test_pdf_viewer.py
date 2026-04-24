import os
import pytest
from playwright.sync_api import Page, expect

def test_pdf_viewer_app(page: Page):
    # Load the app
    file_path = os.path.abspath("index.html")
    page.goto(f"file://{file_path}")

    # Open PDF Viewer via Start Menu
    page.click("#start-button")

    # Wait for start menu to be visible
    expect(page.locator("#start-menu")).to_be_visible()

    # Click PDF Viewer item
    page.locator(".start-item").filter(has_text="PDF Viewer").click()

    # Check window
    window = page.locator(".pdf-viewer-window")
    expect(window).to_be_visible()

    # Check toolbar
    expect(window.locator(".pdf-toolbar")).to_be_visible()

    # Check empty state message (since we opened it without a file)
    expect(window.locator("text=Open a PDF file to view")).to_be_visible()

    # Close window
    window.locator(".close-button").click()
    expect(window).not_to_be_visible()
