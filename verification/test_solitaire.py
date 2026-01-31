from playwright.sync_api import sync_playwright, expect
import os

def test_solitaire():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        page.goto(url)

        print("Opening Solitaire...")
        # Check if icon exists on desktop
        solitaire_icon = page.locator(".icon").filter(has_text="Solitaire")
        expect(solitaire_icon).to_be_visible()
        solitaire_icon.click()

        # Check if window opened by looking for title bar
        title_bar = page.locator(".title-bar-text", has_text="Solitaire")
        expect(title_bar).to_be_visible()

        # Check window size
        window = page.locator(".window.solitaire-window")
        expect(window).to_be_visible()
        # Verify size approximately (since CSS might be slightly different due to borders)
        # But we set style directly.
        box = window.bounding_box()
        print(f"Window size: {box['width']}x{box['height']}")
        # Allow small margin of error if border-box affects it, but inline style usually sets content box or border box depending on CSS
        # In style.css: .window { box-sizing: border-box; } ? No, checking style.css...
        # style.css doesn't explicitly set box-sizing for .window generally, but let's see.
        # .window { ... }
        # If no box-sizing, width is content width.
        # I set win.style.width = '600px'.
        # If box-sizing is content-box (default), total width is 600 + borders.
        # If border-box, total width is 600.
        # style.css has: #desktop { box-sizing: border-box; } but not global *.

        # Let's just check it is close to 600x500
        assert 598 <= box['width'] <= 605
        assert 498 <= box['height'] <= 505

        # Check for board elements
        expect(page.locator(".solitaire-board")).to_be_visible()
        expect(page.locator(".solitaire-top-row")).to_be_visible()
        expect(page.locator(".solitaire-bottom-row")).to_be_visible()

        # Check for Stock and Waste
        expect(page.locator("[id^=solitaire-stock-]")).to_be_visible()
        expect(page.locator("[id^=solitaire-waste-]")).to_be_visible()

        # Check for Foundations (4)
        foundations = page.locator(".solitaire-foundations .solitaire-pile")
        expect(foundations).to_have_count(4)

        # Check for Tableau Columns (7)
        tableau_cols = page.locator(".solitaire-column")
        expect(tableau_cols).to_have_count(7)

        cards = page.locator(".solitaire-card")
        count = cards.count()
        print(f"Found {count} card elements")
        assert count > 0

        # Take screenshot
        page.screenshot(path="verification/solitaire_test.png")
        print("Screenshot saved to verification/solitaire_test.png")

        browser.close()

if __name__ == "__main__":
    test_solitaire()
