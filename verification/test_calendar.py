import os
from playwright.sync_api import sync_playwright, expect

def test_calendar_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Open Calendar App from Desktop Icon
        # Note: Desktop icons are .icon with onclick="openApp('calendar')"
        # We can find it by text "Calendar"
        calendar_icon = page.locator(".icon", has_text="Calendar")
        expect(calendar_icon).to_be_visible()
        calendar_icon.click()

        # Check if Calendar window opens
        calendar_window = page.locator(".calendar-window")
        expect(calendar_window).to_be_visible()

        # Check title bar
        title_bar = calendar_window.locator(".title-bar-text")
        expect(title_bar).to_have_text("Calendar")

        # Check Calendar content
        # It should have a header with Month Year
        header = calendar_window.locator("h3[id^='calendar-month-year-']")
        expect(header).to_be_visible()

        # Check days grid
        days_header = calendar_window.locator(".calendar-days")
        expect(days_header).to_be_visible()
        expect(days_header).to_contain_text("Su")
        expect(days_header).to_contain_text("Mo")

        # Check grid cells
        grid = calendar_window.locator(".calendar-grid")
        expect(grid).to_be_visible()

        # Check if today is highlighted
        today_cell = grid.locator(".calendar-cell[title='Today']")
        expect(today_cell).to_be_visible()

        # Take a screenshot
        page.screenshot(path="verification/calendar_verification.png")

        browser.close()

if __name__ == "__main__":
    test_calendar_app()
