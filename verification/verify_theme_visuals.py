
from playwright.sync_api import sync_playwright

def verify_theme_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Navigate to index.html (assumed relative to root)
        import os
        page.goto('file://' + os.path.abspath('index.html'))

        # Wait for load
        page.wait_for_load_state('networkidle')

        # Open Settings
        page.click('.icon:has-text("Settings")')
        page.wait_for_selector('.window .title-bar-text:has-text("Settings")')

        # Change theme to Red
        page.click('div[onclick="setThemeColor(\'#e74c3c\')"]')

        # Take a screenshot showing the red theme (title bar, start button)
        page.screenshot(path='verification/theme_verification.png')

        browser.close()

if __name__ == "__main__":
    verify_theme_visuals()
