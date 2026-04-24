import re
import os
import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    file_path = os.path.abspath("index.html")
    page.goto(f"file://{file_path}")

    expect(page.locator("#desktop")).to_be_visible()

    clock_icon = page.locator(".icon").filter(has_text="Clock")
    clock_icon.click()

    window = page.locator(".clock-window")
    expect(window).to_be_visible()

    world_tab_btn = window.locator("button.clock-tab-btn", has_text="World")
    expect(world_tab_btn).to_be_visible()
    world_tab_btn.click()

    content = window.locator("div[id^='clock-tab-world-']")
    expect(content).to_be_visible()

    select = content.locator("select[id^='world-clock-select-']")
    add_btn = content.locator("button", has_text="Add")

    select.select_option(label="New York")
    add_btn.click()

    list_container = content.locator("div[id^='world-clock-list-']")
    item = list_container.locator("div").first
    expect(item).to_be_visible()
    expect(item).to_contain_text("New York")

    time_span = item.locator("span[id^='world-clock-time-']")
    expect(time_span).to_be_visible()
    expect(time_span).not_to_have_text("--:--:--", timeout=2000)

    page.screenshot(path="verification/world_clock_before_remove.png")

    # Use evaluate to click and bypass the interception issue
    page.evaluate("document.querySelector(\"div[id^=\x27world-clock-list-\x27] div button\").click()")

    expect(list_container).to_be_empty()
    page.screenshot(path="verification/world_clock_after_remove.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
