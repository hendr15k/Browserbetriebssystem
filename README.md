# Browserbetriebssystem 🖥️

[![Deploy](https://github.com/hendr15k/Browserbetriebssystem/actions/workflows/deploy.yml/badge.svg)](https://github.com/hendr15k/Browserbetriebssystem/actions/workflows/deploy.yml)

Ein vollständiges Betriebssystem, das im Browser läuft. Keine Installation nötig.

**[Live Demo →](https://hendr15k.github.io/Browserbetriebssystem/)**

## Features auf einen Blick

- **Desktop-Umgebung** mit Icons, Taskleiste, Startmenü und Uhr
- **Virtuelle Desktops** — mehrere Desktops mit Taskbar-Umschalter und Tastenkürzel (Strg+Alt+←/→)
- **Snap-Layouts (Win+Z-Stil)** — Fenster-Layout-Raster über den Maximieren-Button mit Live-Vorschau
- **Quick Settings + Notification Center** — Schnelleinstellungen (WLAN, Bluetooth, Nicht-stören, Ton, Widgets, Hell/Dunkel, Akzentfarbe) plus Benachrichtigungsverlauf an der Taskleiste
- **System Tray** — WLAN-, Lautstärke- und Akku-Indikatoren in der Taskleiste
- **Screenshot-Tool** — Bildschirmbereich auswählen (Strg+Shift+S oder 📷-Button) und als PNG speichern
- **Desktop-Widgets** — schwebende Karten für Uhr, Wetter und System-Statistiken
- **Drag & Drop Upload** — Dateien aus dem lokalen Dateisystem direkt auf den Desktop ins virtuelle Dateisystem ziehen
- **Startmenü-Suche** mit Tastatursteuerung (↑/↓/Enter/Escape)
- **Fenstermanagement** — Verschieben, Resize, Minimieren, Maximieren, Schließen, Fokussieren
- **Aero Snap** — Fenster an Bildschirmränder ziehen zum Andocken (links/rechts halb, oben = maximieren) mit Live-Vorschau
- **Tastatur-Shortcuts** — Alt+Tab (Fenster wechseln), Ctrl+Shift+D (Desktop anzeigen), Ctrl+Alt+W (Fokus-Fenster schließen), Ctrl+Alt+M (minimieren), Ctrl+Alt+X (maximieren), Esc (Menüs schließen)
- **Touch-Support** — Fenster und Desktop-Icons per Touch verschieben/ändern (für Tablets)
- **Virtuelles Dateisystem** — Dateien speichern, verwalten, durchsuchen
- **44 integrierte Apps** — System, Produktivität, Spiele, Kreativ, Internet

## 📱 44 Apps in 5 Kategorien

| Kategorie | Apps | Beispiele |
|-----------|------|-----------|
| 🖥️ System (12) | terminal, file-explorer, task-manager, system-monitor, system-center, settings, about, clock, recycle-bin, calculator, printer, wine |
| 💼 Produktivität (11) | notepad, code-editor, spreadsheet, markdown-editor, pdf-viewer, pomodoro, calendar, sticky-notes, email, unit-converter, notes |
| 🎮 Spiele (9) | snake, minesweeper, 2048, tetris, solitaire, sudoku, pong, memory, tictactoe |
| 🎨 Kreativ & Medien (9) | paint, piano, voice-recorder, camera, music-player, video-player, speak, photo-gallery, color-picker |
| 📡 Internet & Daten (3) | browser, weather, chat |

📄 **Vollständiges App-Verzeichnis:** Siehe [APPS.md](APPS.md)

## Entwicklung

```bash
# Local development
npx serve .

# Run tests
cd verification && python -m pytest

# Build: No build step needed — vanilla JS deploys directly to GitHub Pages
```

## Testing

39 Playwright-basierte Tests für:
- Feature-Verifikation pro App
- Visuelle Regressionstests
- Mobile Responsiveness
- XSS-Sicherheit

## Tech-Stack

- **HTML5** + **CSS3** + **Vanilla JavaScript** (keine Frameworks)
- **Playwright** (Python) für Testing
- **GitHub Pages** für Deployment

## Lizenzen

Dieses Projekt verwendet keine externen Bibliotheken mit eigenen Lizenzen.
