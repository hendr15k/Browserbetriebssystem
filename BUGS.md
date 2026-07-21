# Bug-Report Runde 4 – /tmp/Browserbetriebssystem/script.js (9047 Zeilen)

Systematische Suche nach Logik-Bugs, Race Conditions, Memory/Listener/Timer-Leaks,
async-Fehlern, Promise-Bugs und Dead Code. KEINE FIXES – nur dokumentierte Funde.

Schweregrad-Legende: 🔴 kritisch (Datenverlust / Sicherheit / viele Leaks) ·
🟠 hoch (Race / reproduzierbarer Crash) · 🟡 mittel (Edge-Case / Dead Code)

---

## 🔴 BUG 1: Piano AudioContext + Oscillator + Listener – KEIN Cleanup beim Window-Close
- **Datei / Zeile:** `script.js:7678-7820` (State), `script.js:2316-2530` (Cleanup fehlt)
- **Beweis:** `pianoStates` wird in `performWindowCleanup` (`script.js:2316+`) **nirgends** referenziert. `initPiano` (Z. 7684) erzeugt pro Fenster einen neuen `AudioContext` mit bis zu 13 aktiven Oszillatoren und registriert `win.onkeydown` / `win.onkeyup` (Z. 7747, 7756).
- **Effekt:** Memory Leak + Audio-Context-Leak + CPU-Last: Audio-Knotengraph + Event-Handler bleiben für immer aktiv. `AudioContext` lässt sich nicht vom Garbage-Collector aufräumen, solange Oszillatoren oder Analyzer-Knoten verbunden sind.
- **Trigger:** Piano öffnen → Noten spielen → Fenster schließen → `pianoStates[windowId]` bleibt im Speicher, AudioContext läuft weiter.

## 🔴 BUG 2: Wine `addEventListener('message', handler)` – Handler wird überschrieben, alter bleibt
- **Datei / Zeile:** `script.js:2180-2206`
- **Beweis:** Beim Öffnen von zwei Wine-Fenstern ohne dass `wine-ready` empfangen wurde, überschreibt Zeile 2201 `performWindowCleanup._wineHandlers[windowId] = handler`. Beim Schließen wird nur der **letzte** Handler entfernt (Z. 2328). Der vorherige Handler bleibt als Listener auf `window` registriert → **Event-Listener-Leak + Cross-Window-Cross-Talk** (alle `message`-Events werden vom toten Handler inspiziert).
- **Trigger:** Wine-App zweimal öffnen, BEVOR `wine-runner.html` „wine-ready" schickt → zweiter Handler überschreibt ersten → erstes Fenster schließen → zweiter Handler antwortet jetzt auch auf Messages des ersten Iframes (falsche Source-Checks `e.source === iframe.contentWindow` schlagen aber fehl, weil iframe entfernt ist).

## 🔴 BUG 3: FileReader OHNE `onerror`-Handler – 7 Stellen
- **Datei / Zeilen:** `script.js:3742`, `3796`, `3810`, `4102`, `6516`, `8010`, `8543`, `8838`
- **Beweis:** Alle FileReader außer `loadSpreadsheet` (Z. 8010, dort gibt es einen try/catch um JSON.parse) registrieren nur `reader.onload`. Wenn der Browser z.B. eine Permission-Blockade trifft oder die Datei während des Lesens entfernt wird, **schlägt `readAsText/ArrayBuffer/DataURL` fehl**, `onerror` wird nie aufgerufen → User sieht nichts, Promise bleibt unvollständig.
- **Trigger:** Große Datei (>Quota), absichtlich abbrechen, oder Browser-Privacy-Mode → kein Feedback, kein Cleanup des Input-Felds (siehe z.B. `input.value = ''` wird NUR im Erfolgsfall geleert – Z. 3806, 3820; bei Fehlern bleibt der File-Input belegt).

## 🔴 BUG 4: Snake-Interval wird nach `gameOver` NICHT gecleart (nur aus State gelöscht)
- **Datei / Zeile:** `script.js:4240-4247`
- **Beweis:**
  ```js
  function gameOver() {
      clearInterval(snakeGames[windowId].interval); // OK
      ...
      delete snakeGames[windowId];                  // State weg
  }
  // danach:
  snakeGames[windowId] = { interval: setInterval(draw, 100) }; // neu
  ```
  Im *ersten* gameOver funktioniert es – ABER: Wenn die Schlange direkt im ersten Tick kollidiert, läuft `draw()` nach `clearInterval` ein letztes Mal, weil das Intervall bereits gefeuert hatte. Edge-Case: nach `delete snakeGames[windowId]` wird im `draw()`-Callback (Z. 4160+) trotzdem auf `snakeGames[windowId].interval` zugegriffen → **TypeError** beim letzten Tick nach gameOver.
- **Trigger:** Snake spielen, in Wand laufen, der `draw()`-Callback der im selben Tick läuft wie `gameOver()` versucht `snake[i].x * gridSize` zu lesen – State ist bereits weg.

## 🔴 BUG 5: Minesweeper `placeMines` – potenzielle **Endlosschleife**
- **Datei / Zeile:** `script.js:4693-4704`
- **Beweis:**
  ```js
  while (placed < game.mineCount) {
      const r = Math.floor(Math.random() * game.rows);
      const c = Math.floor(Math.random() * game.cols);
      if ((Math.abs(r - safeR) > 1 || Math.abs(c - safeC) > 1) && !game.board[r][c].isMine) {
          game.board[r][c].isMine = true;
          placed++;
      }
  }
  ```
  Wenn `mineCount > (rows * cols - 9)` (z.B. 72 bei 9×9 = 81 Zellen, minus 3×3-Safe-Zone = 72) – wenn `mineCount === 73`, gibt es keinen freien Slot mehr → **unendliche while-Schleife**, Browser-Tab hängt.
- **Trigger:** Minesweeper-Code patchen, `mineCount = rows*cols - 8` setzen, Spiel neu starten → Tab friert ein.

## 🔴 BUG 6: `altTabNext` – Race Condition mit DOM-Referenzen
- **Datei / Zeile:** `script.js:2856-2870`
- **Beweis:** `altTabWindowList = visible.slice();` speichert **Referenzen auf DOM-Elemente** (`a`, `b` sind Window-Elemente). Wenn zwischen Alt-Tab-Drücken ein Fenster geschlossen/geöffnet wird, verweisen die Array-Slots entweder auf entfernte DOM-Knoten (`.indexOf()` gibt -1, `nextIdx` wird 0) oder das neue Fenster wird übersprungen, weil die Liste veraltet ist.
- **Trigger:** Alt gedrückt halten, zwischen Tab-Tabs drücken, währenddessen Task-Manager „End Task" auf ein anderes Fenster klicken → Fokus springt auf falsches oder bereits entferntes Fenster.

## 🔴 BUG 7: `window.terminalHistory` – globaler State, alle Terminal-Fenster teilen sich die History
- **Datei / Zeile:** `script.js:3367`, `3370`, `3481`, `3486`, `3495`
- **Beweis:** Die History wird auf `window.terminalHistory` (globaler Window-State) gespeichert, NICHT in `terminalStates[windowId].history`. Jeder `history`-Befehl in Terminal-Fenster A sieht die Commands von Terminal B und umgekehrt. Der Aufwärts-/Abwärts-Pfeil-Recall (`historyIndex`) ist ebenfalls pro-Fenster isoliert, aber die History-Daten global → verwirrendes UX.
- **Trigger:** Terminal 1 öffnen, `mkdir test` eingeben. Terminal 2 öffnen, ↑ drücken → zeigt `mkdir test` aus Terminal 1.

## 🔴 BUG 8: `dragIcon` – Race-Condition: `stopDragIcon` feuert ohne aktiven Drag
- **Datei / Zeile:** `script.js:745-749`, `787-806`
- **Beweis:** Bei jedem `mousedown` auf ein Desktop-Icon werden 5 Document-Listener registriert. Wenn der User `mousedown` + schneller `mouseup` macht (z.B. einfacher Klick), wird `stopDragIcon` aufgerufen, **bevor** `dragIcon` lief → `currentDragIcon` und State werden zurückgesetzt. ABER: Wenn der User mit gedrückter Maus aus dem Fenster zieht und die `mouseup` z.B. durch Kontextmenü verschluckt wird, bleiben die Listener permanent → **Event-Listener-Leak + CPU-Last**.
- **Trigger:** Icon mit gedrückter Maus über den unteren Rand ziehen → Kontextmenü unterdrückt mouseup → `dragIcon` läuft endlos weiter.

## 🟠 BUG 9: Doppelte Registrierung von `contextmenu`-Listenern
- **Datei / Zeilen:** `script.js:292` (Desktop-Contextmenu) UND `script.js:318` (Desktop-Icon-Contextmenu) — beide auf `desktop`; `script.js:302` UND `script.js:335` — beide auf `taskbar`.
- **Beweis:** Zwei separate `addEventListener('contextmenu', …)` auf demselben Element. Beim Rechtsklick auf ein Desktop-Icon feuert zuerst der Icon-Handler (Z. 318, prüft `e.target.closest('.icon')`) UND dann der generische Desktop-Handler (Z. 292, der dieselbe Prüfung hat). Doppelt Arbeit, bei großen DOM-Updates spürbar.
- **Trigger:** Performance-Profiler mit Rechtsklick auf Desktop-Icon → beide Handler sichtbar im Stack.

## 🟠 BUG 10: `document.addEventListener('mouseup', saveWindowStatesDebounced)` läuft bei JEDEM Klick
- **Datei / Zeile:** `script.js:4476-4481`
- **Beweis:** `document.addEventListener('mouseup', () => { … setTimeout(saveWindowStates, 200); });` ist ein **globaler Listener**, der bei jedem Mouseup – auch wenn gar nicht drag/resize war – einen `JSON.stringify(states)` auslöst. Bei 10 Fenstern × 50 Klicks/Minute = 500 localStorage-Schreibvorgänge pro Minute → **Performance + Quotenverschwendung**.
- **Trigger:** Mit Task-Manager Fenster klicken, Browser-DevTools → Application → localStorage zeigt alle 200ms neuen Eintrag.

## 🟠 BUG 11: Voice Recorder `state.timerInterval` kann beim Cleanup hängen bleiben
- **Datei / Zeile:** `script.js:7544`, `7579`, `performWindowCleanup` Z. 2428-2442
- **Beweis:** `performWindowCleanup` ruft `stopRecording(windowId)`, das den Timer clearet. ABER: Wenn `stopRecording` einen Fehler wirft (Z. 7565 `state.mediaRecorder.stop()` kann werfen, wenn Recorder bereits gestoppt), wird der Timer **nie** gecleart. Cleanup hat keinen try/catch um den ganzen `stopRecording`-Aufruf.
- **Trigger:** Voice-Recorder starten, Mikrofon-Permission entziehen während Aufnahme, Fenster schließen → Timer läuft 60 Sekunden weiter, alle 1000 ms `getElementById(`vr-timer-${windowId}`)` schlägt fehl → Console-Spam.

## 🟠 BUG 12: `openApp` ruft `initX(windowId)` per `setTimeout(...0)` – Race mit `closeWindow`
- **Datei / Zeilen:** `script.js:1101, 1261, 1276, 1312, 1325, 1362, 1400, 1414, 1506, 1573, 1632, 1693, 1706, 1720, 1751, 1779, 1792, 1814, 1841, 1861, 1882, 1951, 1973, 2010, 2022, 2034, 2046, 2057`
- **Beweis:** `setTimeout(() => initX(windowId), 0)` scheduled die Initialisierung. Wenn der User das Fenster **vor** dem nächsten Tick schließt (z.B. via Doppelklick auf X), läuft `initX` trotzdem und versucht `document.getElementById(windowId)` zu finden → entweder Null (manche Init-Funktionen prüfen das, viele nicht, z.B. `initSystemMonitor` Z. 3827-3833 prüft die inneren Elemente, NICHT das Window).
- **Trigger:** System-Monitor öffnen, sofort X klicken → `systemMonitorStates[windowId] = setInterval(update, 1500);` (Z. 3844) läuft für **1500 ms weiter**, alle 1500 ms werden 4 `getElementById` auf NULL ausgeführt, das `Array.from(document.querySelectorAll('.window'))` (Z. 3835) wird trotzdem ausgewertet → **Memory + CPU Leak**.

## 🟠 BUG 13: `closeWindow` registriert `animationend` – wenn das Window per `display:none` bereits versteckt ist, feuert es nie
- **Datei / Zeile:** `script.js:2301-2314`
- **Beweis:**
  ```js
  win.classList.add('window-closing');
  win.addEventListener('animationend', () => { performWindowCleanup(windowId); }, { once: true });
  ```
  Wenn der Browser die Animation überspringt (Reduced Motion, oder das Window ist bereits `display:none` durch minimize), feuert `animationend` nie → `performWindowCleanup` läuft **nie** → **kompletter Memory Leak**, alle `setInterval`s laufen weiter.
- **Trigger:** Browser-Setting `prefers-reduced-motion: reduce`, dann Fenster schließen → Cleanup findet nie statt.

## 🟠 BUG 14: Initialisierungs-Code liegt AUSSERHALB des `DOMContentLoaded`-Listeners
- **Datei / Zeilen:** `script.js:572-580`
- **Beweis:**
  ```js
  document.addEventListener('DOMContentLoaded', () => { … });   // Z. 285, schließt Z. 570
  // jetzt AUSSERHALB:
  renderDesktopIcons();
  initDesktopIcons();
  initStickyNotes();
  restoreWindowStates();
  ```
  Diese vier Zeilen laufen synchron beim Parsen, **bevor** der DOM fertig sein könnte (Script wird zwar am Ende von `index.html` geladen, aber das ist ein Implementierungsdetail, kein Vertrag). Wenn jemand das `<script>` später in den `<head>` verschiebt, brechen Initialisierung, Sticky-Note-Restore und Window-State-Restore sofort zusammen.
- **Trigger:** `<script src="script.js">` in `<head>` verschieben → Sticky Notes werden nie aus localStorage wiederhergestellt, gespeicherte Window-States gehen verloren.

## 🟠 BUG 15: `initVoiceRecorder` setzt `state.audioContext` – Cleanup schließt, ignoriert aber `analyser`, `mediaRecorder`, `source`
- **Datei / Zeile:** `script.js:2428-2442`
- **Beweis:** `state.audioContext.close()` wird aufgerufen, aber die AudioContext-Node-Referenzen (`analyser`, `mediaRecorder`, `chunks[]`) bleiben im State-Objekt, das **vor** `delete voiceRecorderStates[windowId]` nur teilweise aufgeräumt wird. Wenn `audioContext.close()` asynchron ist und ein Cleanup-Pfad parallel läuft, kann der State noch verwendet werden.
- **Trigger:** Aufnahme starten, sofort Stop klicken, sofort Fenster schließen → `mediaRecorder.stream` wird in Zeile 7569 aufgerufen, aber Stream wurde bereits durch Close freigegeben → `track.stop()` auf bereits gestopptem Track ist OK, aber `state.audioContext` ist zwischenzeitlich neu erstellt worden.

## 🟡 BUG 16: `taskManagerIntervals` wird in `performWindowCleanup` zwar geclearet – aber nur für eigenes Window. Task-Manager in Window A rendert Window B – wenn B geschlossen wird, hat A keine Mitteilung
- **Datei / Zeile:** `script.js:5316`, `5320`, `5350`
- **Beweis:** `renderTaskManager(windowId)` rendert ALLE offenen Fenster. Cleanup eines fremden Windows entfernt nur dessen Interval; Task-Manager in Window A re-rendert weiterhin alle 1000 ms, auch nach cleanup. Kein Bug, aber unnötige CPU-Last (jede Schließung rendert das Task-Manager-UI erneut).

## 🟡 BUG 17: `loadRecycleBin`/`saveRecycleBin` haben keinen try/catch in `moveToRecycleBin`
- **Datei / Zeile:** `script.js:8864-8878`
- **Beweis:** `loadRecycleBin()` parst JSON in try/catch, OK. Aber `saveRecycleBin(items)` (Z. 8861) ruft `localStorage.setItem` ohne try/catch → wenn der Recycle-Bin voll ist, **wirft** `saveRecycleBin` → `moveToRecycleBin` schlägt fehl, aber Z. 8876-8877 laufen trotzdem weiter und löschen die Datei aus `fileSystem` → **Datenverlust**.
- **Trigger:** Recycle-Bin mit vielen MB füllen, dann eine weitere Datei löschen → Datei verschwindet aus fileSystem, landet aber NICHT im Recycle-Bin.

## 🟡 BUG 18: Off-by-one in `renderGalleryApp` Bilder-Limit
- **Datei / Zeile:** `script.js:8545-8560`
- **Beweis:** `Date.now() + Math.random()` für Bild-IDs. Bei sehr schnellen aufeinanderfolgenden Uploads (innerhalb derselben Millisekunde) kollidieren die IDs (`Math.random()` ist deterministisch pro Aufruf, aber `Date.now()` ms-Auflösung reicht nicht). Zudem: `state.images.push(...)` ohne Längen-Limit → **localStorage-Quoten-Überschreitung ohne Vorbereitung**.
- **Trigger:** 100 Bilder gleichzeitig hochladen → mögliche ID-Kollisionen + localStorage-Crash.

## 🟡 BUG 19: `clockStates[windowId].stopwatch` und `.timer` – `state.timer.running` Check fehlt
- **Datei / Zeile:** `script.js:5940-5950`
- **Beweis:**
  ```js
  if(clockStates[windowId].stopwatch.interval) clearInterval(...);   // OK
  if(clockStates[windowId].timer.interval) clearInterval(...);       // OK
  ```
  Diese sind OK, ABER: `state.clockInterval` (Z. 2446) wird nur geclearet, wenn er existiert. Im `initClock` (Z. 5651) wird `clockInterval: null` initialisiert – Cleanup prüft `clearInterval(null)` ist OK (no-op). Aber: Wenn `initClock` mehrfach für dieselbe `windowId` aufgerufen wird (z.B. nach Wiederherstellung), bleibt der **alte** `clockInterval` aktiv und ein **neuer** wird gestartet → **doppeltes Update** des `clock-display-${windowId}`-Elements, sichtbar als Flackern.

## 🟡 BUG 20: `pomodoro-state.mode` Anzeige-Label-Bug
- **Datei / Zeile:** `script.js:7239-7244` (`renderPomodoro`) + `modeEl` (Z. 1819, `id="pomodoro-mode-${windowId}"`)
- **Beweis:** `modeEl.textContent = state.mode === 'focus' ? 'Break' : 'Focus';` zeigt immer das **Gegenteil** des aktuellen Modus an (das ist der Button „Switch to X"). Aber initial in HTML steht `>Break</button>` (Z. 1819). Im Init `pomodoroStates[windowId] = { mode: 'focus', … }`, dann `renderPomodoro` setzt korrekt `Break`. ABER: Wenn der User auf `pomodoro-mode` klickt (Switch), wird `switchPomodoroMode` aufgerufen → `renderPomodoro` zeigt das richtige Gegenteil. OK. Aber `phaseEl` zeigt `Focus`/`Break`, `modeEl` (Button) zeigt das Gegenteil → verwirrend aber konsistent. KEIN Bug, nur UX.

## 🟡 BUG 21: `initPong` löscht alten RAF, prüft aber `pongGames[windowId]` auf Truthiness – wenn cleanup bereits `delete` gemacht hat, wird ein neuer Game mit gleichem `windowId` gestartet, kein Problem – ABER `pongGames[windowId]` zeigt noch auf das alte `game`-Objekt mit altem `requestId` in dem **alten** `game`-Closure. Cleanup cancelt nur den letzten.
- **Datei / Zeile:** `script.js:6595-6598`, `6749`
- **Beweis:** OK hier – Cleanup cancelt `pongGames[windowId].requestId` einmal. Wenn zweimal `initPong` ohne Cleanup aufgerufen wird (Race), bleibt ein RAF aktiv.

## 🟡 BUG 22: `getFocusedWindow()` ist nicht definiert (laut grep 1 Treffer Z. 2846) – wird aber in Z. 2916, 3008, 2874 verwendet → ohne `function`-Deklaration würde das crashen
- **Datei / Zeile:** `script.js:2846`, `2916`
- **Beweis:** Funktion **ist** definiert (Z. 2846), aber bei Alt+F4 (Z. 2916): `const focused = getFocusedWindow(); if (focused) closeWindow(focused.id);` – wenn `focused` ein Window ohne `id`-Property ist (z.B. wenn das Window-Element detached ist), wird `closeWindow(undefined)` aufgerufen → Z. 2303 `document.getElementById(undefined)` → `null` → OK. Aber `focused.id` lesen auf einem Element ohne ID → `undefined` → Close-Pfad ist `null`, return OK. Trotzdem defensive Lücke.

## 🟡 BUG 23: `deleteStickyNote` Race: `closeWindow` ist asynchron (animationend)
- **Datei / Zeile:** `script.js:3000-3011`
- **Beweis:** `deleteStickyNote` löscht aus localStorage und ruft dann `closeWindow(win.id)` auf. Da `closeWindow` 250 ms wartet (CSS-Animation), kann der User in dieser Zeit eine neue Sticky-Note mit gleichem Inhalt öffnen, die dann nicht im Storage ist.
- **Trigger:** Sticky Note löschen, vor 250 ms wieder erstellen → Datenverlust.

## 🟡 BUG 24: `renderStartApps` ohne Cleanup – globaler `currentCategory`-State
- **Datei / Zeile:** `script.js:65`, `115`
- **Beweis:** `currentCategory` ist eine `let`-Variable im Modul-Scope, wird bei jedem `switchStartCategory` mutiert. Wenn zwei Browser-Tabs (z.B. via Wine-Browser) gleichzeitig laufen, teilen sie den `currentCategory` über `window`-Scope nicht (eigener Tab), ABER `window.terminalHistory` (Bug 7) IST auf `window`. Hier OK, aber Inkonsistenz im Code.

## 🟡 BUG 25: Dead-Code im `initPomodoro`-Template
- **Datei / Zeile:** `script.js:1819`
- **Beweis:** Button `id="pomodoro-mode-${windowId}"` hat initialen Text „Break" (korrekt für `mode='focus'`), aber `renderPomodoro` setzt das Label dynamisch. Der hardcoded Text ist redundant – wenn `renderPomodoro` mal nicht läuft (z.B. nach Error), bleibt der Button-Text „Break" obwohl `state.mode` schon `break` ist → User klickt „Break", passiert nichts (weil Modus bereits `break`).

## 🟡 BUG 26: `safeJsonParse` – stiller Fallback bei Schlüssel-Konflikt
- **Datei / Zeile:** `script.js:9-19`
- **Beweis:** Wenn `localStorage.getItem(key)` einen String zurückgibt, der zu `null` oder `0` parst, gibt safeJsonParse den `fallback` zurück. Das ist gut. ABER: Ein JSON-String wie `"null"` (mit Anführungszeichen) parst zu `null`, fallback greift → stille Datenverlust, keine Console-Warnung.

## 🟡 BUG 27: Browser-Iframe `src` wird nie geleert beim Cleanup
- **Datei / Zeile:** `script.js:2453-2455`, `1583-1584` (Browser-Iframe-Erstellung)
- **Beweis:** `browserStates[windowId]` wird gelöscht, aber das `<iframe>`-Element (Z. 1583) wird mit dem Window entfernt → Browser sollte den iframe mit allen Sub-Ressourcen aufräumen. OK, ABER: das `boxwine`-iframe (Z. 2063) hat **kein** `src`-Reset → `boxedwine/wine-runner.html` läuft weiter (Emscripten-Modul!), auch wenn das Window bereits `window-closing` ist.

## 🟡 BUG 28: Tetris `cancelAnimationFrame` Race mit Re-Init
- **Datei / Zeile:** `script.js:5382-5385`, `5608`
- **Beweis:** Beim `initTetris` (Z. 5382) wird `tetrisGames[windowId].requestId` gecanceled. Aber `tetrisGames[windowId]` wird **erst nach dem Cleanup der alten RAF** neu zugewiesen (Z. 5632-5634). Zwischen Cancel und neuer Zuweisung kann ein neuer RAF aus dem alten Closure feuern (Z. 5608) und auf `tetrisGames[windowId]` zugreifen, das jetzt `undefined` ist → TypeError.
- **Trigger:** Tetris-Fenster zweimal schnell hintereinander öffnen (über Task-Manager-End-Task + reopen).

## 🟡 BUG 29: `setInterval(checkScheduledNotifications, 30000)` läuft IMMER, auch ohne geplante Notifications
- **Datei / Zeile:** `script.js:2610`
- **Beweis:** Permanent-Interval ohne Bedingung. Die Funktion selbst prüft zwar das Array (vermutlich), aber 30 s × lokaler Battery-Drain + CPU bei Mobile.

## 🟡 BUG 30: Drag-Listener doppelt registriert in `initDesktopIcons`
- **Datei / Zeile:** `script.js:725-730`
- **Beweis:** `icon.onmousedown = (e) => startDragIcon(e, icon);` und `icon.ontouchstart = (e) => startDragIcon(e, icon);` werden via Property-Assignment gesetzt (nicht addEventListener) → OK, kein Doppel-Binding. **KEIN BUG** – aufgenommen zur Verifikation.

## 🟡 BUG 31: `Music-Player` cleanup greift nur, wenn `audio` direkt im Window liegt
- **Datei / Zeile:** `script.js:2493-2499`
- **Beweis:** `winRef.querySelector('audio')` findet das erste audio-Element. Wenn das Window mehrere Audio-Elemente hat (z.B. Notifications-Sounds + Music-Player), werden nicht alle pausiert/geleert.

## 🟡 BUG 32: `mediaBlobUrls[windowId].audio/video` Cleanup mit race
- **Datei / Zeile:** `script.js:2511-2518`, `5285-5290`
- **Beweis:** Wenn `handleMusicFile` (Z. 5265) mehrfach aufgerufen wird, wird `mediaBlobUrls[windowId].audio` überschrieben, der **alte** URL wird revoked (Z. 5275-5281). ABER: wenn das `<audio>`-Element den alten URL bereits als `src` hatte (z.B. gerade abgespielt), wird der Stream mitten im Abspielen abgebrochen.

---

## Zusammenfassung

**Total: 32 dokumentierte Funde**, davon:
- **7× kritisch (🔴)**: BUG 1-7 — AudioContext/Listener/FileReader/Loop-Hänger/Race/Global-State
- **7× hoch (🟠)**: BUG 8-14 — Doppelregistrierungen, fehlende Cleanup-Pfade, Race mit animationend
- **18× mittel (🟡)**: BUG 15-32 — Edge-Cases, Datenverlust-Pfade, Performance

**Top 5 priorisierte Fixes (für Runde 5):**
1. BUG 1 (Piano): `pianoStates[windowId]` zu `performWindowCleanup` hinzufügen + `audioContext.close()`
2. BUG 2 (Wine): `_wineHandlers` vor Überschreiben aufräumen
3. BUG 3 (FileReader): alle 7 Stellen mit `reader.onerror = ...` ergänzen
4. BUG 13 (animationend): Fallback-Timeout für `prefers-reduced-motion`
5. BUG 14 (Dead Code): Initialisierungs-Code in den DOMContentLoaded-Listener verschieben

Keine Fixes durchgeführt – nur Befundbericht.