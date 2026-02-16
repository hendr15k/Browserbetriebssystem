import pytest
from playwright.sync_api import Page, expect

def test_weather_app(page: Page):
    # Load the page (assuming served locally)
    page.goto("http://localhost:8000")

    # Open Start Menu
    page.click("#start-button")

    # Click Weather in Start Menu
    page.click(".start-item:has-text('Weather')")

    # Check if window opened
    weather_window = page.locator(".weather-window")
    expect(weather_window).to_be_visible()

    # Find window ID
    window_id = weather_window.get_attribute("id")

    # Type city
    input_selector = f"#weather-input-{window_id}"
    page.fill(input_selector, "Berlin")

    # Click Search
    page.click(f".weather-search button")

    # Wait for result
    expect(page.locator(f"#weather-display-{window_id} .weather-city")).to_be_visible(timeout=10000)

    # Verify content
    city_text = page.locator(f"#weather-display-{window_id} .weather-city").inner_text()
    assert "Berlin" in city_text

    temp_text = page.locator(f"#weather-display-{window_id} .weather-temp").inner_text()
    assert "°C" in temp_text
