import pytest
from playwright.sync_api import Page, expect

def test_solitaire_opens_and_renders(page: Page):
    try:
        # Navigate to the page
        page.goto("http://localhost:8000/index.html")

        # Open Solitaire
        page.click("text=Solitaire")

        # Wait for window
        window = page.locator(".solitaire-window")
        expect(window).to_be_visible()

        # Wait for render
        page.wait_for_timeout(1000)

        # Check initial cards count
        cards = window.locator(".solitaire-card")
        assert cards.count() == 29

        # Check interaction: Click Stock
        stock = window.locator(".solitaire-stock")
        stock.click()

        # Should deal 1 card to waste
        waste = window.locator(".solitaire-waste")
        waste_cards = waste.locator(".solitaire-card")
        expect(waste_cards).to_have_count(1)

        new_count = cards.count()
        assert new_count == 30

    except Exception as e:
        page.screenshot(path="verification/solitaire_error.png")
        raise e
