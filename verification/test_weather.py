import os
import time
from playwright.sync_api import sync_playwright

def test_weather(page):
    page.set_viewport_size({"width": 1920, "height": 1080})

    # Capture console logs
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    # Capture requests
    page.on("request", lambda request: print(f"Request: {request.url}"))

    # Mock Geocoding API
    def handle_geo(route):
        url = route.request.url
        print(f"Handling Geo Request: {url}")
        if "London" in url:
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"results": [{"id": 2643743, "name": "London", "latitude": 51.5, "longitude": -0.1, "country": "United Kingdom"}]}'
            )
        elif "Paris" in url:
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"results": [{"id": 2988507, "name": "Paris", "latitude": 48.85, "longitude": 2.35, "country": "France"}]}'
            )
        else:
            route.continue_()

    page.route("**/geocoding-api.open-meteo.com/**", handle_geo)

    # Mock Weather API
    def handle_weather(route):
        url = route.request.url
        print(f"Handling Weather Request: {url}")
        if "latitude=51.5" in url: # London
             route.fulfill(
                 status=200,
                 content_type="application/json",
                 body='{"elevation": 25.0, "current_weather": {"temperature": 15.2, "windspeed": 10.5, "weathercode": 3}}'
             )
        elif "latitude=48.85" in url: # Paris
             route.fulfill(
                 status=200,
                 content_type="application/json",
                 body='{"elevation": 35.0, "current_weather": {"temperature": 18.5, "windspeed": 5.0, "weathercode": 0}}'
             )
        else:
             route.continue_()

    page.route("**/api.open-meteo.com/v1/forecast**", handle_weather)

    # Open the application
    page.goto("file://" + os.path.abspath("index.html"))

    # Wait for desktop to load
    page.wait_for_selector("#desktop")

    # Find Weather icon and click it
    print("Opening Weather app...")
    weather_icon = page.locator(".icon").filter(has_text="Weather").first
    weather_icon.click()

    # Wait for window to appear
    print("Waiting for Weather window...")
    weather_window = page.wait_for_selector(".weather-window")

    # Check title
    title_el = weather_window.query_selector(".title-bar-text")
    title = title_el.inner_text()
    print(f"Window title: {title}")
    assert title == "Weather"

    # Check for search bar
    search_input = weather_window.query_selector("input[type='text']")
    assert search_input is not None

    # Verify initial load (London)
    print("Verifying initial load (London)...")
    try:
        page.wait_for_selector(".weather-location:has-text('London, United Kingdom')", timeout=5000)
        page.wait_for_selector(".weather-temp:has-text('15.2°C')", timeout=5000)
    except Exception as e:
        print(f"Timeout waiting for London data. Current content: {weather_window.inner_html()}")
        raise e

    # Test Search
    print("Testing search for Paris...")
    search_input.fill("Paris")

    # Press Enter instead of clicking button
    print("Pressing Enter...")
    search_input.press("Enter")

    # Verify update (Paris)
    print("Verifying search result (Paris)...")
    try:
        page.wait_for_selector(".weather-location:has-text('Paris, France')", timeout=5000)
        page.wait_for_selector(".weather-temp:has-text('18.5°C')", timeout=5000)
    except Exception as e:
        print(f"Timeout waiting for Paris data. Current content: {weather_window.inner_html()}")
        raise e

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/weather_verification.png")

    print("Weather app verification successful!")

if __name__ == "__main__":
    test_weather()
