
from playwright.sync_api import sync_playwright, expect
import os
import re

def test_memory_game():
    # Get absolute path to index.html
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Memory Game
        page.locator(".icon", has_text="Memory").click()

        # Check if window opened
        expect(page.locator(".memory-window")).to_be_visible()
        expect(page.locator(".title-bar-text", has_text="Memory")).to_be_visible()

        # Check if grid is populated
        cards = page.locator(".memory-card")
        expect(cards).to_have_count(16)

        # Click a card
        first_card = cards.nth(0)
        first_card.click()
        # Use regex for class check
        expect(first_card).to_have_class(re.compile(r"flipped"))

        # Click another card
        second_card = cards.nth(1)
        second_card.click()
        expect(second_card).to_have_class(re.compile(r"flipped"))

        # Check Moves count updated
        expect(page.locator("div[id^='memory-moves-']")).to_contain_text("Moves: 1")

        # Take screenshot
        page.screenshot(path="verification/memory_game.png")

        browser.close()

if __name__ == "__main__":
    test_memory_game()
