from playwright.sync_api import sync_playwright, expect

def verify_solitaire():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large viewport to avoid overlap issues during testing/screenshotting
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.goto("http://localhost:8000/index.html")

        # Open Solitaire
        page.click("text=Solitaire")

        # Wait for window
        window = page.locator(".solitaire-window")
        expect(window).to_be_visible()

        # Wait for render
        page.wait_for_timeout(1000)

        # Take screenshot of the desktop
        page.screenshot(path="verification/solitaire_final.png")

        browser.close()

if __name__ == "__main__":
    verify_solitaire()
