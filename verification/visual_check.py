from playwright.sync_api import sync_playwright, expect
import os
import json
import time

def verify_visuals():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        page.goto(url)

        # 1. Solitaire
        print("Opening Solitaire...")
        page.evaluate("openApp('solitaire')")
        page.wait_for_selector(".solitaire-card")
        time.sleep(1) # Wait for any animations
        page.screenshot(path="verification/solitaire_visual.png")
        print("Solitaire screenshot saved.")
        page.evaluate("closeWindow(document.querySelector('.solitaire-window').id)")

        # 2. Markdown Viewer
        print("Opening Markdown Viewer...")
        md_content = "# Hello World\nThis is a **bold** test.\n- List item 1\n- List item 2"
        filename = "visual_test.md"
        js_content = json.dumps(md_content)

        page.evaluate(f"""
            fileSystem['{filename}'] = {js_content};
            saveFileSystem();
            openApp('markdown-viewer', '{filename}');
        """)

        page.wait_for_selector(".markdown-content")
        time.sleep(1)
        page.screenshot(path="verification/markdown_visual.png")
        print("Markdown Viewer screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
