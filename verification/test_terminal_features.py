from playwright.sync_api import sync_playwright, expect
import os
import pytest

def test_terminal_features():
    cwd = os.getcwd()
    url = f"file://{cwd}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Open Terminal
        page.click("#desktop >> text=Terminal")
        terminal_input = page.locator(".terminal-input")
        terminal_input.wait_for()

        # Create a test file with multiple lines
        content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nWord count test"

        # Use arguments to avoid escaping hell
        page.evaluate("""([content]) => {
            const fs = window.fileSystem;
            fs['test_file.txt'] = content;
            window.saveFileSystem();
        }""", [content])

        # Verify file creation with ls
        terminal_input.fill("ls")
        terminal_input.press("Enter")
        page.wait_for_selector(".terminal-output:has-text('test_file.txt')")

        # Test grep
        terminal_input.fill("grep Line test_file.txt")
        terminal_input.press("Enter")
        # Should see Line 1 to Line 5
        page.wait_for_selector(".terminal-output:has-text('Line 1')")
        page.wait_for_selector(".terminal-output:has-text('Line 5')")
        # Should NOT see Word count test
        expect(page.locator(".terminal-output >> text='Word count test'").last).not_to_be_visible()

        # Test grep negative
        terminal_input.fill("grep NotFound test_file.txt")
        terminal_input.press("Enter")

        # Test head
        terminal_input.fill("head -n 2 test_file.txt")
        terminal_input.press("Enter")
        page.wait_for_selector(".terminal-output:has-text('Line 1')")
        page.wait_for_selector(".terminal-output:has-text('Line 2')")

        terminal_input.fill("clear")
        terminal_input.press("Enter")

        terminal_input.fill("head -n 2 test_file.txt")
        terminal_input.press("Enter")
        # Wait for output
        page.wait_for_timeout(500)
        content_text = page.locator(".terminal-output").inner_text()
        assert "Line 1" in content_text
        assert "Line 2" in content_text
        assert "Line 3" not in content_text

        # Test tail
        terminal_input.fill("clear")
        terminal_input.press("Enter")

        terminal_input.fill("tail -n 2 test_file.txt")
        terminal_input.press("Enter")
        page.wait_for_timeout(500)
        content_text = page.locator(".terminal-output").inner_text()
        assert "Line 5" in content_text
        assert "Word count test" in content_text
        assert "Line 4" not in content_text

        # Test wc
        terminal_input.fill("clear")
        terminal_input.press("Enter")

        terminal_input.fill("wc test_file.txt")
        terminal_input.press("Enter")
        page.wait_for_timeout(500)
        content_text = page.locator(".terminal-output").inner_text()
        # 6 lines. Words: 2*5 + 3 = 13 words
        # Length: 6 + 6 + 6 + 6 + 6 + 15 + 5 (newlines) = 45 + 5 = 50?
        # "Line 1\n" is 7 chars. 7*5 = 35. "Word count test" is 15. Total 50.
        # But split by \n gives 6 lines.
        assert "6" in content_text # Lines
        assert "13" in content_text # Words
        assert "test_file.txt" in content_text

        # Test Tab Completion
        terminal_input.fill("clear")
        terminal_input.press("Enter")

        # Type 'gre' and press Tab -> 'grep'
        terminal_input.fill("gre")
        terminal_input.press("Tab")
        # Check value
        val = terminal_input.input_value()
        assert val == "grep"

        # Type 'grep test_fi' and press Tab -> 'grep test_file.txt'
        terminal_input.fill("grep test_fi")
        terminal_input.press("Tab")
        val = terminal_input.input_value()
        assert val == "grep test_file.txt"

        print("All terminal features tests passed.")
        browser.close()

if __name__ == "__main__":
    test_terminal_features()
