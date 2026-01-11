
from playwright.sync_api import sync_playwright, expect
import os
import datetime

def test_calendar():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        print("Opening Calendar App...")
        # Open Calendar
        page.locator(".icon", has_text="Calendar").click()

        # Check if window opened
        expect(page.locator(".calendar-window")).to_be_visible()
        print("PASS: Calendar window opened")

        # Check current month and year in title
        now = datetime.datetime.now()
        current_month_year = now.strftime("%B %Y")

        # We need to find the active window id or just check any calendar header
        header_text = page.locator(".calendar-header h3").inner_text()
        if current_month_year in header_text:
            print(f"PASS: Correct Month/Year displayed: {header_text}")
        else:
            print(f"FAIL: Expected {current_month_year}, got {header_text}")

        # Check for today's date highlight
        today_date = str(now.day)
        today_el = page.locator(".calendar-day.today")
        expect(today_el).to_be_visible()
        if today_el.inner_text() == today_date:
            print(f"PASS: Today's date ({today_date}) is highlighted")
        else:
             print(f"FAIL: Highlighted date is {today_el.inner_text()}, expected {today_date}")

        # Test Navigation
        print("Testing Month Navigation...")
        # Click Next Month
        page.locator(".calendar-header button").nth(1).click() # 0 is prev, 1 is next

        # Calculate next month
        next_month_date = now.replace(day=28) + datetime.timedelta(days=4)
        next_month_year = next_month_date.strftime("%B %Y")

        header_text_next = page.locator(".calendar-header h3").inner_text()
        if next_month_year in header_text_next:
             print(f"PASS: Navigated to next month: {header_text_next}")
        else:
             print(f"FAIL: Expected {next_month_year}, got {header_text_next}")

        browser.close()

if __name__ == "__main__":
    test_calendar()
