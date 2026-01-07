
from playwright.sync_api import sync_playwright, expect
import os
import time

def test_new_features():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # 1. Test Paint Fill Button
        print("Testing Paint Fill Button...")
        page.locator(".icon", has_text="Paint").click()
        # Look for a fill button (assuming I'll add a button with text 'Fill' or specific class/id)
        # For now I expect it to fail if not present
        try:
            expect(page.locator("button", has_text="Fill")).to_be_visible(timeout=2000)
            print("PASS: Paint Fill Button found")
        except:
            print("FAIL: Paint Fill Button not found")

        page.locator(".close-button").click()

        # 2. Test Notepad Status Bar
        print("Testing Notepad Status Bar...")
        page.locator(".icon", has_text="Notepad").click()
        try:
            # I will assume ID notepad-status-{windowId} or class
            # Since windowId is dynamic, I check for class inside window
            expect(page.locator(".notepad-status")).to_be_visible(timeout=2000)
            print("PASS: Notepad Status Bar found")
        except:
            print("FAIL: Notepad Status Bar not found")

        page.locator(".close-button").click()

        # 3. Test Calculator Backspace
        print("Testing Calculator Backspace...")
        page.locator(".icon", has_text="Calculator").click()
        try:
            # Expecting a button with ⌫ or similar. I'll use text ⌫ or class
            expect(page.locator("button", has_text="⌫")).to_be_visible(timeout=2000)
            print("PASS: Calculator Backspace found")
        except:
            print("FAIL: Calculator Backspace not found")

        page.locator(".close-button").click()

        # 4. Test Clock Date Title
        print("Testing Clock Date...")
        clock = page.locator("#clock")
        # Check if title attribute contains a year (e.g., 2024 or 2025)
        # Note: current title is likely empty
        try:
            title = clock.get_attribute("title")
            if title and "20" in title:
                print(f"PASS: Clock has date title: {title}")
            else:
                print(f"FAIL: Clock title missing or invalid: {title}")
        except:
            print("FAIL: Clock element check failed")

        # 5. Test Draggable Icons (Check for absolute position after drag)
        print("Testing Draggable Icons...")
        # Get position of an icon
        icon = page.locator(".icon").first
        box_before = icon.bounding_box()

        # Drag it
        # We need to ensure we drag enough to trigger movement
        icon.drag_to(page.locator("#taskbar"), target_position={"x": 0, "y": 0})

        # Check if style is absolute (or if position changed and stayed)
        # Since logic isn't there, it might snap back or not move visually if handled by flex
        # But if I implement absolute positioning, the style attribute should contain position: absolute

        # Reload to check persistence (part of the feature)
        # page.reload()
        # icon_after = page.locator(".icon").first
        # box_after = icon_after.bounding_box()
        # ... logic to compare

        # For now just check if position style is absolute
        try:
            style = icon.get_attribute("style")
            if style and "position: absolute" in style:
                print("PASS: Icon has absolute position")
            else:
                print(f"FAIL: Icon does not have absolute position. Style: {style}")
        except:
            print("FAIL: Icon check failed")

        browser.close()

if __name__ == "__main__":
    test_new_features()
