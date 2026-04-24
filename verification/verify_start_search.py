from playwright.sync_api import sync_playwright, expect
import os

def test_start_search():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        print("Opening Start Menu...")
        # Open Start Menu
        page.click("#start-button")

        print("Checking Search Input...")
        # Verify Search Input exists
        search_input = page.locator("#start-search")
        expect(search_input).to_be_visible()

        print("Searching for 'calc'...")
        # Type 'calc'
        search_input.fill("calc")

        # Verify Calculator is visible
        calc_item = page.locator(".start-item", has_text="Calculator")
        expect(calc_item).to_be_visible()

        # Verify Notepad is hidden
        notepad_item = page.locator(".start-item", has_text="Notepad")
        expect(notepad_item).to_be_hidden()

        # Take screenshot of search result
        page.screenshot(path="verification/start_menu_search.png")
        print("Screenshot saved to verification/start_menu_search.png")

        print("Clearing search...")
        # Clear search
        search_input.fill("")

        # Verify Notepad is visible again
        expect(notepad_item).to_be_visible()

        print("Checking divider visibility...")
        # Verify Divider is visible
        divider = page.locator(".start-divider")
        expect(divider).to_be_visible()

        # Type again to check divider hidden
        search_input.fill("calc")
        expect(divider).to_be_hidden()

        print("Start Menu Search Verification Passed!")
        browser.close()

if __name__ == "__main__":
    test_start_search()
