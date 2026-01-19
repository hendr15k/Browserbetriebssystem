import os
from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set larger viewport
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Open index.html
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        try:
            # Wait for icons to load/init
            page.wait_for_timeout(500)

            # Click Task Manager icon first (last one)
            page.locator(".icon", has_text="Task Mgr").click()
            page.wait_for_selector(".task-manager-window")

            # Click Video Player icon
            page.locator(".icon", has_text="Video").click()
            page.wait_for_selector(".video-player-window")

            # Verify Taskbar Button "Desktop" exist
            page.locator("button[title='Show Desktop']").wait_for(state="visible")

            # Take screenshot
            page.screenshot(path="verification/verification.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/verification_failed.png")
            raise

        browser.close()

if __name__ == "__main__":
    verify_changes()
