# Browserbetriebssystem 🖥️

[![Deploy](https://github.com/hendr15k/Browserbetriebssystem/actions/workflows/deploy.yml/badge.svg)](https://github.com/hendr15k/Browserbetriebssystem/actions/workflows/deploy.yml)

Ein vollständiges Betriebssystem, das im Browser läuft. Keine Installation nötig.

**[Live Demo →](https://hendr15k.github.io/Browserbetriebssystem/)**

## Features auf einen Blick

- **Desktop-Umgebung** mit Icons, Taskleiste, Startmenü und Uhr
- **Virtuelle Desktops** — mehrere Desktops mit Taskbar-Umschalter und Tastenkürzel (Strg+Alt+←/→)
- **Snap-Layouts (Win+Z-Stil)** — Fenster-Layout-Raster über den Maximieren-Button mit Live-Vorschau
- **Command Palette (Ctrl+K)** — Apps, Systembefehle und Dateien aus dem virtuellen Dateisystem per Tastatur starten
- **Run-Dialog (Win+R)** — Apps und Shell-Befehle direkt starten
- **Globale Dateisuche (Win+S)** — durchsucht Apps, Befehle UND Dateien im virtuellen Dateisystem
- **Clipboard-Verlauf (Win+V)** — Verlauf der zuletzt kopierten Texte, persistent, per Klick wieder einfügbar
- **Quick Settings + Notification Center** — Schnelleinstellungen (WLAN, Bluetooth, Nicht-stören, Ton, Widgets, Hell/Dunkel, Akzentfarbe) plus Benachrichtigungsverlauf an der Taskleiste
- **System Tray** — WLAN-, Lautstärke- und Akku-Indikatoren in der Taskleiste
- **Screenshot-Tool** — Bildschirmbereich auswählen (Strg+Shift+S oder 📷-Button) und als PNG speichern
- **Desktop-Widgets** — schwebende Karten für Uhr, Wetter und System-Statistiken
- **Drag & Drop Upload** — Dateien aus dem lokalen Dateisystem direkt auf den Desktop ins virtuelle Dateisystem ziehen
- **Startmenü-Suche** mit Tastatursteuerung (↑/↓/Enter/Escape)
- **Fenstermanagement** — Verschieben, Resize, Minimieren, Maximieren, Schließen, Fokussieren
- **Aero Snap** — Fenster an Bildschirmränder ziehen zum Andocken (links/rechts halb, oben = maximieren) mit Live-Vorschau
- **Tastatur-Shortcuts** — Alt+Tab (Fenster wechseln), Ctrl+Shift+D (Desktop anzeigen), Ctrl+Alt+W (Fokus-Fenster schließen), Ctrl+Alt+M (minimieren), Ctrl+Alt+X (maximieren), Esc (Menüs schließen)
- **Sperrbildschirm mit PIN** — Fehlversuchs-Limit und 30s-Cooldown, PIN änderbar in den Settings
- **System-Monitoring** — CPU/RAM-Last im Browser-Tab-Titel, Live-Bars in den Schnelleinstellungen
- **Touch-Support** — Fenster und Desktop-Icons per Touch verschieben/ändern, Pull-to-Minimize-Geste (für Tablets)
- **Virtuelles Dateisystem** — Dateien speichern, verwalten, durchsuchen
- **43 integrierte Apps** — System, Produktivität, Spiele, Kreativ, Internet

## 📱 43 Apps in 5 Kategorien

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

Zusätzlich 133+ Node-Regressionstests (`npm test`) für:
- Window-Management, Workspaces, Snap-Layouts, Quick Settings
- Bug-Regressionen (Runden 5–7: Memory-Leaks, Race Conditions, Datenverlust)
- PWA/Offline, Clipboard-Verlauf, Dateisuche, Sperrbildschirm-Security

## Tech-Stack

- **HTML5** + **CSS3** + **Vanilla JavaScript** (keine Frameworks)
- **Playwright** (Python) für Testing
- **GitHub Pages** für Deployment

## Lizenzen

Dieses Projekt verwendet keine externen Bibliotheken mit eigenen Lizenzen.
