"""Tests for the Calendar app event functionality."""

import pytest


def test_calendar_open(page):
    """Calendar window should open and show the current month with a grid."""
    page.evaluate("localStorage.removeItem('webos-calendar-events')")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("openApp('calendar')")
    window = page.locator(".calendar-window")
    window.wait_for(state="visible", timeout=5000)
    grid = window.locator(".calendar-grid")
    grid.wait_for(state="visible", timeout=5000)
    day_count = page.evaluate(
        """
        () => {
            const windowEl = document.querySelector('.calendar-window');
            if (!windowEl) return -1;
            const windowId = windowEl.id;
            return document.querySelectorAll(`#cal-grid-${windowId} .calendar-day:not(.other-month)`).length;
        }
        """
    )
    # 28-31 days, all days >= 28 should be rendered
    assert day_count >= 28


def test_calendar_add_event(page):
    """Adding an event should persist and show on the calendar cell."""
    page.evaluate("localStorage.removeItem('webos-calendar-events')")
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("openApp('calendar')")
    window = page.locator(".calendar-window")
    window.wait_for(state="visible", timeout=5000)
    window_id = page.evaluate(
        """
        () => document.querySelector('.calendar-window').id
        """
    )

    # Stub out alert so the empty-title validation path doesn't block us if reached.
    page.evaluate("window.alert = () => {}")

    page.evaluate(
        f"""
        () => {{
            const wi = '{window_id}';
            const titleInput = document.getElementById('calendar-event-title-input-' + wi);
            const timeInput = document.getElementById('calendar-event-time-input-' + wi);
            const descInput = document.getElementById('calendar-event-desc-input-' + wi);
            titleInput.value = 'Test Event';
            timeInput.value = '10:30';
            descInput.value = 'Test description';
            saveCalendarEvent(wi);
        }}
        """
    )

    # Wait for save to settle
    page.wait_for_timeout(100)

    stored = page.evaluate(
        """
        () => JSON.parse(localStorage.getItem('webos-calendar-events') || '{}')
        """
    )
    assert stored, "Calendar event should be persisted in localStorage"
    found = False
    for date_key, events in stored.items():
        for event in events:
            if event.get("title") == "Test Event":
                found = True
                assert event.get("time") == "10:30"
                assert event.get("desc") == "Test description"
    assert found, f"Test Event should be stored: {stored}"

    event_count = page.evaluate(
        f"""
        () => {{
            const wi = '{window_id}';
            return document.querySelectorAll(`#calendar-event-items-${{wi}} .calendar-event-item`).length;
        }}
        """
    )
    assert event_count == 1, "Event list should display the saved event"


def test_calendar_event_dot(page):
    """Days with events should display a visual indicator dot."""
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    # Seed an event directly
    page.evaluate(
        """
        () => {
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            calendarEvents = calendarEvents || {};
            localStorage.setItem('webos-calendar-events', JSON.stringify({
                [dateKey]: [{ id: 'e1', title: 'Seeded', time: '09:00', desc: '' }]
            }));
            calendarEvents = JSON.parse(localStorage.getItem('webos-calendar-events'));
        }
        """
    )

    page.evaluate("openApp('calendar')")
    page.wait_for_selector(".calendar-window .calendar-grid", timeout=5000)

    dot_count = page.evaluate(
        """
        () => {
            const windowEl = document.querySelector('.calendar-window');
            if (!windowEl) return -1;
            const windowId = windowEl.id;
            return document.querySelectorAll(`#cal-grid-${windowId} .calendar-event-dot`).length;
        }
        """
    )
    assert dot_count >= 1, "Days with events should have a dot indicator"


def test_calendar_delete_event(page):
    """Deleting an event should remove it from storage and UI."""
    page.goto("file:///workspace/Browserbetriebssystem/index.html")
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("window.confirm = () => true")

    # Seed an event directly via the localStorage write that the save function uses
    page.evaluate(
        """
        () => {
            localStorage.setItem('webos-calendar-events', JSON.stringify({
                '2026-7-15': [{ id: 'event-x', title: 'Delete Me', time: '12:00', desc: '' }]
            }));
            calendarEvents = JSON.parse(localStorage.getItem('webos-calendar-events'));
        }
        """
    )

    page.evaluate("openApp('calendar')")
    page.wait_for_selector(".calendar-window .calendar-grid", timeout=5000)

    page.evaluate("deleteCalendarEvent('window-1', '2026-7-15', 'event-x')")
    page.wait_for_timeout(100)

    stored = page.evaluate(
        """
        () => JSON.parse(localStorage.getItem('webos-calendar-events') || '{}')
        """
    )
    assert "2026-7-15" not in stored or len(stored.get("2026-7-15", [])) == 0
