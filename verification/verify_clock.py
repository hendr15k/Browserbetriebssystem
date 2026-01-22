import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    # Load the index.html file directly
    file_path = os.path.abspath("index.html")
    page.goto(f"file://{file_path}")

    # Wait for desktop to load
    expect(page.locator("#desktop")).to_be_visible()

    # Open Clock App
    clock_icon = page.locator(".icon").filter(has_text="Clock")
    clock_icon.click()

    # Check if window opened
    window = page.locator(".clock-window")
    expect(window).to_be_visible()

    # Check Title
    expect(window.locator(".title-bar-text")).to_have_text("Clock")

    # Check Clock Tab Content
    expect(window.locator(".clock-display")).to_be_visible()
    expect(window.locator(".clock-date")).to_be_visible()

    # Take screenshot of Clock Tab
    page.screenshot(path="verification/clock_tab.png")
    print("Clock Tab screenshot saved.")

    # Switch to Stopwatch
    window.locator("button.clock-tab-btn", has_text="Stopwatch").click()

    # Check Stopwatch Content
    expect(window.locator(".stopwatch-display")).to_be_visible()

    # Find the Start button using ID prefix
    start_btn = window.locator("button[id^='sw-start-']")
    expect(start_btn).to_be_visible()

    # Take screenshot of Stopwatch Tab
    page.screenshot(path="verification/stopwatch_tab.png")
    print("Stopwatch Tab screenshot saved.")

    # Switch to Timer
    window.locator("button.clock-tab-btn", has_text="Timer").click()

    # Check Timer Content
    expect(window.locator(".timer-input-group")).to_be_visible()

    # Check inputs
    expect(window.locator("input[id^='timer-min-']")).to_be_visible()

    # Take screenshot of Timer Tab
    page.screenshot(path="verification/timer_tab.png")
    print("Timer Tab screenshot saved.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
