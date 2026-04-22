from playwright.sync_api import sync_playwright, expect
import os

def test_pong(page):
    page.goto("file://" + os.path.abspath("index.html"))

    # Wait for desktop
    page.wait_for_selector("#desktop")

    # Open Pong via JS
    page.evaluate("openApp('pong')")

    # Check window visibility
    window = page.locator(".pong-window")
    expect(window).to_be_visible()

    # Check canvas existence
    canvas = window.locator("canvas")
    expect(canvas).to_be_visible()

    # Check score board
    score_board = window.locator("span[id^='pong-score-p1-']")
    expect(score_board).to_be_visible()
    expect(score_board).to_have_text("0")

    # Check if pongGames has the instance
    window_id = window.get_attribute("id")

    # Verify global state
    is_game_registered = page.evaluate(f"!!pongGames['{window_id}']")
    assert is_game_registered, "Pong game instance not found in pongGames global object"

    # Verify Canvas Size
    width = canvas.evaluate("el => el.width")
    height = canvas.evaluate("el => el.height")
    assert width == 400
    assert height == 300

    # Close window and verify cleanup
    page.evaluate(f"closeWindow('{window_id}')")
    expect(window).not_to_be_visible()

    # Verify global state cleanup
    is_game_registered = page.evaluate(f"!!pongGames['{window_id}']")
    assert not is_game_registered, "Pong game instance should be removed after closing window"

    print("Pong Test Passed")

if __name__ == "__main__":
    test_pong()
