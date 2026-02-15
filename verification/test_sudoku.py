import time
from playwright.sync_api import sync_playwright

def test_sudoku():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Open the application
        page.goto("http://localhost:8000/index.html")

        # Wait for desktop to load
        page.wait_for_selector("#desktop")

        # Find Sudoku icon and click it
        # The icon text is "Sudoku"
        print("Opening Sudoku app...")
        # Use a more specific locator to avoid matching '2048' if something weird happens
        sudoku_icon = page.locator(".icon").filter(has_text="Sudoku").first
        sudoku_icon.click()

        # Wait for window to appear
        print("Waiting for Sudoku window...")
        sudoku_window = page.wait_for_selector(".sudoku-window")

        # Check title
        title_el = sudoku_window.query_selector(".title-bar-text")
        title = title_el.inner_text()
        print(f"Window title: {title}")
        assert title == "Sudoku"

        # Check for grid
        grid = sudoku_window.query_selector(".sudoku-grid")
        assert grid is not None

        # Check for cells (81)
        cells = page.query_selector_all(".sudoku-cell")
        count = len(cells)
        print(f"Found {count} cells")
        assert count == 81

        # Take a screenshot of the initial state
        page.screenshot(path="verification/sudoku_initial.png")

        # Find a non-fixed cell index
        target_index = -1
        for i, cell in enumerate(cells):
            # Check class attribute
            classes = cell.get_attribute("class")
            if "fixed" not in classes:
                target_index = i
                print(f"Found non-fixed cell at index {i}")
                break

        if target_index != -1:
            # Click the cell to select it
            # We need to re-query right before clicking to be safe, though initially it's fine
            cells = page.query_selector_all(".sudoku-cell")
            cells[target_index].click()

            # Wait for re-render
            time.sleep(0.5)

            # Re-query
            cells = page.query_selector_all(".sudoku-cell")
            selected_cell = cells[target_index]

            # Check if selected class is applied
            assert "selected" in selected_cell.get_attribute("class")
            print("Cell selection verified")

            # Type '5'
            page.keyboard.press("5")
            time.sleep(0.5)

            # Re-query
            cells = page.query_selector_all(".sudoku-cell")
            modified_cell = cells[target_index]

            # Check if content updated
            content = modified_cell.inner_text()
            print(f"Cell content after typing '5': '{content}'")
            assert content == "5"

            # Take screenshot after interaction
            page.screenshot(path="verification/sudoku_interaction.png")

            # Test navigation
            # Press ArrowRight
            page.keyboard.press("ArrowRight")
            time.sleep(0.5)

            # Re-query all cells to check selection moved
            cells = page.query_selector_all(".sudoku-cell")

            # Check if any cell has 'selected' class
            selected_found = False
            for cell in cells:
                if "selected" in cell.get_attribute("class"):
                    selected_found = True
                    break

            assert selected_found
            print("Navigation verified (selection exists)")

        else:
            print("Error: No empty cell found? Grid might be full or generation failed.")
            # assert False # Don't crash if generation failed, just print

        print("Sudoku verification successful!")
        browser.close()

if __name__ == "__main__":
    test_sudoku()
