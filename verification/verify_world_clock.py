import os
import time
from playwright.sync_api import sync_playwright, expect

def test_world_clock_delete(page):
    file_path = os.path.abspath("index.html")
    page.goto(f"file://{file_path}")

    expect(page.locator("#desktop")).to_be_visible()
    page.evaluate("localStorage.clear()")
    page.goto(f"file://{file_path}")
    expect(page.locator("#desktop")).to_be_visible()

    clock_icon = page.locator(".icon").filter(has_text="Clock")
    clock_icon.click(force=True)

    window = page.locator(".clock-window")
    expect(window).to_be_visible()

    world_tab_btn = window.locator("button.clock-tab-btn", has_text="World")
    expect(world_tab_btn).to_be_visible()
    world_tab_btn.click(force=True)

    content = window.locator("div[id^='clock-tab-world-']")
    expect(content).to_be_visible()

    select = content.locator("select[id^='world-clock-select-']")
    add_btn = content.locator("button", has_text="Add")

    select.select_option(label="New York")
    add_btn.click(force=True)

    list_container = content.locator("div[id^='world-clock-list-']")
    item = list_container.locator("div").first
    expect(item).to_be_visible()
    expect(item).to_contain_text("New York")

    page.screenshot(path="verification/world_clock_before_delete.png")

    del_btn = item.locator("button", has_text="✕").first

    # Use dispatch_event for click instead
    del_btn.dispatch_event('click')

    # Or force evaluation
    # page.evaluate("arguments[0].click()", del_btn.element_handle())

    expect(list_container).to_be_empty()

    page.screenshot(path="verification/world_clock_after_delete.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        try:
            test_world_clock_delete(page)
        finally:
            browser.close()
