import pytest
import os
from playwright.sync_api import Page, expect


def _open_recycle_bin(page: Page) -> str:
    page.evaluate("openApp('recyclebin')")
    page.wait_for_selector(".recyclebin-window")
    return "window-0"


def test_recyclebin_empty_state(page: Page):
    page.goto(f"file://{os.getcwd()}/index.html")
    # Make sure localStorage starts clean
    page.evaluate("localStorage.removeItem('webos-recyclebin')")
    page.reload()
    page.wait_for_selector("#desktop")

    _open_recycle_bin(page)

    container = page.locator(".recyclebin-empty-text")
    container.wait_for()
    assert "empty" in container.inner_text().lower()


def test_recyclebin_restore_and_permanent_delete(page: Page):
    page.goto(f"file://{os.getcwd()}/index.html")
    page.evaluate("localStorage.removeItem('webos-recyclebin')")
    page.evaluate("localStorage.removeItem('webos-filesystem')")
    page.reload()
    page.wait_for_selector("#desktop")

    # Create a test file in the file system
    page.evaluate("window.fileSystem['rb_test.txt'] = 'hello trash'; window.saveFileSystem();")

    # Move the file to the recycle bin via the moveToRecycleBin helper
    page.evaluate("window.moveToRecycleBin('rb_test.txt');")

    # File should no longer be in the main file system
    assert page.evaluate("window.fileSystem['rb_test.txt']") is None

    # Open recycle bin and check the item is there
    _open_recycle_bin(page)
    page.wait_for_selector(".recyclebin-item-name")
    name_el = page.locator(".recyclebin-item-name").first
    assert name_el.inner_text() == "rb_test.txt"

    # Test the count badge shows the right number
    count_text = page.locator(".recyclebin-count").inner_text()
    assert "1" in count_text

    # Restore the file using the JS API (skip confirm dialog)
    page.evaluate("""() => {
        const win = document.querySelector('.recyclebin-window');
        const id = win.id;
        window.restoreRecycleBinItem(id, JSON.parse(localStorage.getItem('webos-recyclebin'))[0].id);
    }""")

    # File should be back
    assert page.evaluate("window.fileSystem['rb_test.txt']") == "hello trash"

    # Recycle bin should be empty now
    page.wait_for_selector(".recyclebin-empty-text")
    assert page.evaluate("JSON.parse(localStorage.getItem('webos-recyclebin')).length") == 0


def test_recyclebin_permanent_delete(page: Page):
    page.goto(f"file://{os.getcwd()}/index.html")
    page.evaluate("localStorage.removeItem('webos-recyclebin')")
    page.evaluate("localStorage.removeItem('webos-filesystem')")
    page.reload()
    page.wait_for_selector("#desktop")

    page.evaluate("window.fileSystem['del.txt'] = 'gone'; window.saveFileSystem();")
    page.evaluate("window.moveToRecycleBin('del.txt');")

    _open_recycle_bin(page)
    page.wait_for_selector(".recyclebin-item-name")

    # Permanent delete via JS (skip confirm)
    page.evaluate("""() => {
        const win = document.querySelector('.recyclebin-window');
        const id = win.id;
        const items = JSON.parse(localStorage.getItem('webos-recyclebin'));
        window.deleteRecycleBinItem(id, items[0].id);
    }""")

    # Both the file system and recycle bin should be clean
    assert page.evaluate("window.fileSystem['del.txt']") is None
    assert page.evaluate("JSON.parse(localStorage.getItem('webos-recyclebin')).length") == 0


def test_recyclebin_empty_bin(page: Page):
    page.goto(f"file://{os.getcwd()}/index.html")
    page.evaluate("localStorage.removeItem('webos-recyclebin')")
    page.evaluate("localStorage.removeItem('webos-filesystem')")
    page.reload()
    page.wait_for_selector("#desktop")

    # Add multiple files to recycle bin
    page.evaluate("""() => {
        window.fileSystem['a.txt'] = 'A';
        window.fileSystem['b.txt'] = 'B';
        window.saveFileSystem();
        window.moveToRecycleBin('a.txt');
        window.moveToRecycleBin('b.txt');
    }""")

    _open_recycle_bin(page)
    page.wait_for_selector(".recyclebin-item-name")

    items_count = page.evaluate("JSON.parse(localStorage.getItem('webos-recyclebin')).length")
    assert items_count == 2

    # Empty the bin via JS (skip confirm)
    page.evaluate("""() => {
        const win = document.querySelector('.recyclebin-window');
        window.emptyRecycleBin(win.id);
    }""")

    assert page.evaluate("JSON.parse(localStorage.getItem('webos-recyclebin')).length") == 0


def test_recyclebin_in_start_menu(page: Page):
    page.goto(f"file://{os.getcwd()}/index.html")
    page.wait_for_selector("#desktop")

    # Open Start Menu
    page.evaluate("toggleStartMenu()")
    page.wait_for_selector("#start-menu", state="visible")

    # Switch to System category
    page.evaluate("switchStartCategory('system')")
    page.wait_for_timeout(100)

    # Recycle Bin should be present in the start menu under System category
    expect(page.locator("#start-apps-container >> text=Recycle Bin")).to_be_visible()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
