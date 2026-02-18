import pytest
import os
from playwright.sync_api import Page, expect

def test_weather_app(page: Page):
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    # Mock Geocoding API
    def handle_search(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"results": [{"id": 2643743, "name": "London", "latitude": 51.50853, "longitude": -0.12574, "elevation": 25.0, "feature_code": "PPLC", "country_code": "GB", "admin1_id": 6269131, "timezone": "Europe/London", "population": 8961989, "country_id": 2635167, "country": "United Kingdom", "admin1": "England"}]}'
        )

    page.route("**/search?*", handle_search)

    # Mock Forecast API
    def handle_forecast(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"latitude": 51.52, "longitude": -0.11999999, "generationtime_ms": 0.2510547637939453, "utc_offset_seconds": 0, "timezone": "GMT", "timezone_abbreviation": "GMT", "elevation": 23.0, "current_weather": {"temperature": 15.0, "windspeed": 10.0, "winddirection": 200.0, "weathercode": 0, "time": "2023-10-27T10:00"}}'
        )

    page.route("**/forecast?*", handle_forecast)

    page.goto(url)

    # Click the Weather icon on desktop
    # Use exact text match for robustness
    page.click(".icon:has-text('Weather')")

    # Check if window opened
    window = page.locator(".weather-window")
    expect(window).to_be_visible()

    # Search for a city
    page.fill(".weather-search-input", "London")
    page.click(".weather-search-btn")

    # Check results
    expect(page.locator(".weather-city")).to_contain_text("London")
    expect(page.locator(".weather-temp")).to_contain_text("15") # 15.0
    expect(page.locator(".weather-desc")).to_contain_text("Clear sky") # Code 0
