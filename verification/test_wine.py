import os
import pytest
from playwright.sync_api import Page, expect


def test_wine_app_in_start_menu(page: Page):
    page.goto("file://" + os.path.abspath("index.html"))

    page.click("#start-button")
    expect(page.locator("#start-menu")).to_be_visible()

    wine_item = page.locator(".start-item").filter(has_text="Wine")
    expect(wine_item).to_be_visible()


def test_wine_app_opens_window(page: Page):
    page.goto("file://" + os.path.abspath("index.html"))

    page.click("#start-button")
    expect(page.locator("#start-menu")).to_be_visible()

    page.locator(".start-item").filter(has_text="Wine").click()

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for()
    expect(wine_window).to_be_visible()

    iframe = wine_window.locator("iframe")
    expect(iframe).to_have_attribute("src", "boxedwine/wine-runner.html")


def test_file_explorer_exe_icon_and_open(page: Page):
    page.goto("file://" + os.path.abspath("index.html"))

    page.evaluate("""() => {
        window.fileSystem['test.exe'] = '__exe__';
        window.wineExeFiles['test.exe'] = new ArrayBuffer(16);
        window.saveFileSystem();
    }""")

    page.click("#desktop .icon:has-text('Explorer')")
    page.click("button:text('Refresh')")

    explorer_content = page.locator("[id^=explorer-content-]").last
    expect(explorer_content.locator("text=🍷")).to_be_visible()
    expect(explorer_content.locator("text=test.exe")).to_be_visible()

    explorer_content.locator("text=test.exe").click()

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for()
    expect(wine_window).to_be_visible()


def test_terminal_open_exe(page: Page):
    page.goto("file://" + os.path.abspath("index.html"))

    page.evaluate("""() => {
        window.fileSystem['hello.exe'] = '__exe__';
        window.wineExeFiles['hello.exe'] = new ArrayBuffer(16);
        window.saveFileSystem();
    }""")

    page.click("#desktop >> text=Terminal")
    terminal_input = page.locator(".terminal-input")
    terminal_input.wait_for()

    terminal_input.fill("open hello.exe")
    terminal_input.press("Enter")

    page.wait_for_selector(".terminal-output:has-text('Opening hello.exe in Wine')")

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for()
    expect(wine_window).to_be_visible()


def test_handle_file_upload_exe(page: Page):
    page.goto("file://" + os.path.abspath("index.html"))

    result = page.evaluate("""() => {
        window.fileSystem['demo.exe'] = '__exe__';
        window.wineExeFiles['demo.exe'] = new ArrayBuffer(32);
        window.saveFileSystem();
        return {
            fsEntry: window.fileSystem['demo.exe'],
            hasExeData: 'demo.exe' in window.wineExeFiles,
            exeSize: window.wineExeFiles['demo.exe'].byteLength
        };
    }""")

    assert result["fsEntry"] == "__exe__"
    assert result["hasExeData"] is True
    assert result["exeSize"] == 32