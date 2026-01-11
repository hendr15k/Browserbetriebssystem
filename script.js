// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('clock');
    clock.textContent = `${hours}:${minutes}`;
    clock.title = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// Settings Logic
function setBackground(bg) {
    document.getElementById('desktop').style.background = bg;
    document.getElementById('desktop').style.backgroundSize = 'cover';
    localStorage.setItem('desktopBackground', bg);
}

// Load Settings
window.addEventListener('load', () => {
    const savedBg = localStorage.getItem('desktopBackground');
    if (savedBg) {
        document.getElementById('desktop').style.background = savedBg;
        document.getElementById('desktop').style.backgroundSize = 'cover';
    }

    // Context Menu Logic
    const desktop = document.getElementById('desktop');
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'absolute';
    contextMenu.style.background = 'white';
    contextMenu.style.border = '1px solid #ccc';
    contextMenu.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.padding = '5px 0';
    contextMenu.style.width = '150px';

    const menuItems = [
        { label: 'Refresh', action: () => location.reload() },
        { label: 'New Text File', action: () => {
            const filename = prompt('Enter filename:', 'newfile.txt');
            if (filename) {
                fileSystem[filename] = '';
                saveFileSystem();
                alert(`Created ${filename}`);
                // Refresh if explorer is open
                document.querySelectorAll('.window').forEach(win => {
                    if (win.querySelector('.explorer-toolbar')) { // Identify explorer window
                         const winId = win.id;
                         renderFileExplorer(winId);
                    }
                });
            }
        }},
        { label: 'Change Background', action: () => openApp('settings') }
    ];

    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.label;
        div.style.padding = '5px 10px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '14px';
        div.onmouseover = () => div.style.background = '#eee';
        div.onmouseout = () => div.style.background = 'white';
        div.onclick = () => {
            item.action();
            contextMenu.style.display = 'none';
        };
        contextMenu.appendChild(div);
    });

    document.body.appendChild(contextMenu);

    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // Check if clicking on an icon, if so, maybe different menu?
        // For now, simple desktop menu.
        // If clicking on icon, we might want to avoid showing this menu or show specific one.
        // But the event bubbles. The icon has onclick, but contextmenu bubbles.
        // Let's allow it everywhere on desktop for now.

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    // Initialize Desktop Icons
    initDesktopIcons();
});

// Desktop Icon Logic
function initDesktopIcons() {
    const desktop = document.getElementById('desktop');
    const icons = desktop.querySelectorAll('.icon');
    const savedPositions = JSON.parse(localStorage.getItem('desktopIconPositions')) || {};

    icons.forEach((icon, index) => {
        // Assign ID if missing
        if (!icon.id) {
            icon.id = `desktop-icon-${index}`;
        }

        const pos = savedPositions[icon.id];
        if (pos) {
            icon.style.position = 'absolute';
            icon.style.left = pos.left;
            icon.style.top = pos.top;
        }

        // Add drag events
        icon.onmousedown = (e) => startDragIcon(e, icon);
    });
}

let isDraggingIcon = false;
let currentDragIcon = null;
let iconDragOffset = { x: 0, y: 0 };

function startDragIcon(e, icon) {
    e.stopPropagation(); // Prevent desktop context menu or selection
    isDraggingIcon = true;
    currentDragIcon = icon;

    // Switch to absolute positioning if not already
    // To do this smoothly, we need to calculate current screen position relative to desktop
    const desktop = document.getElementById('desktop');
    const iconRect = icon.getBoundingClientRect();
    const desktopRect = desktop.getBoundingClientRect();

    if (getComputedStyle(icon).position !== 'absolute') {
        const left = iconRect.left - desktopRect.left;
        const top = iconRect.top - desktopRect.top;

        icon.style.position = 'absolute';
        icon.style.left = `${left}px`;
        icon.style.top = `${top}px`;
        icon.style.margin = '0'; // Remove margin as it affects absolute pos
    }

    iconDragOffset.x = e.clientX - icon.getBoundingClientRect().left;
    iconDragOffset.y = e.clientY - icon.getBoundingClientRect().top;

    document.addEventListener('mousemove', dragIcon);
    document.addEventListener('mouseup', stopDragIcon);
}

function dragIcon(e) {
    if (!isDraggingIcon || !currentDragIcon) return;
    e.preventDefault();

    const desktop = document.getElementById('desktop');
    const desktopRect = desktop.getBoundingClientRect();

    const x = e.clientX - desktopRect.left - iconDragOffset.x;
    const y = e.clientY - desktopRect.top - iconDragOffset.y;

    currentDragIcon.style.left = `${x}px`;
    currentDragIcon.style.top = `${y}px`;
}

function stopDragIcon() {
    if (currentDragIcon) {
        // Save position
        const savedPositions = JSON.parse(localStorage.getItem('desktopIconPositions')) || {};
        savedPositions[currentDragIcon.id] = {
            left: currentDragIcon.style.left,
            top: currentDragIcon.style.top
        };
        localStorage.setItem('desktopIconPositions', JSON.stringify(savedPositions));
    }

    isDraggingIcon = false;
    currentDragIcon = null;
    document.removeEventListener('mousemove', dragIcon);
    document.removeEventListener('mouseup', stopDragIcon);
}

// Start Menu Logic
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');

    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        btn.classList.add('active');
    } else {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
}

// Close start menu when clicking outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');

    if (menu.style.display === 'flex' &&
        !menu.contains(e.target) &&
        !btn.contains(e.target)) {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
});

// Window Management
let zIndex = 100;
let windowCount = 0;

function openApp(appName, arg = null) {
    const windowId = `window-${windowCount++}`;
    const windowArea = document.getElementById('window-area');

    const win = document.createElement('div');
    win.className = 'window';
    if (window.innerWidth <= 768) {
        win.classList.add('maximized');
    }
    win.id = windowId;
    win.style.zIndex = ++zIndex;

    // Randomize position slightly
    const offsetPos = windowCount * 20;
    win.style.left = `${50 + (offsetPos % 200)}px`;
    win.style.top = `${50 + (offsetPos % 200)}px`;

    let title = "Application";
    let content = "";

    // Application Content Logic
    if (appName === 'terminal') {
        title = "Terminal";
        win.classList.add('terminal-window');
        content = `
            <div class="terminal-output">Welcome to WebOS v1.0<br>Type "help" for commands.<br></div>
            <div class="terminal-input-line">
                <span>&gt;&nbsp;</span>
                <input type="text" class="terminal-input" autofocus>
            </div>
        `;
    } else if (appName === 'notepad') {
        title = "Notepad";
        content = `
            <div class="notepad-toolbar" style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc; display: flex; gap: 5px;">
                <button onclick="saveNotepad('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Save</button>
                <button onclick="downloadNotepad('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Download</button>
                <label style="font-size: 12px; padding: 2px 8px; cursor: pointer; border: 1px solid #999; background: #ddd; display: inline-block;">
                    Open <input type="file" id="notepad-input-${windowId}" style="display: none;" onchange="openNotepadFile('${windowId}')">
                </label>
            </div>
            <textarea class="notepad-area" id="notepad-area-${windowId}"></textarea>
            <div id="notepad-status-${windowId}" class="notepad-status" style="padding: 2px 5px; font-size: 11px; background: #eee; border-top: 1px solid #ccc; text-align: right;">Ln 1, Col 1</div>
        `;
    } else if (appName === 'file-explorer') {
        title = "File Explorer";
        content = `
            <div class="explorer-toolbar" style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc;">
                <button onclick="renderFileExplorer('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Refresh</button>
            </div>
            <div id="explorer-content-${windowId}" style="padding: 10px; display: flex; flex-wrap: wrap; gap: 15px; overflow-y: auto; height: 100%; align-content: flex-start; background: white;">
            </div>
        `;
        setTimeout(() => renderFileExplorer(windowId), 0);
    } else if (appName === 'about') {
        title = "About";
        content = `
            <div class="about-content">
                <h2>WebOS</h2>
                <p>A simple OS in the browser.</p>
                <p>Created as a GitHub.io Page.</p>
                <button onclick="closeWindow('${windowId}')">OK</button>
            </div>
        `;
    } else if (appName === 'calculator') {
        title = "Calculator";
        win.classList.add('calculator-window');
        // Simple Calculator Layout
        content = `
            <div class="calc-main">
                <div class="calc-display" id="calc-display-${windowId}">0</div>
                <div class="calc-buttons">
                    <button class="calc-btn clear" onclick="calcInput('${windowId}', 'C')">C</button>
                    <button class="calc-btn operator" onclick="calcInput('${windowId}', '/')">/</button>
                    <button class="calc-btn operator" onclick="calcInput('${windowId}', '*')">*</button>
                    <button class="calc-btn operator" style="color: #d9534f;" onclick="calcInput('${windowId}', 'BACK')">⌫</button>

                    <button class="calc-btn" onclick="calcInput('${windowId}', '7')">7</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '8')">8</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '9')">9</button>
                    <button class="calc-btn operator" onclick="calcInput('${windowId}', '-')">-</button>

                    <button class="calc-btn" onclick="calcInput('${windowId}', '4')">4</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '5')">5</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '6')">6</button>
                    <button class="calc-btn operator" onclick="calcInput('${windowId}', '+')">+</button>

                    <button class="calc-btn" onclick="calcInput('${windowId}', '1')">1</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '2')">2</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '3')">3</button>

                    <button class="calc-btn" style="grid-column: span 2" onclick="calcInput('${windowId}', '0')">0</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '.')">.</button>
                    <button class="calc-btn equals" style="grid-row: span 1" onclick="calcInput('${windowId}', '=')">=</button>

                    <!-- Scientific Buttons -->
                    <button class="calc-btn" onclick="calcInput('${windowId}', 'sin(')">sin</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', 'cos(')">cos</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', 'tan(')">tan</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', 'sqrt(')">√</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '^')">^</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', '(')">(</button>
                    <button class="calc-btn" onclick="calcInput('${windowId}', ')')">)</button>
                </div>
            </div>
            <div class="calc-history" id="calc-history-${windowId}">
                <div class="history-title">History</div>
                <div class="history-list"></div>
            </div>
        `;
    } else if (appName === 'snake') {
        title = "Snake";
        win.classList.add('snake-window');
        content = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #222;">
                <canvas id="snake-canvas-${windowId}" width="400" height="300" style="border: 2px solid #555; background: black;"></canvas>
                <button onclick="startSnake('${windowId}')" style="margin-top: 10px; padding: 5px 15px; cursor: pointer;">Start Game</button>
                <div style="display: flex; gap: 20px; margin-top: 5px;">
                    <div id="snake-score-${windowId}" style="color: white;">Score: 0</div>
                    <div id="snake-highscore-${windowId}" style="color: #aaa;">High Score: 0</div>
                </div>
            </div>
        `;
    } else if (appName === 'settings') {
        title = "Settings";
        content = `
            <div style="padding: 20px;">
                <h3>Desktop Background</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div onclick="setBackground('linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)')"
                         style="width: 100px; height: 80px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
                    <div onclick="setBackground('linear-gradient(to right, #8e2de2, #4a00e0')"
                         style="width: 100px; height: 80px; background: linear-gradient(to right, #8e2de2, #4a00e0); cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
                    <div onclick="setBackground('linear-gradient(to right, #f12711, #f5af19)')"
                         style="width: 100px; height: 80px; background: linear-gradient(to right, #f12711, #f5af19); cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
                    <div onclick="setBackground('#222')"
                         style="width: 100px; height: 80px; background: #222; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
                    <div onclick="setBackground('url(https://source.unsplash.com/random/1600x900/?nature)')"
                         style="width: 100px; height: 80px; background: url(https://source.unsplash.com/random/1600x900/?nature); background-size: cover; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>
                </div>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ccc;">
                <h3>System</h3>
                <button onclick="if(confirm('Are you sure you want to reset all settings and data? This will clear localStorage and reload the page.')) { localStorage.clear(); location.reload(); }"
                        style="padding: 10px 20px; background: #d9534f; color: white; border: none; cursor: pointer; border-radius: 4px;">Reset to Defaults</button>
            </div>
        `;
    } else if (appName === 'speak') {
        title = "Speak";
        content = `
            <div style="padding: 10px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
                <textarea id="speak-text-${windowId}" style="flex-grow: 1; margin-bottom: 10px; resize: none; padding: 5px; font-family: sans-serif;" placeholder="Type text here..."></textarea>
                <button onclick="speakText('${windowId}')" style="padding: 10px; cursor: pointer; font-weight: bold;">Speak</button>
            </div>
        `;
    } else if (appName === 'camera') {
        title = "Camera";
        content = `
            <div style="padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #000;">
                <video id="camera-video-${windowId}" autoplay style="width: 100%; max-height: 200px; background: #333; margin-bottom: 10px;"></video>
                <canvas id="camera-canvas-${windowId}" style="display: none;"></canvas>
                <div style="display: flex; gap: 10px;">
                    <button onclick="startCamera('${windowId}')" style="padding: 5px 15px; cursor: pointer;">Start Camera</button>
                    <button onclick="takeSnapshot('${windowId}')" style="padding: 5px 15px; cursor: pointer;">Capture</button>
                </div>
            </div>
        `;
    } else if (appName === 'minesweeper') {
        title = "Minesweeper";
        win.classList.add('minesweeper-window');
        content = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #c0c0c0; padding: 10px; border: 2px solid white; border-right-color: #808080; border-bottom-color: #808080;">
                <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 10px; background: #c0c0c0; border: 2px solid #808080; border-right-color: white; border-bottom-color: white; padding: 5px;">
                     <div id="ms-mines-${windowId}" style="background: black; color: red; font-family: 'Courier New', monospace; font-weight: bold; font-size: 20px; padding: 2px 5px;">010</div>
                     <button onclick="initMinesweeper('${windowId}')" style="font-size: 20px; padding: 0 5px; cursor: pointer;">😊</button>
                     <div id="ms-timer-${windowId}" style="background: black; color: red; font-family: 'Courier New', monospace; font-weight: bold; font-size: 20px; padding: 2px 5px;">000</div>
                </div>
                <div id="ms-grid-${windowId}" class="minesweeper-grid" style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 1px; background: #808080; border: 3px solid #808080; border-right-color: white; border-bottom-color: white;">
                    <!-- Cells generated by JS -->
                </div>
            </div>
        `;
        setTimeout(() => initMinesweeper(windowId), 0);
    } else if (appName === 'tictactoe') {
        title = "Tic Tac Toe";
        win.classList.add('tictactoe-window');
        content = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; padding: 10px;">
                <div id="ttt-status-${windowId}" style="margin-bottom: 10px; font-size: 18px; font-weight: bold;">Player X's Turn</div>
                <div class="ttt-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 200px; height: 200px;">
                    ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" id="ttt-cell-${windowId}-${i}" onclick="playTicTacToe('${windowId}', ${i})" style="background: white; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer; user-select: none;"></div>`).join('')}
                </div>
                <button onclick="resetTicTacToe('${windowId}')" style="margin-top: 15px; padding: 5px 15px; cursor: pointer;">Reset Game</button>
            </div>
        `;
        setTimeout(() => resetTicTacToe(windowId), 0);
    } else if (appName === 'paint') {
        title = "Paint";
        win.classList.add('paint-window');
        content = `
            <div class="paint-toolbar" style="padding: 5px; background: #eee; display: flex; gap: 5px; align-items: center; border-bottom: 1px solid #ccc;">
                <label style="font-size: 12px;">Color:</label>
                <input type="color" id="paint-color-${windowId}" value="#000000" style="height: 25px; cursor: pointer;">

                <div class="paint-palette">
                    <div class="palette-color" style="background-color: #000000;" onclick="setPaintColor('${windowId}', '#000000')"></div>
                    <div class="palette-color" style="background-color: #ff0000;" onclick="setPaintColor('${windowId}', '#ff0000')"></div>
                    <div class="palette-color" style="background-color: #00ff00;" onclick="setPaintColor('${windowId}', '#00ff00')"></div>
                    <div class="palette-color" style="background-color: #0000ff;" onclick="setPaintColor('${windowId}', '#0000ff')"></div>
                    <div class="palette-color" style="background-color: #ffff00;" onclick="setPaintColor('${windowId}', '#ffff00')"></div>
                </div>

                <label style="font-size: 12px;">Size:</label>
                <input type="range" id="paint-size-${windowId}" min="1" max="50" value="5" style="width: 80px; cursor: pointer;">

                <button onclick="setPaintTool('${windowId}', 'brush')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Brush</button>
                <button onclick="setPaintTool('${windowId}', 'fill')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Fill</button>
                <button onclick="setPaintColor('${windowId}', '#ffffff'); setPaintTool('${windowId}', 'brush')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Eraser</button>

                <div style="flex: 1;"></div>
                <button onclick="clearPaint('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Clear</button>
                <label style="font-size: 12px; padding: 2px 8px; cursor: pointer; border: 1px solid #999; background: #ddd; display: inline-block;">
                    Open <input type="file" id="paint-input-${windowId}" style="display: none;" onchange="openPaintFile('${windowId}')" accept="image/*">
                </label>
                <button onclick="savePaint('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer; font-weight: bold;">Download</button>
                <button onclick="savePaintToSystem('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer; font-weight: bold;">Save</button>
            </div>
            <div style="flex: 1; overflow: hidden; background: white; position: relative; cursor: crosshair;">
                <canvas id="paint-canvas-${windowId}" style="display: block;"></canvas>
            </div>
        `;
        // Defer initialization to after append
        setTimeout(() => initPaint(windowId, arg), 0);
    } else if (appName === 'calendar') {
        title = "Calendar";
        win.classList.add('calendar-window');
        content = `
            <div class="calendar-container" style="padding: 10px; height: 100%; display: flex; flex-direction: column;">
                <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <button onclick="changeCalendarMonth('${windowId}', -1)" style="cursor: pointer; padding: 5px 10px;">&lt;</button>
                    <h3 id="calendar-month-year-${windowId}" style="margin: 0;">Month Year</h3>
                    <button onclick="changeCalendarMonth('${windowId}', 1)" style="cursor: pointer; padding: 5px 10px;">&gt;</button>
                </div>
                <div class="calendar-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-weight: bold; margin-bottom: 5px;">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div id="calendar-grid-${windowId}" class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; flex-grow: 1;">
                    <!-- Calendar cells -->
                </div>
            </div>
        `;
        setTimeout(() => initCalendar(windowId), 0);
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="startDrag(event, '${windowId}')">
            <div class="title-bar-text">${title}</div>
            <div class="title-bar-controls">
                <button class="window-button minimize-button" onclick="minimizeWindow('${windowId}')">_</button>
                <button class="window-button maximize-button" onclick="maximizeWindow('${windowId}')">□</button>
                <button class="window-button close-button" onclick="closeWindow('${windowId}')">X</button>
            </div>
        </div>
        <div class="window-content" onclick="focusWindow('${windowId}')">
            ${content}
        </div>
        <div class="resize-handle resize-r" onmousedown="startResize(event, '${windowId}', 'r')"></div>
        <div class="resize-handle resize-b" onmousedown="startResize(event, '${windowId}', 'b')"></div>
        <div class="resize-handle resize-br" onmousedown="startResize(event, '${windowId}', 'br')"></div>
    `;

    windowArea.appendChild(win);
    focusWindow(windowId);

    // Add to taskbar
    const taskbarApps = document.getElementById('taskbar-apps');
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item active';
    taskbarItem.id = `taskbar-${windowId}`;
    taskbarItem.textContent = title;

    // Updated click logic: toggle minimize/restore
    taskbarItem.onclick = () => {
        const w = document.getElementById(windowId);
        if (w.style.display === 'none') {
            minimizeWindow(windowId); // Restores it
        } else {
            if (w.classList.contains('inactive')) {
                focusWindow(windowId);
            } else {
                minimizeWindow(windowId);
            }
        }
    };
    taskbarApps.appendChild(taskbarItem);

    // App specific init
    if (appName === 'notepad') {
        const ta = document.getElementById(`notepad-area-${windowId}`);
        const status = document.getElementById(`notepad-status-${windowId}`);

        if (arg && fileSystem[arg] !== undefined) {
            ta.value = fileSystem[arg];
            ta.dataset.filename = arg;
        }

        const updateStatus = () => {
            const text = ta.value;
            const cursorPos = ta.selectionStart;
            const lines = text.substr(0, cursorPos).split('\n');
            const lineNum = lines.length;
            const colNum = lines[lines.length - 1].length + 1;
            status.textContent = `Ln ${lineNum}, Col ${colNum}`;
        };

        ta.addEventListener('input', updateStatus);
        ta.addEventListener('keyup', updateStatus);
        ta.addEventListener('click', updateStatus);
        // Initial update in case of loaded content
        updateStatus();
    }

    if (appName === 'terminal') {
        const input = win.querySelector('.terminal-input');
        let historyIndex = -1;
        let tempInput = '';

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleTerminalCommand(this.value, win.querySelector('.terminal-output'));
                this.value = '';
                historyIndex = -1;
                tempInput = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const history = window.terminalHistory || [];
                if (history.length === 0) return;

                if (historyIndex === -1) {
                    tempInput = this.value;
                    historyIndex = history.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                this.value = history[historyIndex];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const history = window.terminalHistory || [];
                if (history.length === 0) return;

                if (historyIndex !== -1) {
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        this.value = history[historyIndex];
                    } else {
                        historyIndex = -1;
                        this.value = tempInput;
                    }
                }
            }
        });
        setTimeout(() => input.focus(), 10);

        // Focus input when clicking anywhere in terminal
        win.querySelector('.window-content').addEventListener('click', () => input.focus());
    } else if (appName === 'calculator') {
        // Add keyboard support for calculator
        win.tabIndex = 0; // Make window focusable
        win.addEventListener('keydown', (e) => {
            const key = e.key;
            if (/[0-9+\-/*.]/.test(key)) {
                calcInput(windowId, key);
            } else if (key === 'Enter' || key === '=') {
                calcInput(windowId, '=');
            } else if (key === 'Escape' || key === 'Delete' || key === 'Backspace') {
                calcInput(windowId, 'C');
            }
        });
        // Focus the window initially to capture keys
        setTimeout(() => win.focus(), 10);
    }
}

function closeWindow(windowId) {
    // Cleanup Snake game if active
    if (snakeGames[windowId]) {
        clearInterval(snakeGames[windowId].interval);
        delete snakeGames[windowId];
    }

    // Cleanup Tic Tac Toe game if active
    if (tictactoeGames[windowId]) {
        delete tictactoeGames[windowId];
    }

    // Cleanup Calendar if active
    if (calendarStates[windowId]) {
        delete calendarStates[windowId];
    }

    const win = document.getElementById(windowId);
    if (win) {
        win.remove();
    }
    const taskbarItem = document.getElementById(`taskbar-${windowId}`);
    if (taskbarItem) {
        taskbarItem.remove();
    }
}

function focusWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.style.zIndex = ++zIndex;

        // Update taskbar
        document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
        const taskbarItem = document.getElementById(`taskbar-${windowId}`);
        if (taskbarItem) taskbarItem.classList.add('active');

        // Update title bars
        document.querySelectorAll('.window').forEach(w => w.classList.add('inactive'));
        win.classList.remove('inactive');
    }
}

// Dragging Logic
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

function startDrag(e, windowId) {
    if (e.target.closest('.window-button')) return;

    isDragging = true;
    currentWindow = document.getElementById(windowId);
    focusWindow(windowId);

    const rect = currentWindow.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!isDragging || !currentWindow) return;

    e.preventDefault();
    const x = e.clientX - offset.x;
    const y = e.clientY - offset.y;

    // Boundary checks (optional, but good)
    // For now, simple drag
    currentWindow.style.left = `${x}px`;
    currentWindow.style.top = `${y}px`;
}

function stopDrag() {
    isDragging = false;
    currentWindow = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// File System (InMemory)
const fileSystem = {
    'readme.txt': 'Welcome to WebOS! This is a simple browser-based OS.',
    'todo.list': '- Buy milk\n- Walk the dog\n- Code more',
};

// Terminal Logic
function handleTerminalCommand(cmd, outputDiv) {
    const line = document.createElement('div');
    line.textContent = '> ' + cmd;
    outputDiv.appendChild(line);

    let response = '';
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'help') {
        response = 'Available commands: help, date, clear, echo [text], ls, cat [file], open [file], touch [file], rm [file], about, reboot, whoami, pwd, history';
    } else if (command === 'date') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        response = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    } else if (command === 'clear') {
        outputDiv.innerHTML = '';
        return;
    } else if (command === 'echo') {
        response = args.join(' ');
    } else if (command === 'ls') {
        response = Object.keys(fileSystem).join('  ');
    } else if (command === 'cat') {
        if (args.length === 0) {
            response = 'Usage: cat [filename]';
        } else {
            const filename = args[0];
            if (fileSystem[filename] !== undefined) {
                // Handle newlines for display
                response = fileSystem[filename];
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'open') {
        if (args.length === 0) {
            response = 'Usage: open [filename]';
        } else {
            const filename = args[0];
            if (fileSystem[filename] !== undefined) {
                if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
                    openApp('paint', filename);
                    response = `Opening ${filename} in Paint...`;
                } else {
                    openApp('notepad', filename);
                    response = `Opening ${filename} in Notepad...`;
                }
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'touch') {
        if (args.length === 0) {
            response = 'Usage: touch [filename]';
        } else {
            const filename = args[0];
            if (!fileSystem[filename]) {
                fileSystem[filename] = '';
                saveFileSystem();
                response = `Created file: ${filename}`;
            } else {
                response = `File already exists: ${filename}`;
            }
        }
    } else if (command === 'rm') {
        if (args.length === 0) {
            response = 'Usage: rm [filename]';
        } else {
            const filename = args[0];
            if (fileSystem[filename] !== undefined) {
                delete fileSystem[filename];
                saveFileSystem();
                response = `Removed file: ${filename}`;
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'cp') {
        if (args.length < 2) {
            response = 'Usage: cp [source] [destination]';
        } else {
            const src = args[0];
            const dest = args[1];
            if (fileSystem[src] !== undefined) {
                fileSystem[dest] = fileSystem[src];
                saveFileSystem();
                response = `Copied ${src} to ${dest}`;
            } else {
                response = `File not found: ${src}`;
            }
        }
    } else if (command === 'mv') {
        if (args.length < 2) {
            response = 'Usage: mv [source] [destination]';
        } else {
            const src = args[0];
            const dest = args[1];
            if (fileSystem[src] !== undefined) {
                fileSystem[dest] = fileSystem[src];
                delete fileSystem[src];
                saveFileSystem();
                response = `Moved ${src} to ${dest}`;
            } else {
                response = `File not found: ${src}`;
            }
        }
    } else if (command === 'about') {
        openApp('about');
        response = 'Opened About window.';
    } else if (command === 'reboot') {
        location.reload();
    } else if (command === 'whoami') {
        response = 'user';
    } else if (command === 'pwd') {
        response = '/home/user';
    } else if (command === 'history') {
        // We need to track history first.
        // For now, let's just show a placeholder or implement simple tracking
        // But since we didn't add history tracking array, let's just say "Not implemented yet" or try to implement it now.
        // Actually, let's implement a simple history array.
        if (!window.terminalHistory) window.terminalHistory = [];
        response = window.terminalHistory.join('\n');
    } else if (command === '') {
        response = '';
    } else {
        response = `Command not found: ${command}`;
    }

    if (cmd.trim() !== '') {
        if (!window.terminalHistory) window.terminalHistory = [];
        window.terminalHistory.push(cmd);
    }

    if (response) {
        // Handle newlines in response by creating multiple divs or using whitespace: pre-wrap
        const respLine = document.createElement('div');
        respLine.style.whiteSpace = 'pre-wrap'; // Preserve newlines
        respLine.textContent = response;
        outputDiv.appendChild(respLine);
    }

    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Calculator Logic
function calcInput(windowId, value) {
    const display = document.getElementById(`calc-display-${windowId}`);
    const historyList = document.querySelector(`#calc-history-${windowId} .history-list`);
    if (!display) return;

    let currentText = display.textContent;

    if (value === 'C') {
        display.textContent = '0';
    } else if (value === 'BACK') {
        if (currentText.length > 1) {
            display.textContent = currentText.slice(0, -1);
        } else {
            display.textContent = '0';
        }
    } else if (value === '=') {
        try {
            // Prepare text for evaluation (replace symbols)
            let evalText = currentText
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/\^/g, '**');

            // Safety check: only allow numbers, operators, parens, and Math functions
            if (/^[0-9+\-/*().\sMathsincostanqrtpow,]+$/.test(evalText)) {
                // eslint-disable-next-line no-eval
                const result = eval(evalText);
                display.textContent = result;

                // Add to history
                if (historyList) {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `<span class="expr">${currentText} =</span><span class="res">${result}</span>`;
                    historyList.prepend(historyItem);
                }

            } else {
                display.textContent = 'Error';
            }
        } catch (e) {
            display.textContent = 'Error';
        }
    } else {
        if (currentText === '0' && value !== '.') {
            display.textContent = value;
        } else {
            display.textContent += value;
        }
    }
}

// Paint Logic
function initPaint(windowId, filename = null) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const container = canvas.parentElement;

    // Resize canvas to fit container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');

    if (filename && fileSystem[filename]) {
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, Math.min(img.width, canvas.width), Math.min(img.height, canvas.height));
        };
        img.src = fileSystem[filename];
    }

    let painting = false;

    // Handle resizing (basic)
    // For a real app, we might want to preserve content on resize,
    // but for simplicity, we'll just let it be fixed size or crop.

    function startPosition(e) {
        const tool = canvas.dataset.tool || 'brush';
        if (tool === 'fill') {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            const x = Math.floor(clientX - rect.left);
            const y = Math.floor(clientY - rect.top);
            const color = document.getElementById(`paint-color-${windowId}`).value;
            floodFill(ctx, x, y, color, canvas.width, canvas.height);
        } else {
            painting = true;
            drawPaint(e);
        }
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function drawPaint(e) {
        const tool = canvas.dataset.tool || 'brush';
        if (!painting || tool === 'fill') return;

        // Calculate mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineWidth = document.getElementById(`paint-size-${windowId}`).value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = document.getElementById(`paint-color-${windowId}`).value;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function floodFill(ctx, startX, startY, fillColor, width, height) {
        // Convert hex to rgb
        const r = parseInt(fillColor.slice(1, 3), 16);
        const g = parseInt(fillColor.slice(3, 5), 16);
        const b = parseInt(fillColor.slice(5, 7), 16);
        const a = 255;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const getPixelPos = (x, y) => (y * width + x) * 4;
        const startPos = getPixelPos(startX, startY);

        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        if (startR === r && startG === g && startB === b && startA === a) return;

        const matchStartColor = (pos) => {
            return data[pos] === startR && data[pos+1] === startG && data[pos+2] === startB && data[pos+3] === startA;
        };

        const colorPixel = (pos) => {
            data[pos] = r;
            data[pos+1] = g;
            data[pos+2] = b;
            data[pos+3] = a;
        };

        const stack = [[startX, startY]];

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const pos = getPixelPos(x, y);

            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (matchStartColor(pos)) {
                colorPixel(pos);
                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function handleTouch(handler) {
        return function(e) {
            e.preventDefault();
            handler(e);
        };
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', drawPaint);
    canvas.addEventListener('mouseleave', endPosition);

    // Touch support
    canvas.addEventListener('touchstart', handleTouch(startPosition));
    canvas.addEventListener('touchend', handleTouch(endPosition));
    canvas.addEventListener('touchmove', handleTouch(drawPaint));
}

function setPaintTool(windowId, tool) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    canvas.dataset.tool = tool;
}

function setPaintColor(windowId, color) {
    document.getElementById(`paint-color-${windowId}`).value = color;
}

function clearPaint(windowId) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function savePaint(windowId) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

function savePaintToSystem(windowId) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const dataURL = canvas.toDataURL();
    const filename = prompt("Enter filename to save (e.g., drawing.png):", "drawing.png");

    if (filename) {
        fileSystem[filename] = dataURL;
        saveFileSystem();
        alert(`Image "${filename}" saved to system.`);
    }
}

function openPaintFile(windowId) {
    const input = document.getElementById(`paint-input-${windowId}`);
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const ctx = canvas.getContext('2d');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Clear and draw image.
                // We could scale it or just draw it. Let's just draw it.
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, Math.min(img.width, canvas.width), Math.min(img.height, canvas.height));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// File Explorer Logic
function renderFileExplorer(windowId) {
    const container = document.getElementById(`explorer-content-${windowId}`);
    if (!container) return;

    container.innerHTML = '';

    Object.keys(fileSystem).forEach(filename => {
        const fileDiv = document.createElement('div');
        fileDiv.style.width = '60px';
        fileDiv.style.textAlign = 'center';
        fileDiv.style.cursor = 'pointer';
        fileDiv.style.display = 'flex';
        fileDiv.style.flexDirection = 'column';
        fileDiv.style.alignItems = 'center';
        fileDiv.style.padding = '5px';
        fileDiv.style.borderRadius = '5px';

        // Icon based on extension
        let iconChar = '📄';
        if (filename.endsWith('.png') || filename.endsWith('.jpg')) iconChar = '🖼️';

        const iconDiv = document.createElement('div');
        iconDiv.style.fontSize = '30px';
        iconDiv.textContent = iconChar;

        const nameDiv = document.createElement('div');
        nameDiv.style.fontSize = '11px';
        nameDiv.style.wordBreak = 'break-all';
        nameDiv.style.marginTop = '2px';
        nameDiv.style.lineHeight = '1.2';
        nameDiv.textContent = filename;

        // Action Buttons Container
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'none'; // Hidden by default
        actionsDiv.style.marginTop = '2px';
        actionsDiv.style.gap = '5px';

        // Rename Button
        const renameBtn = document.createElement('div');
        renameBtn.innerHTML = '✏️';
        renameBtn.style.fontSize = '12px';
        renameBtn.style.cursor = 'pointer';
        renameBtn.title = 'Rename File';

        renameBtn.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt(`Rename ${filename} to:`, filename);
            if (newName && newName !== filename) {
                if (fileSystem[newName]) {
                    alert('File with that name already exists!');
                } else {
                    fileSystem[newName] = fileSystem[filename];
                    delete fileSystem[filename];
                    saveFileSystem();
                    renderFileExplorer(windowId);
                }
            }
        };

        // Delete Button
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.title = 'Delete File';

        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent opening file
            if(confirm(`Delete ${filename}?`)) {
                delete fileSystem[filename];
                saveFileSystem();
                renderFileExplorer(windowId);
            }
        };

        actionsDiv.appendChild(renameBtn);
        actionsDiv.appendChild(deleteBtn);

        fileDiv.appendChild(iconDiv);
        fileDiv.appendChild(nameDiv);
        fileDiv.appendChild(actionsDiv);

        fileDiv.onmouseover = () => {
            fileDiv.style.backgroundColor = '#e0e0e0';
            actionsDiv.style.display = 'flex';
        };
        fileDiv.onmouseout = () => {
            fileDiv.style.backgroundColor = 'transparent';
            actionsDiv.style.display = 'none';
        };

        fileDiv.onclick = () => {
             if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
                 openApp('paint', filename);
             } else {
                 openApp('notepad', filename);
             }
        };

        container.appendChild(fileDiv);
    });
}

// Notepad Logic
function saveNotepad(windowId) {
    const textarea = document.getElementById(`notepad-area-${windowId}`);
    const text = textarea.value;
    const defaultName = textarea.dataset.filename || "document.txt";

    const filename = prompt("Enter filename to save (e.g., notes.txt):", defaultName);
    if (filename) {
        fileSystem[filename] = text;
        saveFileSystem();
        alert(`File "${filename}" saved to system.`);
    }
}

function downloadNotepad(windowId) {
    const textarea = document.getElementById(`notepad-area-${windowId}`);
    const text = textarea.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'document.txt';
    link.href = url;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
}

function openNotepadFile(windowId) {
    const input = document.getElementById(`notepad-input-${windowId}`);
    const textarea = document.getElementById(`notepad-area-${windowId}`);

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            textarea.value = e.target.result;
        };
        reader.readAsText(input.files[0]);
    }
}

// Snake Game Logic
const snakeGames = {};

function startSnake(windowId) {
    const canvas = document.getElementById(`snake-canvas-${windowId}`);
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById(`snake-score-${windowId}`);
    const highScoreElement = document.getElementById(`snake-highscore-${windowId}`);

    if (snakeGames[windowId]) {
        clearInterval(snakeGames[windowId].interval);
    }

    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 1;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = `High Score: ${highScore}`;

    const gridSize = 20;
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;

    // Handle Input
    function handleKey(e) {
        // Prevent default scrolling for arrow keys
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowUp': if(dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if(dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if(dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if(dx !== -1) { dx = 1; dy = 0; } break;
        }
    }

    // Use window listener but filter for active window focus could be tricky.
    // Simpler: Add listener to document, remove on game over/close
    // But we need to handle multiple windows.
    // Let's bind it to the specific window focus logic?
    // For simplicity, we'll just add a listener that checks if this window is active?
    // Or just add/remove listener when window is focused?
    // The existing focus logic doesn't trigger an event we can easily hook without modifying focusWindow.
    // We'll stick to a global listener that checks if the focused window is this snake window.

    // Better approach: Attach keydown to document, check if `document.activeElement` is inside the window?
    // Or just checking if the window has `zIndex` highest?

    // Let's attach to the window element itself and make it focusable?
    // The window content `div` has `onclick="focusWindow..."`.
    // Let's make the canvas focusable.
    canvas.tabIndex = 1;
    canvas.focus();
    canvas.onkeydown = handleKey;


    function draw() {
        // Move Snake
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};

        // Wrap around
        if (head.x < 0) head.x = tileCountX - 1;
        if (head.x >= tileCountX) head.x = 0;
        if (head.y < 0) head.y = tileCountY - 1;
        if (head.y >= tileCountY) head.y = 0;

        // Collision with self
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
            food = {
                x: Math.floor(Math.random() * tileCountX),
                y: Math.floor(Math.random() * tileCountY)
            };
        } else {
            snake.pop();
        }

        // Draw
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'lime';
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function gameOver() {
        clearInterval(snakeGames[windowId].interval);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText("Game Over", 120, 150);
        delete snakeGames[windowId];
    }

    snakeGames[windowId] = {
        interval: setInterval(draw, 100)
    };
}

function maximizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    if (win.classList.contains('maximized')) {
        // Restore
        win.classList.remove('maximized');
        win.style.left = win.dataset.prevLeft;
        win.style.top = win.dataset.prevTop;
        win.style.width = win.dataset.prevWidth || '';
        win.style.height = win.dataset.prevHeight || '';
    } else {
        // Maximize
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;

        win.classList.add('maximized');
        // Reset styles to allow CSS to take over
        win.style.left = '';
        win.style.top = '';
        win.style.width = '';
        win.style.height = '';
    }
}

function minimizeWindow(windowId) {
    const win = document.getElementById(windowId);
    const taskbarItem = document.getElementById(`taskbar-${windowId}`);

    if (win.style.display === 'none') {
        // Restore
        win.style.display = 'flex';
        focusWindow(windowId);
    } else {
        // Minimize
        win.style.display = 'none';
        if (taskbarItem) {
            taskbarItem.classList.remove('active');
        }
    }
}

// Resize Logic
let isResizing = false;
let currentResizeWindow = null;
let resizeDir = '';
let resizeOffset = { x: 0, y: 0 };
let originalSize = { w: 0, h: 0 };
let originalPos = { x: 0, y: 0 };

function startResize(e, windowId, direction) {
    e.stopPropagation(); // Prevent drag start
    isResizing = true;
    currentResizeWindow = document.getElementById(windowId);
    resizeDir = direction;
    resizeOffset.x = e.clientX;
    resizeOffset.y = e.clientY;

    const rect = currentResizeWindow.getBoundingClientRect();
    originalSize.w = rect.width;
    originalSize.h = rect.height;
    originalPos.x = rect.left;
    originalPos.y = rect.top;

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function resize(e) {
    if (!isResizing || !currentResizeWindow) return;

    const dx = e.clientX - resizeOffset.x;
    const dy = e.clientY - resizeOffset.y;

    if (resizeDir === 'r' || resizeDir === 'br') {
        currentResizeWindow.style.width = `${Math.max(200, originalSize.w + dx)}px`;
    }
    if (resizeDir === 'b' || resizeDir === 'br') {
        currentResizeWindow.style.height = `${Math.max(150, originalSize.h + dy)}px`;
    }
}

function stopResize() {
    isResizing = false;
    currentResizeWindow = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// File System Persistence
function saveFileSystem() {
    localStorage.setItem('webos-filesystem', JSON.stringify(fileSystem));
}

function loadFileSystem() {
    const saved = localStorage.getItem('webos-filesystem');
    if (saved) {
        try {
            Object.assign(fileSystem, JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load file system:', e);
        }
    }
}

// Speak App Logic
function speakText(windowId) {
    const text = document.getElementById(`speak-text-${windowId}`).value;
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

// Camera Logic
function startCamera(windowId) {
    const video = document.getElementById(`camera-video-${windowId}`);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
            })
            .catch(function(err) {
                alert("Error accessing camera: " + err.message);
            });
    } else {
        alert("Camera not supported on this device/browser.");
    }
}

function takeSnapshot(windowId) {
    const video = document.getElementById(`camera-video-${windowId}`);
    const canvas = document.getElementById(`camera-canvas-${windowId}`);
    if (!video.srcObject) {
        alert("Please start the camera first.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    const filename = prompt("Enter filename to save snapshot (e.g., photo.png):", "photo.png");

    if (filename) {
        fileSystem[filename] = dataURL;
        saveFileSystem();
        alert(`Snapshot saved as ${filename}`);
    }
}

// Initialize FileSystem
loadFileSystem();

// Minesweeper Logic
const minesweeperGames = {};

function initMinesweeper(windowId) {
    const grid = document.getElementById(`ms-grid-${windowId}`);
    const minesDisplay = document.getElementById(`ms-mines-${windowId}`);
    const timerDisplay = document.getElementById(`ms-timer-${windowId}`);
    if (!grid) return;

    // Clear previous game
    if (minesweeperGames[windowId]) {
        clearInterval(minesweeperGames[windowId].timerInterval);
    }

    const rows = 9;
    const cols = 9;
    const mineCount = 10;

    minesweeperGames[windowId] = {
        board: [],
        gameOver: false,
        timer: 0,
        timerInterval: null,
        minesLeft: mineCount,
        revealedCount: 0,
        rows: rows,
        cols: cols,
        mineCount: mineCount,
        firstClick: true
    };

    grid.innerHTML = '';
    minesDisplay.textContent = String(mineCount).padStart(3, '0');
    timerDisplay.textContent = '000';

    // Initialize UI
    for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.id = `ms-cell-${windowId}-${r}-${c}`;
            cell.style.width = '25px';
            cell.style.height = '25px';
            cell.style.background = '#c0c0c0';
            cell.style.border = '2px solid white';
            cell.style.borderRightColor = '#808080';
            cell.style.borderBottomColor = '#808080';
            cell.style.cursor = 'pointer';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '16px';
            cell.style.fontWeight = 'bold';

            cell.onmousedown = (e) => handleMinesweeperClick(e, windowId, r, c);
            cell.oncontextmenu = (e) => { e.preventDefault(); handleMinesweeperClick(e, windowId, r, c); };

            grid.appendChild(cell);
            rowArr.push({ isMine: false, isOpen: false, isFlagged: false, neighbors: 0 });
        }
        minesweeperGames[windowId].board.push(rowArr);
    }
}

function handleMinesweeperClick(e, windowId, r, c) {
    const game = minesweeperGames[windowId];
    if (!game || game.gameOver) return;

    // Start timer on first click
    if (game.firstClick && e.button !== 2) { // Only left click starts game logic placement
         startMinesweeperTimer(windowId);
         placeMines(windowId, r, c);
         game.firstClick = false;
    }

    if (e.button === 2) { // Right click - Flag
        toggleFlag(windowId, r, c);
    } else if (e.button === 0) { // Left click - Reveal
        revealCell(windowId, r, c);
    }
}

function startMinesweeperTimer(windowId) {
    const game = minesweeperGames[windowId];
    game.timerInterval = setInterval(() => {
        game.timer++;
        const timerDisplay = document.getElementById(`ms-timer-${windowId}`);
        if (timerDisplay) {
            timerDisplay.textContent = String(Math.min(999, game.timer)).padStart(3, '0');
        }
    }, 1000);
}

function placeMines(windowId, safeR, safeC) {
    const game = minesweeperGames[windowId];
    let placed = 0;
    while (placed < game.mineCount) {
        const r = Math.floor(Math.random() * game.rows);
        const c = Math.floor(Math.random() * game.cols);

        // Ensure no mine at start position and no duplicates
        if ((Math.abs(r - safeR) > 1 || Math.abs(c - safeC) > 1) && !game.board[r][c].isMine) {
            game.board[r][c].isMine = true;
            placed++;
        }
    }

    // Calculate neighbors
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (!game.board[r][c].isMine) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (r+i >= 0 && r+i < game.rows && c+j >= 0 && c+j < game.cols && game.board[r+i][c+j].isMine) {
                            count++;
                        }
                    }
                }
                game.board[r][c].neighbors = count;
            }
        }
    }
}

function toggleFlag(windowId, r, c) {
    const game = minesweeperGames[windowId];
    const cellData = game.board[r][c];
    if (cellData.isOpen) return;

    const cell = document.getElementById(`ms-cell-${windowId}-${r}-${c}`);
    if (cellData.isFlagged) {
        cellData.isFlagged = false;
        cell.textContent = '';
        game.minesLeft++;
    } else {
        if (game.minesLeft > 0) {
            cellData.isFlagged = true;
            cell.textContent = '🚩';
            game.minesLeft--;
        }
    }
    const minesDisplay = document.getElementById(`ms-mines-${windowId}`);
    if (minesDisplay) minesDisplay.textContent = String(game.minesLeft).padStart(3, '0');
}

function revealCell(windowId, r, c) {
    const game = minesweeperGames[windowId];
    const cellData = game.board[r][c];

    if (cellData.isOpen || cellData.isFlagged) return;

    cellData.isOpen = true;
    game.revealedCount++;
    const cell = document.getElementById(`ms-cell-${windowId}-${r}-${c}`);

    // Style as pressed
    cell.style.border = '1px solid #999';
    cell.style.background = '#d0d0d0';

    if (cellData.isMine) {
        cell.style.background = 'red';
        cell.textContent = '💣';
        endMinesweeper(windowId, false);
    } else {
        if (cellData.neighbors > 0) {
            cell.textContent = cellData.neighbors;
            const colors = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'];
            cell.style.color = colors[cellData.neighbors - 1];
        } else {
            // Flood fill
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (r+i >= 0 && r+i < game.rows && c+j >= 0 && c+j < game.cols) {
                        revealCell(windowId, r+i, c+j);
                    }
                }
            }
        }

        // Check win
        if (game.revealedCount === (game.rows * game.cols - game.mineCount)) {
            endMinesweeper(windowId, true);
        }
    }
}

function endMinesweeper(windowId, win) {
    const game = minesweeperGames[windowId];
    game.gameOver = true;
    clearInterval(game.timerInterval);

    // Reveal all mines if lost
    if (!win) {
        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                if (game.board[r][c].isMine) {
                    const cell = document.getElementById(`ms-cell-${windowId}-${r}-${c}`);
                    if (!game.board[r][c].isFlagged) {
                        cell.textContent = '💣';
                    }
                }
            }
        }
        // Face change (optional, button text is usually just restart)
        // We used 😊 in button, maybe change to 😵
    } else {
        // Flag all mines
         for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                if (game.board[r][c].isMine) {
                     const cell = document.getElementById(`ms-cell-${windowId}-${r}-${c}`);
                     cell.textContent = '🚩';
                }
            }
        }
        // Face change to 😎
    }
}

// Calendar Logic
const calendarStates = {};

function initCalendar(windowId) {
    const now = new Date();
    calendarStates[windowId] = {
        currentDate: now,
        displayDate: new Date(now.getFullYear(), now.getMonth(), 1)
    };
    renderCalendar(windowId);
}

function changeCalendarMonth(windowId, delta) {
    if (!calendarStates[windowId]) return;
    const state = calendarStates[windowId];
    state.displayDate.setMonth(state.displayDate.getMonth() + delta);
    renderCalendar(windowId);
}

function renderCalendar(windowId) {
    if (!calendarStates[windowId]) return;
    const state = calendarStates[windowId];
    const grid = document.getElementById(`calendar-grid-${windowId}`);
    const header = document.getElementById(`calendar-month-year-${windowId}`);

    if (!grid || !header) return;

    grid.innerHTML = '';
    const year = state.displayDate.getFullYear();
    const month = state.displayDate.getMonth();

    header.textContent = state.displayDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    // Previous month filler
    for (let i = 0; i < startDayOfWeek; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell empty';
        grid.appendChild(cell);
    }

    // Days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.textContent = d;
        cell.style.border = '1px solid #ccc';
        cell.style.background = 'white';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.cursor = 'default';
        cell.style.fontSize = '14px';

        // Check if today
        if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
            cell.style.background = '#0078d7';
            cell.style.color = 'white';
            cell.style.fontWeight = 'bold';
            cell.title = 'Today';
        }

        cell.onmouseover = () => {
             if (cell.style.background !== 'rgb(0, 120, 215)' && cell.style.background !== '#0078d7') {
                 cell.style.background = '#e0e0e0';
             }
        };
        cell.onmouseout = () => {
             if (cell.style.background !== 'rgb(0, 120, 215)' && cell.style.background !== '#0078d7') {
                 cell.style.background = 'white';
             }
        };

        grid.appendChild(cell);
    }
}

// Tic Tac Toe Logic
const tictactoeGames = {};

function resetTicTacToe(windowId) {
    tictactoeGames[windowId] = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        gameOver: false
    };
    const status = document.getElementById(`ttt-status-${windowId}`);
    if (status) status.textContent = "Player X's Turn";

    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`ttt-cell-${windowId}-${i}`);
        if (cell) {
            cell.textContent = '';
            cell.style.color = 'black';
            cell.style.backgroundColor = 'white';
        }
    }
}

function playTicTacToe(windowId, index) {
    const game = tictactoeGames[windowId];
    if (!game || game.gameOver || game.board[index]) return;

    game.board[index] = game.currentPlayer;
    const cell = document.getElementById(`ttt-cell-${windowId}-${index}`);
    cell.textContent = game.currentPlayer;
    cell.style.color = game.currentPlayer === 'X' ? '#e74c3c' : '#2980b9';

    if (checkTicTacToeWin(windowId, game.currentPlayer)) {
        document.getElementById(`ttt-status-${windowId}`).textContent = `Player ${game.currentPlayer} Wins!`;
        game.gameOver = true;
    } else if (game.board.every(cell => cell)) {
        document.getElementById(`ttt-status-${windowId}`).textContent = "It's a Draw!";
        game.gameOver = true;
    } else {
        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById(`ttt-status-${windowId}`).textContent = `Player ${game.currentPlayer}'s Turn`;
    }
}

function checkTicTacToeWin(windowId, player) {
    const game = tictactoeGames[windowId];
    const b = game.board;
    const wins = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Cols
        [0,4,8], [2,4,6]           // Diagonals
    ];

    for (let combo of wins) {
        if (b[combo[0]] === player && b[combo[1]] === player && b[combo[2]] === player) {
            // Highlight
            combo.forEach(i => {
                const cell = document.getElementById(`ttt-cell-${windowId}-${i}`);
                if (cell) cell.style.backgroundColor = '#2ecc71';
            });
            return true;
        }
    }
    return false;
}
