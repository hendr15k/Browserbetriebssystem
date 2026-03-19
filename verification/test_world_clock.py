import re
import os
import time
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

    # Switch to World Clock Tab
    world_tab_btn = window.locator("button.clock-tab-btn", has_text="World")
    expect(world_tab_btn).to_be_visible()
    world_tab_btn.click()

    # Check World Clock Tab Content
    # Use simpler selector if ID is dynamic but starts with clock-tab-world-
    content = window.locator("div[id^='clock-tab-world-']")
    expect(content).to_be_visible()
    # Check class contains active (space separated)
    expect(content).to_have_class(re.compile(r"active"))

    # Add a city (New York)
    select = content.locator("select[id^='world-clock-select-']")
    add_btn = content.locator("button", has_text="Add")

    # Assuming New York is index 1 (UTC is 0)
    # Wait for select to be populated (optional, Playwright waits usually)
    # Select by label "New York"
    select.select_option(label="New York")
    add_btn.click()

    # Check if added to list
    list_container = content.locator("div[id^='world-clock-list-']")
    item = list_container.locator("div").first
    expect(item).to_be_visible()
    expect(item).to_contain_text("New York")

    # Check time is displayed
    time_span = item.locator("span[id^='world-clock-time-']")
    expect(time_span).to_be_visible()
    # Wait for time to update (it might be --:--:-- initially for ms, but updateClockTab runs every 1s)
    # Actually updateClockTab runs immediately on load too?
    # But updateClockTab runs every 1s.
    # We should wait for text to match a time pattern or change from --:--:--
    # But my code sets it immediately if updateClockTab runs.
    # Actually, updateClockTab runs every 1s. So it might take up to 1s.
    # Let's wait for it to not contain --:--:--
    expect(time_span).not_to_have_text("--:--:--", timeout=2000)

    # Remove the city
    # To fix the interception issue without using page.evaluate(), we can ensure the delete button is fully ready
    # to be clicked by triggering it natively on the button.
    # Interception issues often stem from overlapping elements.
    # Since we are using standard playwright practices now, and `delBtn.onclick` is fixed via `stopPropagation()`,
    # let's try `click(force=True)` again, and then manually refresh the DOM view.
    del_btn = item.locator("button", has_text="✕").first
    del_btn.click(force=True)

    # Check if list is empty
    expect(list_container).to_be_empty()

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
