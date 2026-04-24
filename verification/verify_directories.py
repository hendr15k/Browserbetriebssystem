import os
from playwright.sync_api import sync_playwright

def run_verification():
    file_path = os.path.abspath("index.html")
    file_url = f"file://{file_path}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(file_url)

        # 1. Open Terminal (Desktop Icon)
        page.click("#desktop >> text=Terminal")

        # Wait for terminal window
        terminal_input = page.locator(".terminal-input")
        terminal_input.wait_for()

        # 2. mkdir test_dir
        terminal_input.fill("mkdir test_dir")
        terminal_input.press("Enter")

        # 3. ls (should see test_dir)
        terminal_input.fill("ls")
        terminal_input.press("Enter")

        page.wait_for_selector(".terminal-output:has-text('test_dir')")
        print("Terminal: mkdir and ls verified.")

        # 4. cd test_dir
        terminal_input.fill("cd test_dir")
        terminal_input.press("Enter")

        # 5. pwd (should be /test_dir)
        terminal_input.fill("pwd")
        terminal_input.press("Enter")
        page.wait_for_selector(".terminal-output:has-text('/test_dir')")
        print("Terminal: cd and pwd verified.")

        # 6. touch file.txt
        terminal_input.fill("touch file.txt")
        terminal_input.press("Enter")

        # 7. ls (should see file.txt)
        terminal_input.fill("ls")
        terminal_input.press("Enter")
        page.wait_for_selector(".terminal-output:has-text('file.txt')")
        print("Terminal: touch and ls in subdir verified.")

        # Close Terminal to clear desktop
        page.click(".terminal-window .close-button")

        # 8. Open File Explorer from Desktop Icon
        page.click("#desktop >> text=Explorer")

        # Wait for explorer
        explorer_content = page.locator("[id^=explorer-content-]")
        explorer_content.wait_for()

        # 9. Navigate to test_dir
        # Locate the name element then parent
        folder_name = explorer_content.get_by_text("test_dir", exact=True)
        folder = folder_name.locator("..")
        folder.click()

        # 10. Check if file.txt is visible
        page.wait_for_selector("[id^=explorer-content-] >> text=file.txt")
        print("Explorer: Navigation and file visibility verified.")

        # Screenshot inside folder
        page.screenshot(path="verification/explorer_folder_view.png")

        # 11. Go up
        # The up button has text ".."
        up_label = explorer_content.get_by_text("..", exact=True)
        up_btn = up_label.locator("..")
        up_btn.click()

        # Should verify we are back at root (test_dir is visible)
        page.wait_for_selector("[id^=explorer-content-] >> text=test_dir")
        print("Explorer: Up navigation verified.")

        # 12. Delete test_dir (from Explorer)
        folder_name = explorer_content.get_by_text("test_dir", exact=True)
        folder = folder_name.locator("..")

        folder.hover()

        # Handle confirm dialog BEFORE clicking
        page.once("dialog", lambda dialog: dialog.accept())

        folder.locator("[title=Delete]").click()

        # Verify gone
        page.wait_for_timeout(1000) # Give it a second to refresh

        # Check if text is gone. count() == 0
        count = page.locator("[id^=explorer-content-]").get_by_text("test_dir", exact=True).count()

        if count == 0:
            print("Explorer: Delete verified.")
        else:
             print(f"Delete failed. Count: {count}")
             assert count == 0

        print("All tests passed.")

        browser.close()

if __name__ == "__main__":
    run_verification()
