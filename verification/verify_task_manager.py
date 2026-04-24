import os
import time
from playwright.sync_api import sync_playwright

def verify_task_manager():
    file_url = f"file://{os.path.abspath('index.html')}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(file_url)

        # Open Calculator
        print("Opening Calculator...")
        page.locator(".icon").filter(has_text="Calculator").click()
        page.wait_for_selector(".window:has-text('Calculator')")

        # Open Terminal
        print("Opening Terminal...")
        page.locator(".icon").filter(has_text="Terminal").click()
        page.wait_for_selector(".window:has-text('Terminal')")

        # Open Task Manager
        print("Opening Task Manager...")
        page.locator(".icon").filter(has_text="Task Mgr").click()
        page.wait_for_selector(".window:has-text('Task Manager')")

        # Wait for list to populate
        time.sleep(2)

        # Check if items are listed
        print("Checking for running tasks...")
        task_list = page.locator(".task-list")
        if not task_list.locator("text=Calculator").is_visible():
            print("FAILED: Calculator not found in Task Manager")
            browser.close()
            exit(1)
        if not task_list.locator("text=Terminal").is_visible():
            print("FAILED: Terminal not found in Task Manager")
            browser.close()
            exit(1)

        print("Tasks found.")

        # Take screenshot before killing
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/task_manager_open.png")
        print("Screenshot saved: verification/task_manager_open.png")

        # Kill Calculator
        print("Killing Calculator via Task Manager...")
        # Find the row with Calculator and click End Task
        # Logic: Find row containing "Calculator", then find button inside it.
        # Playwright: locator(".task-row", has_text="Calculator").locator("button").click()
        page.locator(".task-row", has_text="Calculator").locator("button").click()

        time.sleep(1)

        # Verify Calculator is gone
        if page.locator(".window:has-text('Calculator')").is_visible():
            print("FAILED: Calculator window still visible")
            browser.close()
            exit(1)

        print("Calculator window closed successfully.")

        # Take screenshot after killing
        page.screenshot(path="verification/task_manager_killed.png")
        print("Screenshot saved: verification/task_manager_killed.png")

        browser.close()
        print("Verification Passed!")

if __name__ == "__main__":
    verify_task_manager()
