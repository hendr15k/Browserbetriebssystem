
import pytest
from playwright.sync_api import Page, expect

def test_theme_change_and_persistence(page: Page):
    # Navigate to the page
    page.goto('file://' + __file__.replace('verification/test_theme.py', 'index.html'))

    # Open Settings
    page.click('.icon:has-text("Settings")')

    # Check if Settings window is open
    expect(page.locator('.window .title-bar-text')).to_have_text('Settings')

    # Click on the red theme option (#e74c3c)
    # We select by style attribute since we didn't add IDs
    page.click('div[onclick="setThemeColor(\'#e74c3c\')"]')

    # Verify the theme color variable is updated on root
    theme_color = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim()")
    assert theme_color == '#e74c3c'

    # Verify visual change (e.g., Start button background)
    start_btn_bg = page.evaluate("getComputedStyle(document.getElementById('start-button')).backgroundColor")
    # RGB for #e74c3c is rgb(231, 76, 60)
    assert start_btn_bg == 'rgb(231, 76, 60)'

    # Reload page to test persistence
    page.reload()

    # Verify theme color persisted
    theme_color_after = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim()")
    assert theme_color_after == '#e74c3c'

    # Verify visual change persisted
    start_btn_bg_after = page.evaluate("getComputedStyle(document.getElementById('start-button')).backgroundColor")
    assert start_btn_bg_after == 'rgb(231, 76, 60)'

    print("Theme change and persistence verified successfully.")

if __name__ == "__main__":
    # This block allows running the script directly with python if playwright is set up for it,
    # but typically we run with pytest
    pass
