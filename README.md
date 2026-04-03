# Browserbetriebssystem 🖥️

Ein vollständiges Betriebssystem, das im Browser läuft. Keine Installation nötig.

**[Live Demo →](https://hendr15k.github.io/Browserbetriebssystem/)**

## Features auf einen Blick

- **Desktop-Umgebung** mit Icons, Taskleiste, Startmenü und Uhr
- **Startmenü-Suche** mit Tastatursteuerung (↑/↓/Enter/Escape)
- **Fenstermanagement** — Verschieben, Resize, Minimieren, Maximieren, Schließen, Fokussieren
- **Virtuelles Dateisystem** — Dateien speichern, verwalten, durchsuchen
- **38 integrierte Apps** — System, Produktivität, Spiele, Kreativ, Internet

## 📱 38 Apps in 5 Kategorien

| Kategorie | Apps | Beispiele |
|-----------|------|-----------|
| 🖥️ System (7) | terminal, file-explorer, task-manager, system-monitor, system-center, settings, about |
| 💼 Produktivität (10) | notepad, code-editor, spreadsheet, markdown-editor, pdf-viewer, pomodoro, ... |
| 🎮 Spiele (9) | snake, minesweeper, 2048, tetris, solitaire, sudoku, pong, paint, memory |
| 🎨 Kreativ & Medien (10) | piano, voice-recorder, camera, music-player, video-player, speak, ... |
| 📡 Internet & Daten (2) | browser, weather |

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
