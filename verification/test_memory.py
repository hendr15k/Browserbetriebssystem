import os
from playwright.sync_api import sync_playwright, expect

def test_memory_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Open Memory App via Desktop Icon
        # The icons have onclick="openApp('memory')"
        # We can find the icon by text content "Memory"
        memory_icon = page.locator(".icon").filter(has_text="Memory")
        expect(memory_icon).to_be_visible()
        memory_icon.click()

        # Wait for the window to open
        memory_window = page.locator(".memory-window")
        expect(memory_window).to_be_visible()

        # Check toolbar elements
        expect(page.locator("#mem-time-window-0")).to_contain_text("00:00")
        expect(page.locator("#mem-moves-window-0")).to_contain_text("0")

        # Check grid
        cards = page.locator(".memory-card")
        expect(cards).to_have_count(16)

        # Click a card to flip it
        first_card = cards.first
        first_card.click()

        # Check if it has 'flipped' class
        expect(first_card).to_have_class("memory-card flipped")

        # Wait a bit for animation
        page.wait_for_timeout(500)

        # Take a screenshot
        page.screenshot(path="verification/memory_game.png")

        browser.close()

if __name__ == "__main__":
    test_memory_game()
