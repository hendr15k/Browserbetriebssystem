import asyncio
import os
import time

def run():
    from playwright.sync_api import sync_playwright

    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--window-size=1280,800'])
        context = browser.new_context(record_video_dir="verification/videos", viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            page.goto(url)
            page.wait_for_timeout(1000)

            # 1. Email App
            page.evaluate("openApp('email')")
            page.wait_for_timeout(500)

            # Use broader locators
            page.locator("button.email-btn.compose").click()
            page.wait_for_timeout(500)

            page.locator("input.email-input[type='email']").fill("test@example.com")
            page.locator("input.email-input[type='text']").fill("Test Subject")
            page.locator("textarea.email-textarea").fill("This is a test email body.")
            page.wait_for_timeout(500)

            page.locator("button.email-btn.primary").click()
            page.wait_for_timeout(500)

            # Move window out of the way
            page.locator(".email-window .title-bar").hover()
            page.mouse.down()
            page.mouse.move(800, 50)
            page.mouse.up()
            page.wait_for_timeout(500)

            # 2. Chat App
            page.evaluate("openApp('chat')")
            page.wait_for_timeout(500)

            page.locator(".chat-contact").nth(0).click()
            page.wait_for_timeout(500)

            page.locator("input.chat-input").fill("Hello Alice!")
            page.locator("button.chat-send-btn").click()
            page.wait_for_timeout(2500) # Wait for auto-reply

            # Move window so we can click others
            page.locator(".chat-window .title-bar").hover()
            page.mouse.down()
            page.mouse.move(50, 450)
            page.mouse.up()
            page.wait_for_timeout(500)

            # 3. Gallery App
            page.evaluate("openApp('photo-gallery')")
            page.wait_for_timeout(500)

            # Move window
            page.locator(".gallery-window .title-bar").hover()
            page.mouse.down()
            page.mouse.move(600, 300)
            page.mouse.up()
            page.wait_for_timeout(500)

            # 4. Printers App
            page.evaluate("openApp('printer')")
            page.wait_for_timeout(500)

            page.screenshot(path="verification/screenshots/new_features_final.png")
            page.wait_for_timeout(1000)
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run()
