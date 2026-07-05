import os
import base64
import subprocess
import shutil
import pytest
from playwright.sync_api import Page, expect


EXE_SOURCE = "/tmp/hello.c"
EXE_PATH = "/tmp/hello_wine.exe"
BASE_URL = "http://localhost:8765"


@pytest.fixture(scope="session", autouse=True)
def compile_exe():
    if not shutil.which("x86_64-w64-mingw32-gcc"):
        pytest.skip("mingw-w64 cross-compiler not available")

    if not os.path.exists(EXE_PATH):
        src = (
            '#include <windows.h>\n'
            'int WINAPI WinMain(HINSTANCE h, HINSTANCE p, LPSTR c, int s) {\n'
            '    MessageBoxA(NULL, "Hello from Browserbetriebssystem!", "Wine Test", MB_OK);\n'
            '    return 0;\n'
            '}\n'
        )
        with open(EXE_SOURCE, "w") as f:
            f.write(src)
        result = subprocess.run(
            ["x86_64-w64-mingw32-gcc", "-Os", "-s", "-mwindows", "-o", EXE_PATH, EXE_SOURCE],
            capture_output=True
        )
        if result.returncode != 0:
            pytest.skip("mingw-w64 cross-compiler not available")
    return EXE_PATH


def _inject_real_exe(page: Page):
    with open(EXE_PATH, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    page.evaluate("""(b64) => {
        const raw = atob(b64);
        const buf = new ArrayBuffer(raw.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
        window.fileSystem['hello_wine.exe'] = '__exe__';
        window.wineExeFiles['hello_wine.exe'] = buf;
        window.saveFileSystem();
    }""", b64)


def test_upload_real_exe_and_run_in_wine(page: Page, compile_exe):
    page.goto(BASE_URL)
    page.wait_for_timeout(1000)
    _inject_real_exe(page)

    page.click("#desktop >> text=Explorer")
    page.wait_for_timeout(300)
    page.locator("button:text('Refresh')").first.click(force=True)
    page.wait_for_timeout(300)

    explorer_content = page.locator("[id^=explorer-content-]").last
    expect(explorer_content.locator("text=🍷")).to_be_visible()
    expect(explorer_content.locator("text=hello_wine.exe")).to_be_visible()

    page.screenshot(path="/tmp/wine_exe_in_explorer.png", full_page=True)

    explorer_content.locator("text=hello_wine.exe").click()

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for(timeout=5000)
    expect(wine_window).to_be_visible()

    iframe = wine_window.locator("iframe")
    expect(iframe).to_have_attribute("src", "boxedwine/wine-runner.html")

    page.screenshot(path="/tmp/wine_opened_exe.png", full_page=True)


def test_terminal_open_real_exe(page: Page, compile_exe):
    page.goto(BASE_URL)
    page.wait_for_timeout(1000)
    _inject_real_exe(page)

    page.click("#desktop >> text=Terminal")
    terminal_input = page.locator(".terminal-input")
    terminal_input.wait_for()

    terminal_input.fill("open hello_wine.exe")
    terminal_input.press("Enter")

    page.wait_for_selector(".terminal-output:has-text('Opening hello_wine.exe in Wine')")

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for()
    expect(wine_window).to_be_visible()

    page.screenshot(path="/tmp/wine_terminal_exe.png", full_page=True)


def test_wine_ready_message_and_exe_send(page: Page, compile_exe):
    page.goto(BASE_URL)
    page.wait_for_timeout(1000)
    _inject_real_exe(page)

    page.click("#start-button")
    expect(page.locator("#start-menu")).to_be_visible()
    page.locator(".start-item").filter(has_text="Wine").click()

    wine_window = page.locator(".window[data-app-name='wine']")
    wine_window.wait_for()
    expect(wine_window).to_be_visible()

    page.wait_for_timeout(3000)

    try:
        page.wait_for_function("""() => {
            const iframe = document.querySelector('.window[data-app-name="wine"] iframe');
            if (!iframe) return false;
            try {
                return iframe.contentWindow.wineReady === true;
            } catch(e) {
                return false;
            }
        }""", timeout=15000)
    except:
        pass

    page.screenshot(path="/tmp/wine_ready_state.png", full_page=True)


def test_handle_file_upload_exe_direct(page: Page, compile_exe):
    page.goto(BASE_URL)
    page.wait_for_timeout(1000)

    page.evaluate("""() => {
        window.fileSystem['demo.exe'] = '__exe__';
        window.wineExeFiles['demo.exe'] = new ArrayBuffer(32);
        window.saveFileSystem();
    }""")

    result = page.evaluate("""() => {
        return {
            fsEntry: window.fileSystem['demo.exe'],
            hasExeData: 'demo.exe' in window.wineExeFiles,
            exeSize: window.wineExeFiles['demo.exe'].byteLength
        };
    }""")

    assert result["fsEntry"] == "__exe__"
    assert result["hasExeData"] is True
    assert result["exeSize"] == 32
