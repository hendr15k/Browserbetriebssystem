from playwright.sync_api import sync_playwright, expect
import os

def test_solitaire():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Solitaire
        # Try finding by text or icon. Assuming I add it to desktop.
        # If I haven't added it yet, this test will fail, which is expected for TDD.
        # But for the plan step, I just create the test.

        # I'll rely on openApp('solitaire') being available via console if UI isn't ready,
        # but the plan says I add HTML next.
        # So I will write the test to click the icon.

        # Wait for desktop to load
        page.wait_for_selector("#desktop")

        # Execute script to open solitaire directly to ensure we test the app logic even if icon is missing?
        # No, let's simulate user action if possible, or fallback.
        # Given step order, I will just try to click the start menu item or execute JS.
        # Executing JS is safer for now as icons might vary.
        page.evaluate("openApp('solitaire')")

        # Check window
        window = page.locator(".solitaire-window")
        expect(window).to_be_visible()

        # Check dimensions
        # Memory says "explicitly sets... via inline styles".
        # So checking style attribute is good.
        # Or bounding box.
        box = window.bounding_box()
        # Allow some margin for borders/rendering
        assert abs(box['width'] - 600) < 5, f"Width should be 600, got {box['width']}"
        assert abs(box['height'] - 500) < 5, f"Height should be 500, got {box['height']}"

        # Check for cards
        # Assuming I use a class .solitaire-card
        # Initial deal: 1+2+3+4+5+6+7 = 28 cards in tableau.
        # Plus remaining in stock (24).
        # Total 52.
        # If I render all cards (even face down), count should be 52.
        # If I only render top of stock, it might be different.
        # Let's check for at least 28 cards.
        page.wait_for_selector(".solitaire-card")
        count = page.locator(".solitaire-card").count()
        assert count >= 28, f"Expected at least 28 cards, found {count}"

        print("Solitaire Test Passed")
        browser.close()

if __name__ == "__main__":
    test_solitaire()
