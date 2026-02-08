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

function setThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('themeColor', color);
}

// Load Settings
window.addEventListener('load', () => {
    const savedBg = localStorage.getItem('desktopBackground');
    if (savedBg) {
        document.getElementById('desktop').style.background = savedBg;
        document.getElementById('desktop').style.backgroundSize = 'cover';
    }

    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
        document.documentElement.style.setProperty('--theme-color', savedTheme);
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

    // Initialize Sticky Notes
    initStickyNotes();
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
    const searchInput = document.getElementById('start-search');

    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        btn.classList.add('active');
        if (searchInput) {
            searchInput.value = '';
            filterStartMenu('');
            setTimeout(() => searchInput.focus(), 50);
        }
    } else {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
}

function filterStartMenu(query) {
    const items = document.querySelectorAll('.start-item');
    const divider = document.querySelector('.start-divider');
    const q = query.toLowerCase();

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(q)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    if (divider) {
        divider.style.display = query !== '' ? 'none' : 'block';
    }
}

// Initialize Search Listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('start-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterStartMenu(e.target.value);
        });
        // Stop propagation to prevent menu closing if we had click logic on items that bubbled?
        // Actually, preventing default might be needed for keys?
        // For now, simple input listener is enough.
    }
});

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

// Show Desktop Logic
let windowsHidden = false;

function toggleDesktop() {
    const windows = document.querySelectorAll('.window');

    // Check if any window is visible
    let anyVisible = false;
    windows.forEach(win => {
        if (win.style.display !== 'none') {
            anyVisible = true;
        }
    });

    if (anyVisible) {
        // Minimize all
        windows.forEach(win => {
            if (win.style.display !== 'none') {
                 // Store state if needed, but minimizeWindow handles taskbar update
                 // However, minimizeWindow toggles if we use it blindly.
                 // We should manually hide.
                 win.style.display = 'none';
                 // Update taskbar item status
                 const taskbarItem = document.getElementById(`taskbar-${win.id}`);
                 if (taskbarItem) taskbarItem.classList.remove('active');

                 // Mark as hidden by this action so we can restore them later?
                 // Simple implementation: just hide all.
                 win.dataset.minimizedByShowDesktop = 'true';
            }
        });
        windowsHidden = true;
    } else {
        // Restore those that were minimized by Show Desktop, or just all?
        // Standard behavior: Restore all windows that were open.
        windows.forEach(win => {
            if (win.dataset.minimizedByShowDesktop === 'true') {
                win.style.display = 'flex';
                const taskbarItem = document.getElementById(`taskbar-${win.id}`);
                // Only set active if it was focused? Or just let them be visible inactive.
                // Let's just restore visibility.
                delete win.dataset.minimizedByShowDesktop;
            }
        });
        windowsHidden = false;
    }
}

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
        // Initialize terminal state
        terminalStates[windowId] = { cwd: '/' };
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
            <div class="explorer-toolbar" style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 5px;">
                <button onclick="renderFileExplorer('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Refresh</button>
                <button onclick="createNewFolder('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">New Folder</button>
                <input type="text" id="explorer-path-${windowId}" readonly value="/" style="flex-grow: 1; font-size: 12px; padding: 2px 5px; border: 1px solid #ccc; background: #fff; color: #555;">
            </div>
            <div id="explorer-content-${windowId}" style="padding: 10px; display: flex; flex-wrap: wrap; gap: 15px; overflow-y: auto; height: 100%; align-content: flex-start; background: white;">
            </div>
        `;
        // Initialize explorer state
        explorerStates[windowId] = { path: '/' };
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
                <h3>Window Theme</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                    <div onclick="setThemeColor('#0078d7')" style="width: 30px; height: 30px; background: #0078d7; cursor: pointer; border: 1px solid #999;"></div>
                    <div onclick="setThemeColor('#2ecc71')" style="width: 30px; height: 30px; background: #2ecc71; cursor: pointer; border: 1px solid #999;"></div>
                    <div onclick="setThemeColor('#e74c3c')" style="width: 30px; height: 30px; background: #e74c3c; cursor: pointer; border: 1px solid #999;"></div>
                    <div onclick="setThemeColor('#9b59b6')" style="width: 30px; height: 30px; background: #9b59b6; cursor: pointer; border: 1px solid #999;"></div>
                    <div onclick="setThemeColor('#34495e')" style="width: 30px; height: 30px; background: #34495e; cursor: pointer; border: 1px solid #999;"></div>
                    <input type="color" onchange="setThemeColor(this.value)" value="#0078d7" style="height: 35px; cursor: pointer;">
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
            <div class="calendar-header">
                <button onclick="changeCalendarMonth('${windowId}', -1)">&lt;</button>
                <h3 id="cal-month-${windowId}">Month Year</h3>
                <button onclick="changeCalendarMonth('${windowId}', 1)">&gt;</button>
            </div>
            <div class="calendar-grid" id="cal-grid-${windowId}">
                <!-- Days generated by JS -->
            </div>
        `;
        setTimeout(() => initCalendar(windowId), 0);
    } else if (appName === 'memory') {
        title = "Memory";
        win.classList.add('memory-window');
        content = `
            <div class="memory-header">
                <button onclick="initMemory('${windowId}')" style="padding: 5px 10px; cursor: pointer; border-radius: 4px; border: none; background: #e74c3c; color: white; font-weight: bold;">Restart</button>
                <div id="memory-moves-${windowId}" style="font-weight: bold; font-size: 16px;">Moves: 0</div>
                <div id="memory-timer-${windowId}" style="font-weight: bold; font-size: 16px;">00:00</div>
            </div>
            <div class="memory-grid" id="memory-grid-${windowId}">
                <!-- Cards generated by JS -->
            </div>
        `;
        setTimeout(() => initMemory(windowId), 0);
    } else if (appName === 'music-player') {
        title = "Music Player";
        win.classList.add('music-player-window');
        content = `
            <div class="music-player-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; background: #222; color: white; box-sizing: border-box;">
                <div class="music-icon" style="font-size: 64px; margin-bottom: 20px;">🎵</div>
                <div id="music-track-name-${windowId}" style="margin-bottom: 20px; font-weight: bold; text-align: center; word-break: break-all;">No file selected</div>
                <audio id="music-audio-${windowId}" controls style="width: 100%; margin-bottom: 20px;"></audio>
                <label style="background: #e91e63; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; transition: background 0.3s;">
                    Open Music File
                    <input type="file" id="music-input-${windowId}" accept="audio/*" style="display: none;" onchange="handleMusicFile('${windowId}')">
                </label>
            </div>
        `;
    } else if (appName === 'video-player') {
        title = "Video Player";
        win.classList.add('video-player-window');
        content = `
            <div class="video-player-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 0; background: #000; color: white; box-sizing: border-box; overflow: hidden;">
                <video id="video-player-${windowId}" controls style="width: 100%; height: 100%; max-height: calc(100% - 40px); object-fit: contain;"></video>
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; width: 100%; background: #222;">
                    <label style="background: #673ab7; color: white; padding: 5px 15px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 10px;">
                        Open Video
                        <input type="file" id="video-input-${windowId}" accept="video/*" style="display: none;" onchange="handleVideoFile('${windowId}')">
                    </label>
                    <div id="video-name-${windowId}" style="font-size: 12px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">No video</div>
                </div>
            </div>
        `;
    } else if (appName === 'tetris') {
        title = "Tetris";
        win.classList.add('tetris-window');
        content = `
            <div class="tetris-container">
                <canvas id="tetris-canvas-${windowId}" width="240" height="400" class="tetris-canvas"></canvas>
                <div class="tetris-info">
                    <div class="tetris-score-box">
                        <div class="tetris-label">Score</div>
                        <div id="tetris-score-${windowId}" class="tetris-value">0</div>
                    </div>
                    <div class="tetris-score-box">
                        <div class="tetris-label">Level</div>
                        <div id="tetris-level-${windowId}" class="tetris-value">1</div>
                    </div>
                     <div class="tetris-score-box">
                        <div class="tetris-label">Lines</div>
                        <div id="tetris-lines-${windowId}" class="tetris-value">0</div>
                    </div>
                    <div style="margin-top: 10px;">
                        <button onclick="initTetris('${windowId}')" style="width: 100%; padding: 8px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">New Game</button>
                    </div>
                    <div class="tetris-controls-hint">
                        <p>⬆️ Rotate</p>
                        <p>⬅️➡️ Move</p>
                        <p>⬇️ Soft Drop</p>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initTetris(windowId), 0);
    } else if (appName === 'clock') {
        title = "Clock";
        win.classList.add('clock-window');
        content = `
            <div class="clock-tabs" id="clock-tabs-${windowId}">
                <button class="clock-tab-btn active" data-tab="clock" onclick="switchClockTab('${windowId}', 'clock')">Clock</button>
                <button class="clock-tab-btn" data-tab="stopwatch" onclick="switchClockTab('${windowId}', 'stopwatch')">Stopwatch</button>
                <button class="clock-tab-btn" data-tab="timer" onclick="switchClockTab('${windowId}', 'timer')">Timer</button>
                <button class="clock-tab-btn" data-tab="world" onclick="switchClockTab('${windowId}', 'world')">World</button>
            </div>
            <div id="clock-content-${windowId}" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <!-- Clock Tab -->
                <div id="clock-tab-clock-${windowId}" class="clock-tab-content active">
                    <div id="clock-time-${windowId}" class="clock-display">00:00:00</div>
                    <div id="clock-date-${windowId}" class="clock-date">Date</div>
                </div>

                <!-- Stopwatch Tab -->
                <div id="clock-tab-stopwatch-${windowId}" class="clock-tab-content">
                    <div id="stopwatch-display-${windowId}" class="stopwatch-display">00:00.00</div>
                    <div class="clock-controls">
                        <button id="sw-start-${windowId}" class="clock-btn start" onclick="startStopwatch('${windowId}')">Start</button>
                        <button id="sw-stop-${windowId}" class="clock-btn stop" onclick="stopStopwatch('${windowId}')" style="display: none;">Stop</button>
                        <button id="sw-lap-${windowId}" class="clock-btn lap" onclick="lapStopwatch('${windowId}')" style="display: none;">Lap</button>
                        <button id="sw-reset-${windowId}" class="clock-btn reset" onclick="resetStopwatch('${windowId}')">Reset</button>
                    </div>
                    <div id="laps-list-${windowId}" class="laps-list"></div>
                </div>

                <!-- Timer Tab -->
                <div id="clock-tab-timer-${windowId}" class="clock-tab-content">
                    <div id="timer-display-${windowId}" class="timer-display" style="display: none;">00:00</div>

                    <div id="timer-setup-${windowId}" style="display: flex; flex-direction: column; align-items: center;">
                        <div class="timer-input-group">
                            <input type="number" id="timer-min-${windowId}" class="timer-input" placeholder="00" min="0" max="99" value="5">
                            <span class="timer-label">min</span>
                            <input type="number" id="timer-sec-${windowId}" class="timer-input" placeholder="00" min="0" max="59" value="0">
                            <span class="timer-label">sec</span>
                        </div>
                        <div class="clock-controls">
                            <button class="clock-btn start" onclick="startTimer('${windowId}')">Start</button>
                        </div>
                    </div>

                    <div id="timer-running-${windowId}" class="clock-controls" style="display: none;">
                         <button class="clock-btn stop" onclick="stopTimer('${windowId}')">Pause</button>
                         <button class="clock-btn start" onclick="startTimer('${windowId}')">Resume</button>
                         <button class="clock-btn reset" onclick="resetTimer('${windowId}')">Reset</button>
                    </div>
                </div>

                <!-- World Clock Tab -->
                <div id="clock-tab-world-${windowId}" class="clock-tab-content">
                    <div style="display: flex; gap: 5px; margin-bottom: 10px; width: 100%;">
                        <select id="world-clock-select-${windowId}" style="padding: 5px; flex-grow: 1; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
                            <!-- Options populated by JS -->
                        </select>
                        <button onclick="addWorldCity('${windowId}')" class="clock-btn start" style="min-width: 50px; font-size: 12px;">Add</button>
                    </div>
                    <div id="world-clock-list-${windowId}" style="width: 100%; display: flex; flex-direction: column; gap: 5px; overflow-y: auto;">
                        <!-- List populated by JS -->
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initClock(windowId), 0);
    } else if (appName === 'browser') {
        title = "Web Browser";
        win.classList.add('browser-window');
        content = `
            <div class="browser-toolbar">
                <button onclick="handleBrowserNav('${windowId}', 'back')">Back</button>
                <button onclick="handleBrowserNav('${windowId}', 'forward')">Forward</button>
                <button onclick="handleBrowserNav('${windowId}', 'refresh')">Refresh</button>
                <button onclick="handleBrowserNav('${windowId}', 'home')">Home</button>
                <input type="text" id="browser-url-${windowId}" value="https://www.wikipedia.org" onkeydown="if(event.key === 'Enter') navigateBrowser('${windowId}', this.value)">
                <button onclick="navigateBrowser('${windowId}', document.getElementById('browser-url-${windowId}').value)">Go</button>
            </div>
            <iframe id="browser-iframe-${windowId}" class="browser-iframe" src="https://www.wikipedia.org"></iframe>
        `;
        // Initialize state
        browserStates[windowId] = {
            history: ['https://www.wikipedia.org'],
            currentIndex: 0
        };
    } else if (appName === 'unit-converter') {
        title = "Unit Converter";
        win.classList.add('unit-converter-window');
        content = `
            <div class="converter-container" style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                <div class="converter-row">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category</label>
                    <select id="conv-category-${windowId}" style="width: 100%; padding: 5px;" onchange="updateConverterCategory('${windowId}')">
                        <option value="length">Length</option>
                        <option value="weight">Weight</option>
                        <option value="temperature">Temperature</option>
                    </select>
                </div>

                <div class="converter-row" style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 1;">
                        <input type="number" id="conv-input-${windowId}" value="1" style="width: 100%; padding: 5px; box-sizing: border-box;" oninput="convertUnits('${windowId}')">
                    </div>
                    <div style="flex: 1;">
                        <select id="conv-from-${windowId}" style="width: 100%; padding: 5px;" onchange="convertUnits('${windowId}')">
                            <!-- Options populated by JS -->
                        </select>
                    </div>
                </div>

                <div style="text-align: center; font-size: 20px; font-weight: bold;">=</div>

                <div class="converter-row" style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 1;">
                        <input type="text" id="conv-output-${windowId}" readonly style="width: 100%; padding: 5px; background: #eee; border: 1px solid #ccc; box-sizing: border-box;">
                    </div>
                    <div style="flex: 1;">
                        <select id="conv-to-${windowId}" style="width: 100%; padding: 5px;" onchange="convertUnits('${windowId}')">
                            <!-- Options populated by JS -->
                        </select>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initUnitConverter(windowId), 0);
    } else if (appName === 'sticky-notes') {
        title = "Note";
        win.classList.add('sticky-note-window');

        let noteId = arg;
        if (!noteId) {
            noteId = 'note-' + Date.now();
            stickyNotes[noteId] = {
                content: '',
                x: win.style.left,
                y: win.style.top,
                width: '200px',
                height: '200px'
            };
            saveStickyNotesToStorage();
        }

        if (!stickyNotes[noteId]) {
             stickyNotes[noteId] = { content: '', x: '100px', y: '100px' };
        }

        const note = stickyNotes[noteId];
        win.dataset.noteId = noteId;

        // Apply saved position/size
        if (note.x) win.style.left = note.x;
        if (note.y) win.style.top = note.y;
        if (note.width) win.style.width = note.width;
        if (note.height) win.style.height = note.height;

        content = `
            <div class="sticky-toolbar">
                <button class="sticky-btn" onclick="deleteStickyNote('${noteId}')" title="Delete Note">🗑️</button>
            </div>
            <textarea class="sticky-note-textarea"
                id="sticky-note-textarea-${noteId}"
                oninput="updateStickyNote('${noteId}', this.value)"
                placeholder="Type here..."></textarea>
        `;
    } else if (appName === 'task-manager') {
        title = "Task Manager";
        win.classList.add('task-manager-window');
        content = `
            <div class="task-manager-content" style="display: flex; flex-direction: column; height: 100%; background: white;">
                <div class="task-header" style="display: grid; grid-template-columns: 2fr 1fr 1fr 80px; padding: 5px 10px; background: #eee; border-bottom: 1px solid #ccc; font-weight: bold; font-size: 12px;">
                    <div>Application</div>
                    <div>CPU</div>
                    <div>Mem</div>
                    <div style="text-align: center;">Action</div>
                </div>
                <div id="task-list-${windowId}" class="task-list" style="flex-grow: 1; overflow-y: auto;">
                    <!-- Tasks generated by JS -->
                </div>
                <div class="task-footer" style="padding: 5px; background: #f0f0f0; border-top: 1px solid #ccc; font-size: 11px; color: #666; text-align: right;">
                    Processes: <span id="task-count-${windowId}">0</span>
                </div>
            </div>
        `;
        setTimeout(() => initTaskManager(windowId), 0);
    } else if (appName === 'solitaire') {
        title = "Solitaire";
        win.classList.add('solitaire-window');
        // Explicit dimensions as per requirements
        win.style.width = '600px';
        win.style.height = '500px';

        content = `
            <div class="solitaire-board" id="solitaire-board-${windowId}">
                <!-- Game rendered by JS -->
            </div>
        `;
        setTimeout(() => initSolitaire(windowId), 0);
    } else if (appName === 'pong') {
        title = "Pong";
        win.classList.add('pong-window');
        content = `
            <div class="pong-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #222;">
                <canvas id="pong-canvas-${windowId}" width="400" height="300" style="border: 2px solid #555; background: black;"></canvas>
                <div style="margin-top: 10px; color: white; font-family: 'Courier New', monospace; font-weight: bold; font-size: 20px;">
                    <span id="pong-score-p1-${windowId}">0</span> - <span id="pong-score-p2-${windowId}">0</span>
                </div>
                <div style="color: #aaa; font-size: 12px; margin-top: 5px;">Use Up/Down arrows to move.</div>
                <button onclick="initPong('${windowId}')" style="margin-top: 10px; padding: 5px 15px; cursor: pointer;">Restart</button>
            </div>
        `;
        setTimeout(() => initPong(windowId), 0);
    } else if (appName === '2048') {
        title = "2048";
        win.classList.add('game-2048-window');
        content = `
            <div class="game-2048-overlay" id="game-2048-overlay-${windowId}" style="display: none;">
                 <div class="game-2048-msg" id="game-2048-msg-${windowId}">Game Over</div>
                 <button class="game-2048-restart-btn" onclick="initGame2048('${windowId}')">Try Again</button>
            </div>
            <div class="game-2048-header">
                <div class="game-2048-title">2048</div>
                <div class="game-2048-scores">
                    <div class="game-2048-score-box">
                        <div class="game-2048-score-label">SCORE</div>
                        <div class="game-2048-score-value" id="game-2048-score-${windowId}">0</div>
                    </div>
                     <div class="game-2048-score-box">
                        <div class="game-2048-score-label">BEST</div>
                        <div class="game-2048-score-value" id="game-2048-best-${windowId}">0</div>
                    </div>
                </div>
            </div>
            <div class="game-2048-header" style="justify-content: flex-end; margin-top: -10px;">
                <button class="game-2048-restart-btn" style="font-size: 14px; padding: 5px 10px;" onclick="initGame2048('${windowId}')">New Game</button>
            </div>
            <div class="game-2048-container">
                <div class="game-2048-grid" id="game-2048-grid-${windowId}">
                    <!-- Cells generated by JS -->
                </div>
            </div>
        `;
        setTimeout(() => initGame2048(windowId), 0);
    } else if (appName === 'markdown-viewer') {
        title = arg || "Markdown Viewer";
        win.classList.add('markdown-window');

        // Load content
        let mdText = "# Error\nFile not found.";
        if (arg && fileSystem[arg]) {
            mdText = fileSystem[arg];
        }

        const html = renderMarkdown(mdText);

        content = `
            <div class="markdown-content">
                ${html}
            </div>
        `;
    } else if (appName === 'markdown-editor') {
        title = "Markdown Editor";
        win.classList.add('markdown-editor-window');
        content = `
            <div class="markdown-toolbar">
                <button onclick="saveMarkdownFile('${windowId}')">Save</button>
                <button onclick="downloadMarkdownFile('${windowId}')">Download</button>
                <label>
                    Open <input type="file" id="md-input-${windowId}" style="display: none;" onchange="openMarkdownFile('${windowId}')" accept=".md,.txt">
                </label>
            </div>
            <div class="markdown-container">
                <textarea class="markdown-input" id="md-input-area-${windowId}" placeholder="Type Markdown here..."></textarea>
                <div class="markdown-preview" id="md-preview-${windowId}"></div>
            </div>
        `;
        setTimeout(() => initMarkdownEditor(windowId, arg), 0);
    } else if (appName === 'sudoku') {
        title = "Sudoku";
        win.classList.add('sudoku-window');
        content = `
            <div class="sudoku-container">
                <div class="sudoku-board" id="sudoku-board-${windowId}">
                    <!-- Grid generated by JS -->
                </div>
                <div class="sudoku-controls">
                    <select id="sudoku-difficulty-${windowId}" class="sudoku-difficulty">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <button class="sudoku-action-btn" onclick="initSudoku('${windowId}')">New Game</button>
                    <button class="sudoku-action-btn" onclick="checkSudoku('${windowId}')">Check</button>
                    <hr style="width: 100%; border: 0; border-top: 1px solid #ccc;">
                    <div class="sudoku-numpad">
                        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="sudoku-num-btn" onclick="handleSudokuInput('${windowId}', ${n})">${n}</button>`).join('')}
                        <button class="sudoku-num-btn" onclick="handleSudokuInput('${windowId}', 0)" style="grid-column: span 3; color: #d9534f;">Clear</button>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initSudoku(windowId), 0);
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
    if (appName === 'sticky-notes') {
        const noteId = win.dataset.noteId;
        const ta = document.getElementById(`sticky-note-textarea-${noteId}`);
        if (ta && stickyNotes[noteId]) {
            ta.value = stickyNotes[noteId].content || '';
        }
    }

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
                handleTerminalCommand(this.value, win.querySelector('.terminal-output'), windowId);
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

    // Cleanup Calendar state
    if (calendarStates[windowId]) {
        delete calendarStates[windowId];
    }

    // Cleanup Memory Game state
    if (memoryGames[windowId]) {
        clearInterval(memoryGames[windowId].timerInterval);
        delete memoryGames[windowId];
    }

    // Cleanup Tetris Game state
    if (tetrisGames[windowId]) {
        cancelAnimationFrame(tetrisGames[windowId].requestId);
        delete tetrisGames[windowId];
    }

    // Cleanup Solitaire Game state
    if (solitaireGames[windowId]) {
        delete solitaireGames[windowId];
    }

    // Cleanup Pong Game state
    if (typeof pongGames !== 'undefined' && pongGames[windowId]) {
        cancelAnimationFrame(pongGames[windowId].requestId);
        delete pongGames[windowId];
    }

    // Cleanup 2048 Game state
    if (typeof game2048States !== 'undefined' && game2048States[windowId]) {
        delete game2048States[windowId];
    }

    // Cleanup Sudoku
    if (typeof sudokuStates !== 'undefined' && sudokuStates[windowId]) {
        delete sudokuStates[windowId];
    }

    // Cleanup Music Player
    const winRef = document.getElementById(windowId);
    if (winRef && winRef.querySelector('audio')) {
        const audio = winRef.querySelector('audio');
        if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
        }
    }

    // Cleanup Video Player
    if (winRef && winRef.querySelector('video')) {
        const video = winRef.querySelector('video');
        if (video.src && video.src.startsWith('blob:')) {
            URL.revokeObjectURL(video.src);
        }
    }

    // Cleanup Task Manager
    if (taskManagerIntervals[windowId]) {
        clearInterval(taskManagerIntervals[windowId]);
        delete taskManagerIntervals[windowId];
    }

    // Cleanup Clock
    if (clockStates[windowId]) {
        clearInterval(clockStates[windowId].clockInterval);
        if(clockStates[windowId].stopwatch.interval) clearInterval(clockStates[windowId].stopwatch.interval);
        if(clockStates[windowId].timer.interval) clearInterval(clockStates[windowId].timer.interval);
        delete clockStates[windowId];
    }

    // Cleanup Browser
    if (browserStates[windowId]) {
        delete browserStates[windowId];
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
    if (currentWindow && currentWindow.dataset.noteId) {
        updateStickyNotePosition(currentWindow.dataset.noteId, currentWindow.style.left, currentWindow.style.top);
    }
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

// Terminal State
const terminalStates = {};

// Sticky Notes State
let stickyNotes = {};

function saveStickyNotesToStorage() {
    localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
}

function initStickyNotes() {
    const saved = localStorage.getItem('stickyNotes');
    if (saved) {
        try {
            stickyNotes = JSON.parse(saved);
            Object.keys(stickyNotes).forEach(id => {
                openApp('sticky-notes', id);
            });
        } catch (e) {
            console.error('Failed to load sticky notes:', e);
        }
    }
}

function updateStickyNote(id, content) {
    if (!stickyNotes[id]) return;
    stickyNotes[id].content = content;
    saveStickyNotesToStorage();
}

function deleteStickyNote(noteId) {
    if (confirm('Delete this sticky note?')) {
        delete stickyNotes[noteId];
        saveStickyNotesToStorage();

        const windows = document.querySelectorAll('.window');
        windows.forEach(win => {
            if (win.dataset.noteId === noteId) {
                closeWindow(win.id);
            }
        });
    }
}

function updateStickyNotePosition(id, left, top) {
    if (!stickyNotes[id]) return;
    stickyNotes[id].x = left;
    stickyNotes[id].y = top;
    saveStickyNotesToStorage();
}

function updateStickyNoteSize(id, width, height) {
    if (!stickyNotes[id]) return;
    stickyNotes[id].width = width;
    stickyNotes[id].height = height;
    saveStickyNotesToStorage();
}

function resolvePath(cwd, path) {
    if (!path) return cwd;

    let parts;
    if (path.startsWith('/')) {
        parts = path.split('/').filter(p => p);
    } else {
        parts = cwd.split('/').concat(path.split('/')).filter(p => p);
    }

    const stack = [];
    for (const part of parts) {
        if (part === '..') {
            stack.pop();
        } else if (part !== '.') {
            stack.push(part);
        }
    }

    let res = '/' + stack.join('/');
    return res;
}

// Terminal Logic
function handleTerminalCommand(cmd, outputDiv, windowId) {
    const line = document.createElement('div');
    line.textContent = '> ' + cmd;
    outputDiv.appendChild(line);

    // Get current directory for this window
    if (!terminalStates[windowId]) {
        terminalStates[windowId] = { cwd: '/' };
    }
    const cwd = terminalStates[windowId].cwd;

    let response = '';
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Helper to get full path
    const getFullPath = (p) => {
        let fullPath = resolvePath(cwd, p);
        if (fullPath === '/') return '/'; // root
        return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath; // remove leading / for FS keys unless it's just /
    };

    // FS keys don't have leading / usually in this map, but let's standardize.
    // Current keys: 'readme.txt'. This means they are at root.
    // If I resolvePath('/', 'readme.txt') -> '/readme.txt'.
    // So I should strip the leading slash when accessing fileSystem.
    // Directories will be stored with trailing slash: 'folder/'

    if (command === 'help') {
        response = 'Available commands: help, date, clear, echo [text], ls, cat [file], open [file], touch [file], rm [file], mkdir [dir], rmdir [dir], cd [dir], about, reboot, whoami, pwd, history';
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
        // List files in current directory
        // cwd is like '/' or '/folder'
        let prefix = cwd === '/' ? '' : cwd.substring(1) + '/';

        const contents = Object.keys(fileSystem).filter(key => {
            // Check if key starts with prefix
            if (!key.startsWith(prefix)) return false;

            // Check if it's a direct child
            const relPath = key.substring(prefix.length);
            // If relPath contains '/', it's in a subdirectory (unless it's just the trailing slash of a dir)
            if (relPath.endsWith('/') && relPath.indexOf('/') === relPath.length - 1) return true; // Direct subdirectory
            if (relPath.indexOf('/') === -1) return true; // Direct file

            return false;
        }).map(key => {
            const relPath = key.substring(prefix.length);
            if (relPath.endsWith('/')) {
                return '<span style="color: #4a90e2">' + relPath.slice(0, -1) + '</span>'; // Directory style
            }
            return relPath;
        });

        response = contents.join('  ');
        if (!response && Object.keys(fileSystem).length > 0 && cwd === '/') {
             // Fallback for flat structure if needed, but logic above covers root
        }
    } else if (command === 'cd') {
        if (args.length === 0) {
            terminalStates[windowId].cwd = '/';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath === '/' ? '' : targetPath.substring(1) + '/';

            // Check if directory exists
            // Root always exists
            if (targetPath === '/' || fileSystem[fsKey] === 'directory') {
                terminalStates[windowId].cwd = targetPath;
            } else {
                response = `Directory not found: ${args[0]}`;
            }
        }
    } else if (command === 'mkdir') {
        if (args.length === 0) {
            response = 'Usage: mkdir [directory]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1) + '/';
            if (fileSystem[fsKey]) {
                response = `Directory already exists: ${args[0]}`;
            } else {
                fileSystem[fsKey] = 'directory';
                saveFileSystem();
                response = `Created directory: ${args[0]}`;
            }
        }
    } else if (command === 'rmdir') {
        if (args.length === 0) {
            response = 'Usage: rmdir [directory]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1) + '/';
            if (fileSystem[fsKey] === 'directory') {
                // Check if empty
                const hasChildren = Object.keys(fileSystem).some(k => k.startsWith(fsKey) && k !== fsKey);
                if (hasChildren) {
                    response = `Directory not empty: ${args[0]}`;
                } else {
                    delete fileSystem[fsKey];
                    saveFileSystem();
                    response = `Removed directory: ${args[0]}`;
                }
            } else {
                response = `Directory not found: ${args[0]}`;
            }
        }
    } else if (command === 'cat') {
        if (args.length === 0) {
            response = 'Usage: cat [filename]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1);

            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                response = fileSystem[fsKey];
            } else if (fileSystem[fsKey + '/'] === 'directory') {
                response = `${args[0]} is a directory`;
            } else {
                response = `File not found: ${args[0]}`;
            }
        }
    } else if (command === 'open') {
        if (args.length === 0) {
            response = 'Usage: open [filename]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1);

            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                if (fsKey.endsWith('.png') || fsKey.endsWith('.jpg')) {
                    openApp('paint', fsKey);
                    response = `Opening ${fsKey} in Paint...`;
                } else {
                    openApp('notepad', fsKey);
                    response = `Opening ${fsKey} in Notepad...`;
                }
            } else {
                response = `File not found: ${args[0]}`;
            }
        }
    } else if (command === 'touch') {
        if (args.length === 0) {
            response = 'Usage: touch [filename]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1);

            if (!fileSystem[fsKey]) {
                fileSystem[fsKey] = '';
                saveFileSystem();
                response = `Created file: ${args[0]}`;
            } else {
                response = `File already exists: ${args[0]}`;
            }
        }
    } else if (command === 'rm') {
        if (args.length === 0) {
            response = 'Usage: rm [filename]';
        } else {
            const targetPath = resolvePath(cwd, args[0]);
            const fsKey = targetPath.substring(1);

            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                delete fileSystem[fsKey];
                saveFileSystem();
                response = `Removed file: ${args[0]}`;
            } else {
                response = `File not found: ${args[0]}`;
            }
        }
    } else if (command === 'cp') {
        if (args.length < 2) {
            response = 'Usage: cp [source] [destination]';
        } else {
            const srcPath = resolvePath(cwd, args[0]);
            const destPath = resolvePath(cwd, args[1]);
            const srcKey = srcPath.substring(1);
            const destKey = destPath.substring(1);

            if (fileSystem[srcKey] !== undefined) {
                fileSystem[destKey] = fileSystem[srcKey];
                saveFileSystem();
                response = `Copied ${args[0]} to ${args[1]}`;
            } else {
                response = `File not found: ${args[0]}`;
            }
        }
    } else if (command === 'mv') {
        if (args.length < 2) {
            response = 'Usage: mv [source] [destination]';
        } else {
            const srcPath = resolvePath(cwd, args[0]);
            const destPath = resolvePath(cwd, args[1]);
            const srcKey = srcPath.substring(1);
            const destKey = destPath.substring(1);

            if (fileSystem[srcKey] !== undefined) {
                fileSystem[destKey] = fileSystem[srcKey];
                delete fileSystem[srcKey];
                saveFileSystem();
                response = `Moved ${args[0]} to ${args[1]}`;
            } else {
                response = `File not found: ${args[0]}`;
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
        response = cwd;
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

// Explorer State
const explorerStates = {};

function createNewFolder(windowId) {
    const currentPath = explorerStates[windowId].path;
    const folderName = prompt("Enter folder name:", "New Folder");
    if (folderName) {
         if (folderName.includes('/') || folderName.includes('\\')) {
             alert("Invalid name");
             return;
         }

         const prefix = currentPath === '/' ? '' : currentPath.substring(1) + '/';
         const newKey = prefix + folderName + '/';

         if (fileSystem[newKey]) {
             alert("Folder already exists");
         } else {
             fileSystem[newKey] = 'directory';
             saveFileSystem();
             renderFileExplorer(windowId);
         }
    }
}

// File Explorer Logic
function renderFileExplorer(windowId) {
    const container = document.getElementById(`explorer-content-${windowId}`);
    const pathInput = document.getElementById(`explorer-path-${windowId}`);
    if (!container) return;

    if (!explorerStates[windowId]) {
        explorerStates[windowId] = { path: '/' };
    }
    const currentPath = explorerStates[windowId].path;
    if (pathInput) pathInput.value = currentPath;

    container.innerHTML = '';

    // "Up" Button
    if (currentPath !== '/') {
        const upDiv = document.createElement('div');
        upDiv.style.width = '60px';
        upDiv.style.textAlign = 'center';
        upDiv.style.cursor = 'pointer';
        upDiv.style.display = 'flex';
        upDiv.style.flexDirection = 'column';
        upDiv.style.alignItems = 'center';
        upDiv.style.padding = '5px';

        const iconDiv = document.createElement('div');
        iconDiv.style.fontSize = '30px';
        iconDiv.textContent = '⬆️';

        const nameDiv = document.createElement('div');
        nameDiv.style.fontSize = '11px';
        nameDiv.textContent = '..';

        upDiv.appendChild(iconDiv);
        upDiv.appendChild(nameDiv);

        upDiv.onclick = () => {
            // Go up
            const parts = currentPath.split('/').filter(p => p);
            parts.pop();
            const newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
            explorerStates[windowId].path = newPath;
            renderFileExplorer(windowId);
        };

        upDiv.onmouseover = () => upDiv.style.backgroundColor = '#e0e0e0';
        upDiv.onmouseout = () => upDiv.style.backgroundColor = 'transparent';

        container.appendChild(upDiv);
    }

    // Filter items
    let prefix = currentPath === '/' ? '' : currentPath.substring(1) + '/';

    Object.keys(fileSystem).forEach(key => {
        if (!key.startsWith(prefix)) return;

        const relPath = key.substring(prefix.length);
        // Check if direct child
        // If it contains '/', it must be just at the end (directory)
        if (relPath.indexOf('/') !== -1 && relPath.indexOf('/') !== relPath.length - 1) return;

        if (relPath === '') return; // Should not happen usually unless key == prefix which is impossible if prefix ends in / and key is dir

        const isDir = relPath.endsWith('/');
        const displayName = isDir ? relPath.slice(0, -1) : relPath;

        const fileDiv = document.createElement('div');
        fileDiv.style.width = '60px';
        fileDiv.style.textAlign = 'center';
        fileDiv.style.cursor = 'pointer';
        fileDiv.style.display = 'flex';
        fileDiv.style.flexDirection = 'column';
        fileDiv.style.alignItems = 'center';
        fileDiv.style.padding = '5px';
        fileDiv.style.borderRadius = '5px';

        // Icon based on type
        let iconChar = '📄';
        if (isDir) iconChar = '📁';
        else if (displayName.endsWith('.png') || displayName.endsWith('.jpg')) iconChar = '🖼️';
        else if (displayName.endsWith('.mp4') || displayName.endsWith('.webm') || displayName.endsWith('.ogg') || displayName.endsWith('.mov')) iconChar = '🎞️';

        const iconDiv = document.createElement('div');
        iconDiv.style.fontSize = '30px';
        iconDiv.textContent = iconChar;
        if (isDir) iconDiv.style.color = '#f1c40f'; // Folder color

        const nameDiv = document.createElement('div');
        nameDiv.style.fontSize = '11px';
        nameDiv.style.wordBreak = 'break-all';
        nameDiv.style.marginTop = '2px';
        nameDiv.style.lineHeight = '1.2';
        nameDiv.textContent = displayName;

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
        renameBtn.title = 'Rename';

        renameBtn.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt(`Rename ${displayName} to:`, displayName);
            if (newName && newName !== displayName) {
                 if (newName.includes('/')) { alert("Invalid name"); return; }

                 const oldKey = key;
                 const newKey = prefix + newName + (isDir ? '/' : '');

                 if (fileSystem[newKey]) {
                    alert('Already exists!');
                    return;
                }

                // If directory, we need to rename all children
                if (isDir) {
                    const childPrefix = oldKey;
                    const newChildPrefix = newKey;

                    // Rename directory entry
                    fileSystem[newKey] = 'directory';
                    delete fileSystem[oldKey];

                    // Rename children
                    Object.keys(fileSystem).forEach(k => {
                        if (k.startsWith(childPrefix)) {
                            const suffix = k.substring(childPrefix.length);
                            fileSystem[newChildPrefix + suffix] = fileSystem[k];
                            delete fileSystem[k];
                        }
                    });
                } else {
                    fileSystem[newKey] = fileSystem[oldKey];
                    delete fileSystem[oldKey];
                }

                saveFileSystem();
                renderFileExplorer(windowId);
            }
        };

        // Delete Button
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.title = 'Delete';

        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent opening file
            if(confirm(`Delete ${displayName}?`)) {
                if (isDir) {
                    // Check if empty logic? Or recursive delete?
                    // Recursive delete is friendlier
                    const childPrefix = key;
                    Object.keys(fileSystem).forEach(k => {
                        if (k.startsWith(childPrefix)) {
                            delete fileSystem[k];
                        }
                    });
                     delete fileSystem[key];
                } else {
                    delete fileSystem[key];
                }
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
             if (isDir) {
                 // Navigate into
                 explorerStates[windowId].path = currentPath === '/' ? '/' + displayName : currentPath + '/' + displayName;
                 renderFileExplorer(windowId);
             } else {
                 if (displayName.endsWith('.png') || displayName.endsWith('.jpg')) {
                     openApp('paint', key); // Pass full key
                 } else if (displayName.endsWith('.mp4') || displayName.endsWith('.webm') || displayName.endsWith('.ogg') || displayName.endsWith('.mov')) {
                     openApp('video-player', key); // Pass full key
                 } else if (displayName.endsWith('.md')) {
                     openApp('markdown-viewer', key); // Pass full key
                 } else {
                     openApp('notepad', key); // Pass full key
                 }
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
    if (currentResizeWindow && currentResizeWindow.dataset.noteId) {
        updateStickyNoteSize(currentResizeWindow.dataset.noteId, currentResizeWindow.style.width, currentResizeWindow.style.height);
    }
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
// Calendar Logic
const calendarStates = {};

function initCalendar(windowId) {
    const now = new Date();
    calendarStates[windowId] = {
        currentMonth: now.getMonth(),
        currentYear: now.getFullYear()
    };
    renderCalendar(windowId);
}

function changeCalendarMonth(windowId, delta) {
    const state = calendarStates[windowId];
    state.currentMonth += delta;
    if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    } else if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    }
    renderCalendar(windowId);
}

function renderCalendar(windowId) {
    const state = calendarStates[windowId];
    const grid = document.getElementById(`cal-grid-${windowId}`);
    const monthTitle = document.getElementById(`cal-month-${windowId}`);

    if (!grid || !monthTitle) return;

    grid.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthTitle.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;

    // Day Headers
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'calendar-day-header';
        div.textContent = day;
        grid.appendChild(div);
    });

    const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

    // Previous month days
    const prevMonthDays = new Date(state.currentYear, state.currentMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'calendar-day other-month';
        div.textContent = prevMonthDays - i;
        grid.appendChild(div);
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.textContent = i;

        if (i === today.getDate() && state.currentMonth === today.getMonth() && state.currentYear === today.getFullYear()) {
            div.classList.add('today');
        }

        grid.appendChild(div);
    }

    // Next month days to fill grid (assuming 6 rows max -> 42 cells)
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    if (remainingCells < 7) { // Only show if we need another row, or just fill to end of week
        // Standard calendars usually fill 6 rows fixed or dynamic.
        // Let's just fill to the end of the last week row.
    }

    // Fill remaining cells for 6 rows layout (optional, but looks better)
    // 6 rows * 7 cols = 42
    for (let i = 1; i <= (42 - totalCells); i++) {
         const div = document.createElement('div');
         div.className = 'calendar-day other-month';
         div.textContent = i;
         grid.appendChild(div);
    }
}

// Memory Game Logic
const memoryGames = {};

// Tetris Game Logic
const tetrisGames = {};

function initMemory(windowId) {
    const grid = document.getElementById(`memory-grid-${windowId}`);
    const movesDisplay = document.getElementById(`memory-moves-${windowId}`);
    const timerDisplay = document.getElementById(`memory-timer-${windowId}`);

    if (!grid) return;

    if (memoryGames[windowId]) {
        clearInterval(memoryGames[windowId].timerInterval);
    }

    const emojis = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🍍', '🥝'];
    const cards = [...emojis, ...emojis];

    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    memoryGames[windowId] = {
        cards: cards,
        flipped: [], // Indices of currently flipped cards
        matched: [], // Indices of matched cards
        moves: 0,
        startTime: null,
        timerInterval: null,
        isLocked: false
    };

    grid.innerHTML = '';
    if (movesDisplay) movesDisplay.textContent = 'Moves: 0';
    if (timerDisplay) timerDisplay.textContent = '00:00';

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.id = `memory-card-${windowId}-${index}`;
        card.textContent = emoji;
        card.onclick = () => handleMemoryClick(windowId, index);
        grid.appendChild(card);
    });
}

function handleMemoryClick(windowId, index) {
    const game = memoryGames[windowId];
    if (!game || game.isLocked || game.matched.includes(index) || game.flipped.includes(index)) return;

    // Start timer on first move
    if (!game.startTime) {
        game.startTime = Date.now();
        game.timerInterval = setInterval(() => {
            const delta = Math.floor((Date.now() - game.startTime) / 1000);
            const m = String(Math.floor(delta / 60)).padStart(2, '0');
            const s = String(delta % 60).padStart(2, '0');
            const timer = document.getElementById(`memory-timer-${windowId}`);
            if (timer) timer.textContent = `${m}:${s}`;
        }, 1000);
    }

    const card = document.getElementById(`memory-card-${windowId}-${index}`);
    card.classList.add('flipped');
    game.flipped.push(index);

    if (game.flipped.length === 2) {
        game.moves++;
        const movesDisplay = document.getElementById(`memory-moves-${windowId}`);
        if (movesDisplay) movesDisplay.textContent = `Moves: ${game.moves}`;
        game.isLocked = true;

        const idx1 = game.flipped[0];
        const idx2 = game.flipped[1];

        if (game.cards[idx1] === game.cards[idx2]) {
            // Match
            setTimeout(() => {
                const c1 = document.getElementById(`memory-card-${windowId}-${idx1}`);
                const c2 = document.getElementById(`memory-card-${windowId}-${idx2}`);
                if(c1) c1.classList.add('matched');
                if(c2) c2.classList.add('matched');

                game.matched.push(idx1, idx2);
                game.flipped = [];
                game.isLocked = false;

                if (game.matched.length === game.cards.length) {
                    clearInterval(game.timerInterval);
                    setTimeout(() => alert(`Congratulations! You won in ${game.moves} moves!`), 100);
                }
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                const c1 = document.getElementById(`memory-card-${windowId}-${idx1}`);
                const c2 = document.getElementById(`memory-card-${windowId}-${idx2}`);
                if(c1) c1.classList.remove('flipped');
                if(c2) c2.classList.remove('flipped');

                game.flipped = [];
                game.isLocked = false;
            }, 1000);
        }
    }
}

// Music Player Logic
function handleMusicFile(windowId) {
    const input = document.getElementById(`music-input-${windowId}`);
    const audio = document.getElementById(`music-audio-${windowId}`);
    const trackName = document.getElementById(`music-track-name-${windowId}`);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);

        // Revoke previous URL if exists to avoid memory leaks
        if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
        }

        audio.src = url;
        trackName.textContent = file.name;
        audio.play().catch(e => console.log('Autoplay blocked or error:', e));
    }
}

// Video Player Logic
function handleVideoFile(windowId) {
    const input = document.getElementById(`video-input-${windowId}`);
    const video = document.getElementById(`video-player-${windowId}`);
    const videoName = document.getElementById(`video-name-${windowId}`);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);

        // Revoke previous URL if exists
        if (video.src && video.src.startsWith('blob:')) {
            URL.revokeObjectURL(video.src);
        }

        video.src = url;
        videoName.textContent = file.name;
        video.play().catch(e => console.log('Autoplay blocked or error:', e));
    }
}

// Task Manager Logic
const taskManagerIntervals = {};

function initTaskManager(windowId) {
    renderTaskManager(windowId);
    taskManagerIntervals[windowId] = setInterval(() => renderTaskManager(windowId), 1000);
}

function renderTaskManager(windowId) {
    const list = document.getElementById(`task-list-${windowId}`);
    const countSpan = document.getElementById(`task-count-${windowId}`);
    if (!list) return;

    // Get all windows
    const windows = document.querySelectorAll('.window');

    // Store current scroll position if needed, or just rebuild (simple)
    // To avoid flickering, maybe diff? But simple rebuild is okay for now.

    let html = '';
    let count = 0;

    windows.forEach(win => {
        // Skip hidden windows? No, Task Manager should show them unless closed.
        // Actually, hidden usually means minimized.

        const titleEl = win.querySelector('.title-bar-text');
        const title = titleEl ? titleEl.textContent : 'Unknown';
        const id = win.id;

        // Simulated stats
        // CPU: Random 0-5%, unless focused maybe higher?
        // Mem: Random 10-100MB
        // To keep it somewhat consistent, we could hash the ID, but random is "alive".
        const cpu = (Math.random() * 5).toFixed(1);
        const mem = Math.floor(Math.random() * 50 + 20);

        const isSelf = (id === windowId);

        html += `
            <div class="task-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 80px; padding: 5px 10px; border-bottom: 1px solid #eee; align-items: center; font-size: 12px; background: ${isSelf ? '#f9f9f9' : 'white'};">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title} <span style="color: #999; font-size: 10px;">(${id})</span></div>
                <div>${cpu}%</div>
                <div>${mem} MB</div>
                <div style="text-align: center;">
                    <button onclick="closeWindow('${id}')" style="background: #e74c3c; color: white; border: none; border-radius: 3px; padding: 2px 8px; cursor: pointer; font-size: 10px;">End Task</button>
                </div>
            </div>
        `;
        count++;
    });

    list.innerHTML = html;
    if (countSpan) countSpan.textContent = count;
}

// Tetris Logic
function initTetris(windowId) {
    const canvas = document.getElementById(`tetris-canvas-${windowId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const win = document.getElementById(windowId);
    if (win) {
        win.tabIndex = 0;
        win.focus();
    }

    if (tetrisGames[windowId]) {
        cancelAnimationFrame(tetrisGames[windowId].requestId);
    }

    const COLS = 12;
    const ROWS = 20;
    const BLOCK_SIZE = 20;

    const PIECES = [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    ];

    const COLORS = [
        null,
        '#00f0f0',
        '#0000f0',
        '#f0a000',
        '#f0f000',
        '#00f000',
        '#a000f0',
        '#f00000'
    ];

    let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    let score = 0;
    let lines = 0;
    let level = 1;

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    const player = {
        pos: {x: 0, y: 0},
        matrix: null,
        color: null
    };

    function playerReset() {
        const typeId = Math.floor(Math.random() * PIECES.length);
        player.matrix = PIECES[typeId].map(row => [...row]); // Deep copy
        player.color = COLORS[typeId + 1];
        player.pos.y = 0;
        player.pos.x = (Math.floor(COLS / 2)) - Math.floor(player.matrix[0].length / 2);

        if (collide(board, player)) {
            board.forEach(row => row.fill(0));
            score = 0;
            lines = 0;
            level = 1;
            updateScore();
        }
    }

    function collide(board, player) {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(board, {x: 0, y: 0});
        drawMatrix(player.matrix, player.pos);
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = (typeof value === 'string') ? value : player.color;
                    ctx.fillRect((x + offset.x) * BLOCK_SIZE,
                                 (y + offset.y) * BLOCK_SIZE,
                                 BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });
    }

    function merge(board, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = player.color;
                }
            });
        });
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(board, player)) {
            player.pos.x -= dir;
        }
    }

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function arenaSweep() {
        let rowCount = 0;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }

            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;

            rowCount++;
        }

        if (rowCount > 0) {
            score += rowCount * 10 * rowCount;
            lines += rowCount;
            level = Math.floor(lines / 10) + 1;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            updateScore();
        }
    }

    function updateScore() {
        const scoreEl = document.getElementById(`tetris-score-${windowId}`);
        const levelEl = document.getElementById(`tetris-level-${windowId}`);
        const linesEl = document.getElementById(`tetris-lines-${windowId}`);
        if (scoreEl) scoreEl.innerText = score;
        if (levelEl) levelEl.innerText = level;
        if (linesEl) linesEl.innerText = lines;
    }

    function update(time = 0) {
        if (!tetrisGames[windowId]) return;

        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
        tetrisGames[windowId].requestId = requestAnimationFrame(update);
    }

    if (win) {
        win.onkeydown = (e) => {
            if (e.key === 'ArrowLeft') {
                playerMove(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                playerMove(1);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                playerDrop();
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                playerRotate(1);
                e.preventDefault();
            }
        };
    }

    playerReset();
    updateScore();

    tetrisGames[windowId] = {
        requestId: requestAnimationFrame(update)
    };
}

// Clock App Logic
const clockStates = {};

const TIMEZONES = [
    { name: 'UTC', zone: 'UTC' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'London', zone: 'Europe/London' },
    { name: 'Paris', zone: 'Europe/Paris' },
    { name: 'Moscow', zone: 'Europe/Moscow' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles' },
    { name: 'Dubai', zone: 'Asia/Dubai' },
    { name: 'Singapore', zone: 'Asia/Singapore' }
];

function initClock(windowId) {
    if (!clockStates[windowId]) {
        clockStates[windowId] = {
            clockInterval: null,
            stopwatch: {
                startTime: 0,
                elapsed: 0,
                interval: null,
                running: false,
                laps: []
            },
            timer: {
                duration: 0,
                remaining: 0,
                interval: null,
                running: false
            },
            world: {
                cities: JSON.parse(localStorage.getItem('clockWorldCities') || '[]')
            }
        };
    }

    // Populate World Clock Select
    const worldSelect = document.getElementById(`world-clock-select-${windowId}`);
    if (worldSelect) {
        TIMEZONES.forEach((tz, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = tz.name;
            worldSelect.appendChild(opt);
        });
    }

    renderWorldClock(windowId);

    // Start Clock Tab
    updateClockTab(windowId);
    clockStates[windowId].clockInterval = setInterval(() => updateClockTab(windowId), 1000);
}

function updateClockTab(windowId) {
    const timeDisplay = document.getElementById(`clock-time-${windowId}`);
    const dateDisplay = document.getElementById(`clock-date-${windowId}`);
    if (!timeDisplay) return;

    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
    dateDisplay.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Update World Clocks if visible
    const worldTab = document.getElementById(`clock-tab-world-${windowId}`);
    if (worldTab && worldTab.classList.contains('active')) {
        const state = clockStates[windowId];
        if (state && state.world) {
            state.world.cities.forEach((city, index) => {
                const timeEl = document.getElementById(`world-clock-time-${windowId}-${index}`);
                if (timeEl) {
                    try {
                        const timeString = new Date().toLocaleTimeString('en-US', { timeZone: city.zone });
                        timeEl.textContent = timeString;
                    } catch (e) {
                        timeEl.textContent = "Invalid Timezone";
                    }
                }
            });
        }
    }
}

function renderWorldClock(windowId) {
    const list = document.getElementById(`world-clock-list-${windowId}`);
    if (!list) return;
    list.innerHTML = '';

    const state = clockStates[windowId];
    if (!state || !state.world) return;

    state.world.cities.forEach((city, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '5px';
        item.style.background = '#333';
        item.style.borderRadius = '4px';
        item.style.borderBottom = '1px solid #444';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = city.name;
        nameSpan.style.fontWeight = 'bold';
        nameSpan.style.fontSize = '14px';

        const timeSpan = document.createElement('span');
        timeSpan.id = `world-clock-time-${windowId}-${index}`;
        timeSpan.style.fontFamily = 'monospace';
        timeSpan.style.fontSize = '14px';
        try {
            timeSpan.textContent = new Date().toLocaleTimeString('en-US', { timeZone: city.zone });
        } catch (e) {
            timeSpan.textContent = "--:--:--";
        }

        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.style.background = 'transparent';
        delBtn.style.color = '#e74c3c';
        delBtn.style.border = 'none';
        delBtn.style.cursor = 'pointer';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = () => removeWorldCity(windowId, index);

        const leftDiv = document.createElement('div');
        leftDiv.style.display = 'flex';
        leftDiv.style.alignItems = 'center';
        leftDiv.style.gap = '10px';
        leftDiv.appendChild(delBtn);
        leftDiv.appendChild(nameSpan);

        item.appendChild(leftDiv);
        item.appendChild(timeSpan);

        list.appendChild(item);
    });
}

function addWorldCity(windowId) {
    const select = document.getElementById(`world-clock-select-${windowId}`);
    const index = select.value;
    const city = TIMEZONES[index];

    const state = clockStates[windowId];
    if (!state.world) state.world = { cities: [] };

    state.world.cities.push(city);
    localStorage.setItem('clockWorldCities', JSON.stringify(state.world.cities));
    renderWorldClock(windowId);
}

function removeWorldCity(windowId, index) {
    const state = clockStates[windowId];
    if (!state.world) return;
    state.world.cities.splice(index, 1);
    localStorage.setItem('clockWorldCities', JSON.stringify(state.world.cities));
    renderWorldClock(windowId);
}

function switchClockTab(windowId, tabName) {
    // Update Tabs
    const tabs = document.querySelectorAll(`#clock-tabs-${windowId} .clock-tab-btn`);
    tabs.forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Content
    const contents = document.querySelectorAll(`#clock-content-${windowId} .clock-tab-content`);
    contents.forEach(content => {
        if (content.id === `clock-tab-${tabName}-${windowId}`) content.classList.add('active');
        else content.classList.remove('active');
    });
}

// Stopwatch
function formatTime(ms) {
    const date = new Date(ms);
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    const cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${m}:${s}.${cs}`;
}

function updateStopwatchDisplay(windowId) {
    const display = document.getElementById(`stopwatch-display-${windowId}`);
    if (display) {
        display.textContent = formatTime(clockStates[windowId].stopwatch.elapsed);
    }
}

function startStopwatch(windowId) {
    const state = clockStates[windowId].stopwatch;
    if (state.running) return;

    state.running = true;
    state.startTime = Date.now() - state.elapsed;
    state.interval = setInterval(() => {
        state.elapsed = Date.now() - state.startTime;
        updateStopwatchDisplay(windowId);
    }, 10);

    // Toggle Buttons
    document.getElementById(`sw-start-${windowId}`).style.display = 'none';
    document.getElementById(`sw-stop-${windowId}`).style.display = 'inline-block';
    document.getElementById(`sw-lap-${windowId}`).style.display = 'inline-block';
    document.getElementById(`sw-reset-${windowId}`).style.display = 'none';
}

function stopStopwatch(windowId) {
    const state = clockStates[windowId].stopwatch;
    if (!state.running) return;

    state.running = false;
    clearInterval(state.interval);

    // Toggle Buttons
    document.getElementById(`sw-start-${windowId}`).style.display = 'inline-block';
    document.getElementById(`sw-stop-${windowId}`).style.display = 'none';
    document.getElementById(`sw-lap-${windowId}`).style.display = 'none';
    document.getElementById(`sw-reset-${windowId}`).style.display = 'inline-block';
}

function resetStopwatch(windowId) {
    const state = clockStates[windowId].stopwatch;
    stopStopwatch(windowId);
    state.elapsed = 0;
    state.laps = [];
    updateStopwatchDisplay(windowId);
    document.getElementById(`laps-list-${windowId}`).innerHTML = '';
}

function lapStopwatch(windowId) {
    const state = clockStates[windowId].stopwatch;
    if (!state.running) return;

    const lapTime = state.elapsed;
    state.laps.push(lapTime);

    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `<span>Lap ${state.laps.length}</span><span>${formatTime(lapTime)}</span>`;

    const list = document.getElementById(`laps-list-${windowId}`);
    list.prepend(lapItem);
}

// Timer
function formatTimer(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerDisplay(windowId) {
    const display = document.getElementById(`timer-display-${windowId}`);
    if (display) {
        display.textContent = formatTimer(clockStates[windowId].timer.remaining);
    }
}

function startTimer(windowId) {
    const state = clockStates[windowId].timer;
    if (state.running) return;

    // If starting from 0/reset, read inputs
    if (state.remaining === 0) {
        const min = parseInt(document.getElementById(`timer-min-${windowId}`).value) || 0;
        const sec = parseInt(document.getElementById(`timer-sec-${windowId}`).value) || 0;
        if (min === 0 && sec === 0) return;
        state.duration = min * 60 + sec;
        state.remaining = state.duration;
    }

    state.running = true;
    document.getElementById(`timer-setup-${windowId}`).style.display = 'none';
    document.getElementById(`timer-running-${windowId}`).style.display = 'flex';
    document.getElementById(`timer-display-${windowId}`).style.display = 'block';

    updateTimerDisplay(windowId);

    state.interval = setInterval(() => {
        if (state.remaining > 0) {
            state.remaining--;
            updateTimerDisplay(windowId);
        } else {
            // Timer Done
            stopTimer(windowId);
            state.remaining = 0; // Ensure 0
            alert("Timer Done!");
            resetTimer(windowId); // Reset logic
        }
    }, 1000);
}

function stopTimer(windowId) {
    const state = clockStates[windowId].timer;
    if (!state.running) return;
    state.running = false;
    clearInterval(state.interval);
}

function resetTimer(windowId) {
    const state = clockStates[windowId].timer;
    stopTimer(windowId);
    state.remaining = 0;

    document.getElementById(`timer-setup-${windowId}`).style.display = 'flex';
    document.getElementById(`timer-running-${windowId}`).style.display = 'none';
    document.getElementById(`timer-display-${windowId}`).style.display = 'none';
}

// Browser Logic
const browserStates = {};

function navigateBrowser(windowId, url) {
    const iframe = document.getElementById(`browser-iframe-${windowId}`);
    const input = document.getElementById(`browser-url-${windowId}`);

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    iframe.src = url;
    input.value = url;

    // Update History
    if (!browserStates[windowId]) {
        browserStates[windowId] = { history: [], currentIndex: -1 };
    }

    const state = browserStates[windowId];
    // If we are not at the end of history, discard future
    if (state.currentIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.currentIndex + 1);
    }

    state.history.push(url);
    state.currentIndex++;
}

function handleBrowserNav(windowId, action) {
    const state = browserStates[windowId];
    if (!state) return;

    if (action === 'back') {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            const url = state.history[state.currentIndex];
            document.getElementById(`browser-iframe-${windowId}`).src = url;
            document.getElementById(`browser-url-${windowId}`).value = url;
        }
    } else if (action === 'forward') {
        if (state.currentIndex < state.history.length - 1) {
            state.currentIndex++;
            const url = state.history[state.currentIndex];
            document.getElementById(`browser-iframe-${windowId}`).src = url;
            document.getElementById(`browser-url-${windowId}`).value = url;
        }
    } else if (action === 'refresh') {
         const iframe = document.getElementById(`browser-iframe-${windowId}`);
         iframe.src = iframe.src;
    } else if (action === 'home') {
        navigateBrowser(windowId, 'https://www.wikipedia.org');
    }
}

// Unit Converter Logic
const unitDefinitions = {
    length: {
        meters: 1,
        kilometers: 0.001,
        centimeters: 100,
        millimeters: 1000,
        miles: 0.000621371,
        yards: 1.09361,
        feet: 3.28084,
        inches: 39.3701
    },
    weight: {
        kilograms: 1,
        grams: 1000,
        milligrams: 1000000,
        pounds: 2.20462,
        ounces: 35.274
    },
    temperature: {
        celsius: 'C',
        fahrenheit: 'F',
        kelvin: 'K'
    }
};

function initUnitConverter(windowId) {
    updateConverterCategory(windowId);
}

function updateConverterCategory(windowId) {
    const category = document.getElementById(`conv-category-${windowId}`).value;
    const fromSelect = document.getElementById(`conv-from-${windowId}`);
    const toSelect = document.getElementById(`conv-to-${windowId}`);

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    const units = Object.keys(unitDefinitions[category]);

    units.forEach(unit => {
        const opt1 = document.createElement('option');
        opt1.value = unit;
        opt1.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        fromSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = unit;
        opt2.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        toSelect.appendChild(opt2);
    });

    // Set defaults
    if (category === 'length') {
        toSelect.value = 'feet';
    } else if (category === 'weight') {
        toSelect.value = 'pounds';
    } else if (category === 'temperature') {
        toSelect.value = 'fahrenheit';
    }

    convertUnits(windowId);
}

function convertUnits(windowId) {
    const category = document.getElementById(`conv-category-${windowId}`).value;
    const fromUnit = document.getElementById(`conv-from-${windowId}`).value;
    const toUnit = document.getElementById(`conv-to-${windowId}`).value;
    const inputValue = parseFloat(document.getElementById(`conv-input-${windowId}`).value);
    const outputInput = document.getElementById(`conv-output-${windowId}`);

    if (isNaN(inputValue)) {
        outputInput.value = '';
        return;
    }

    let result;

    if (category === 'temperature') {
        if (fromUnit === toUnit) {
            result = inputValue;
        } else if (fromUnit === 'celsius') {
            if (toUnit === 'fahrenheit') result = (inputValue * 9/5) + 32;
            else if (toUnit === 'kelvin') result = inputValue + 273.15;
        } else if (fromUnit === 'fahrenheit') {
            if (toUnit === 'celsius') result = (inputValue - 32) * 5/9;
            else if (toUnit === 'kelvin') result = (inputValue - 32) * 5/9 + 273.15;
        } else if (fromUnit === 'kelvin') {
            if (toUnit === 'celsius') result = inputValue - 273.15;
            else if (toUnit === 'fahrenheit') result = (inputValue - 273.15) * 9/5 + 32;
        }
    } else {
        // Linear conversion
        const baseValue = inputValue / unitDefinitions[category][fromUnit];
        result = baseValue * unitDefinitions[category][toUnit];
    }

    // Format output
    outputInput.value = parseFloat(result.toFixed(4));
}

// Solitaire Logic
const solitaireGames = {};

function initSolitaire(windowId) {
    const deck = [];
    const suits = ['h', 'd', 'c', 's'];
    const suitsSymbols = { 'h': '♥', 'd': '♦', 'c': '♣', 's': '♠' };
    const colors = { 'h': 'red', 'd': 'red', 'c': 'black', 's': 'black' };

    for (let s of suits) {
        for (let r = 1; r <= 13; r++) {
            deck.push({
                suit: s,
                rank: r,
                symbol: suitsSymbols[s],
                color: colors[s],
                faceUp: false,
                id: s + r
            });
        }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const state = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        selected: null // { type: 'waste'|'tableau'|'foundation', index: 0-6|0-3, subIndex: int }
    };

    // Deal
    let cardIdx = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck[cardIdx++];
            if (j === i) card.faceUp = true; // Top card face up
            state.tableau[i].push(card);
        }
    }

    while (cardIdx < deck.length) {
        state.stock.push(deck[cardIdx++]);
    }

    solitaireGames[windowId] = state;
    renderSolitaire(windowId);
}

function renderSolitaire(windowId) {
    const state = solitaireGames[windowId];
    const board = document.getElementById(`solitaire-board-${windowId}`);
    if (!state || !board) return;

    board.innerHTML = '';

    // Helper to render card
    const renderCard = (card, type, index, subIndex, isSelected) => {
        const el = document.createElement('div');
        el.className = 'solitaire-card';
        if (isSelected) el.classList.add('selected');

        if (!card.faceUp) {
            el.classList.add('solitaire-card-back');
        } else {
            el.classList.add(card.color);
            el.dataset.suit = card.suit;
            el.dataset.rank = card.rank;

            const ranks = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
            const rankStr = ranks[card.rank] || card.rank;

            el.innerHTML = `
                <div class="solitaire-card-top"><span>${rankStr}</span><span>${card.symbol}</span></div>
                <div class="solitaire-card-center">${card.symbol}</div>
                <div class="solitaire-card-bottom"><span>${rankStr}</span><span>${card.symbol}</span></div>
            `;
        }

        el.onclick = (e) => {
            e.stopPropagation();
            handleSolitaireClick(windowId, type, index, subIndex);
        };
        return el;
    };

    // Top Row: Stock, Waste, Spacers, Foundations
    const topRow = document.createElement('div');
    topRow.className = 'solitaire-top-row';

    const deckArea = document.createElement('div');
    deckArea.className = 'solitaire-deck-area';

    // Stock
    const stockSlot = document.createElement('div');
    stockSlot.className = 'solitaire-slot';
    if (state.stock.length > 0) {
        const card = state.stock[state.stock.length - 1]; // Top of stock (visually)
        // Actually stock is usually face down.
        const el = renderCard({ faceUp: false }, 'stock', 0, 0, false);
        el.classList.add('static');
        stockSlot.appendChild(el);
    } else {
        stockSlot.textContent = '↺';
        stockSlot.style.cursor = 'pointer';
        stockSlot.onclick = () => handleSolitaireClick(windowId, 'stock', 0, 0);
    }
    deckArea.appendChild(stockSlot);

    // Waste
    const wasteSlot = document.createElement('div');
    wasteSlot.className = 'solitaire-slot';
    if (state.waste.length > 0) {
        const card = state.waste[state.waste.length - 1];
        const isSelected = state.selected && state.selected.type === 'waste';
        const el = renderCard(card, 'waste', 0, state.waste.length - 1, isSelected);
        el.classList.add('static');
        wasteSlot.appendChild(el);
    }
    deckArea.appendChild(wasteSlot);

    topRow.appendChild(deckArea);

    const foundationArea = document.createElement('div');
    foundationArea.className = 'solitaire-foundation-area';

    for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'solitaire-slot';
        slot.textContent = 'A'; // Placeholder

        if (state.foundations[i].length > 0) {
            const card = state.foundations[i][state.foundations[i].length - 1];
            const isSelected = state.selected && state.selected.type === 'foundation' && state.selected.index === i;
            const el = renderCard(card, 'foundation', i, state.foundations[i].length - 1, isSelected);
            el.classList.add('static');
            slot.textContent = ''; // Clear placeholder
            slot.appendChild(el);
        }

        slot.onclick = (e) => {
             // Handle click on empty slot
             if (state.foundations[i].length === 0) {
                 handleSolitaireClick(windowId, 'foundation', i, -1);
             }
        };

        foundationArea.appendChild(slot);
    }
    topRow.appendChild(foundationArea);
    board.appendChild(topRow);

    // Bottom Row: Tableau
    const bottomRow = document.createElement('div');
    bottomRow.className = 'solitaire-bottom-row';

    for (let i = 0; i < 7; i++) {
        const col = document.createElement('div');
        col.className = 'solitaire-column';

        // Empty column click handler
        col.onclick = (e) => {
            if (state.tableau[i].length === 0) {
                handleSolitaireClick(windowId, 'tableau', i, -1);
            }
        };

        state.tableau[i].forEach((card, idx) => {
            const isSelected = state.selected && state.selected.type === 'tableau' && state.selected.index === i && state.selected.subIndex === idx;
            const el = renderCard(card, 'tableau', i, idx, isSelected);
            el.style.top = `${idx * 25}px`; // Overlap
            col.appendChild(el);
        });

        bottomRow.appendChild(col);
    }

    board.appendChild(bottomRow);
}

function handleSolitaireClick(windowId, type, index, subIndex) {
    const state = solitaireGames[windowId];
    if (!state) return;

    if (type === 'stock') {
        if (state.stock.length > 0) {
            // Draw
            const card = state.stock.pop();
            card.faceUp = true;
            state.waste.push(card);
            state.selected = null;
        } else {
            // Recycle waste
            while(state.waste.length > 0) {
                const card = state.waste.pop();
                card.faceUp = false;
                state.stock.push(card);
            }
            state.selected = null;
        }
        renderSolitaire(windowId);
        return;
    }

    // Logic for selection and movement
    if (!state.selected) {
        // Select logic
        if (type === 'waste' && state.waste.length > 0) {
            state.selected = { type: 'waste', index: 0, subIndex: state.waste.length - 1 };
        } else if (type === 'tableau') {
            const pile = state.tableau[index];
            if (pile.length > 0 && subIndex !== -1) {
                const card = pile[subIndex];
                if (card.faceUp) {
                    state.selected = { type: 'tableau', index: index, subIndex: subIndex };
                }
            }
        } else if (type === 'foundation') {
            if (state.foundations[index].length > 0) {
                state.selected = { type: 'foundation', index: index, subIndex: state.foundations[index].length - 1 };
            }
        }
    } else {
        // Move logic
        // Target is (type, index)

        // If clicking same card, deselect
        if (state.selected.type === type && state.selected.index === index && state.selected.subIndex === subIndex) {
            state.selected = null;
            renderSolitaire(windowId);
            return;
        }

        const sourceCard = getSolitaireCard(state, state.selected);
        if (!sourceCard) {
             state.selected = null;
             renderSolitaire(windowId);
             return;
        }

        let moveValid = false;

        if (type === 'foundation') {
            // Move to foundation
            // Can only move one card at a time to foundation
            // Check if source is top of its pile
            const isTop = isTopOfPile(state, state.selected);
            if (isTop) {
                const targetPile = state.foundations[index];
                if (targetPile.length === 0) {
                    if (sourceCard.rank === 1) moveValid = true;
                } else {
                    const top = targetPile[targetPile.length - 1];
                    if (top.suit === sourceCard.suit && top.rank === sourceCard.rank - 1) {
                        moveValid = true;
                    }
                }
            }
        } else if (type === 'tableau') {
            // Move to tableau
            const targetPile = state.tableau[index];
            if (targetPile.length === 0) {
                if (sourceCard.rank === 13) moveValid = true; // King
            } else {
                const top = targetPile[targetPile.length - 1];
                if (top.color !== sourceCard.color && top.rank === sourceCard.rank + 1) {
                    moveValid = true;
                }
            }
        }

        if (moveValid) {
            executeSolitaireMove(state, state.selected, { type, index });
            state.selected = null;

            // Check Win
            if (state.foundations.every(f => f.length === 13)) {
                setTimeout(() => alert("You Won!"), 100);
            }
        } else {
            // Invalid move, change selection if valid target
            // Similar selection logic as above
             if (type === 'waste' && state.waste.length > 0) {
                state.selected = { type: 'waste', index: 0, subIndex: state.waste.length - 1 };
            } else if (type === 'tableau') {
                const pile = state.tableau[index];
                if (pile.length > 0 && subIndex !== -1) {
                    const card = pile[subIndex];
                    if (card.faceUp) {
                        state.selected = { type: 'tableau', index: index, subIndex: subIndex };
                    }
                }
            } else if (type === 'foundation') {
                if (state.foundations[index].length > 0) {
                    state.selected = { type: 'foundation', index: index, subIndex: state.foundations[index].length - 1 };
                }
            } else {
                state.selected = null;
            }
        }
    }

    renderSolitaire(windowId);
}

function getSolitaireCard(state, selection) {
    if (selection.type === 'waste') return state.waste[state.waste.length - 1];
    if (selection.type === 'foundation') return state.foundations[selection.index][state.foundations[selection.index].length - 1];
    if (selection.type === 'tableau') return state.tableau[selection.index][selection.subIndex];
    return null;
}

function isTopOfPile(state, selection) {
    if (selection.type === 'waste') return true;
    if (selection.type === 'foundation') return true;
    if (selection.type === 'tableau') {
        return selection.subIndex === state.tableau[selection.index].length - 1;
    }
    return false;
}

function executeSolitaireMove(state, from, to) {
    let cardsToMove = [];

    // Extract cards
    if (from.type === 'waste') {
        cardsToMove.push(state.waste.pop());
    } else if (from.type === 'foundation') {
        cardsToMove.push(state.foundations[from.index].pop());
    } else if (from.type === 'tableau') {
        const pile = state.tableau[from.index];
        cardsToMove = pile.splice(from.subIndex); // Take from subIndex to end

        // Flip new top card
        if (pile.length > 0) {
            pile[pile.length - 1].faceUp = true;
        }
    }

    // Add to target
    if (to.type === 'tableau') {
        state.tableau[to.index].push(...cardsToMove);
    } else if (to.type === 'foundation') {
        state.foundations[to.index].push(...cardsToMove);
    }
}

// Markdown Parser
function renderMarkdown(text) {
    if (!text) return '';

    // Sanitize HTML to prevent XSS (basic)
    // We only allow specific tags we generate.
    // Actually, simple regex replacement is prone to XSS if we don't escape input first.
    // Let's escape < and > first.
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code Block
    html = html.replace(/```(.*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, (match, p1, p2) => {
        // Sanitize URL
        let url = p2.trim();
        return `<a href="${url}" target="_blank">${p1}</a>`;
    });

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>');

    // Blockquote
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Paragraphs (newlines)
    // If line is not a tag, wrap in p?
    // Simple approach: Replace \n with <br>
    html = html.replace(/\n/g, '<br>');

    return html;
}

// Pong Game Logic
const pongGames = {};

// 2048 Game State
const game2048States = {};

function initPong(windowId) {
    const canvas = document.getElementById(`pong-canvas-${windowId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const win = document.getElementById(windowId);
    if (win) {
        win.tabIndex = 0;
        win.focus();
    }

    if (pongGames[windowId]) {
        cancelAnimationFrame(pongGames[windowId].requestId);
    }

    const paddleWidth = 10;
    const paddleHeight = 60;
    const ballSize = 8;

    const game = {
        requestId: null,
        player: {
            x: 10,
            y: (canvas.height - paddleHeight) / 2,
            score: 0,
            dy: 0
        },
        ai: {
            x: canvas.width - 20,
            y: (canvas.height - paddleHeight) / 2,
            score: 0,
            speed: 3
        },
        ball: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 4,
            dy: 4
        }
    };

    function resetBall() {
        game.ball.x = canvas.width / 2;
        game.ball.y = canvas.height / 2;
        game.ball.dx = -game.ball.dx; // Serve to winner/loser
        game.ball.dy = (Math.random() * 6) - 3;
    }

    function update() {
        if (!pongGames[windowId]) return;

        // Player movement
        game.player.y += game.player.dy;
        if (game.player.y < 0) game.player.y = 0;
        if (game.player.y > canvas.height - paddleHeight) game.player.y = canvas.height - paddleHeight;

        // AI movement
        const aiCenter = game.ai.y + paddleHeight / 2;
        if (aiCenter < game.ball.y - 10) game.ai.y += game.ai.speed;
        else if (aiCenter > game.ball.y + 10) game.ai.y -= game.ai.speed;
        if (game.ai.y < 0) game.ai.y = 0;
        if (game.ai.y > canvas.height - paddleHeight) game.ai.y = canvas.height - paddleHeight;

        // Ball movement
        game.ball.x += game.ball.dx;
        game.ball.y += game.ball.dy;

        // Ball collision with walls
        if (game.ball.y < 0 || game.ball.y > canvas.height - ballSize) {
            game.ball.dy = -game.ball.dy;
        }

        // Ball collision with paddles
        // Player
        if (game.ball.x < game.player.x + paddleWidth &&
            game.ball.x + ballSize > game.player.x &&
            game.ball.y + ballSize > game.player.y &&
            game.ball.y < game.player.y + paddleHeight) {
            game.ball.dx = -game.ball.dx;
            // Speed up slightly?
            game.ball.dx *= 1.05;
            game.ball.dx = Math.min(Math.max(game.ball.dx, -10), 10);

             // Add some spin/angle change based on where it hit the paddle
            const hitPoint = (game.ball.y + ballSize/2) - (game.player.y + paddleHeight/2);
            game.ball.dy = hitPoint * 0.2;
        }

        // AI
        if (game.ball.x + ballSize > game.ai.x &&
            game.ball.x < game.ai.x + paddleWidth &&
            game.ball.y + ballSize > game.ai.y &&
            game.ball.y < game.ai.y + paddleHeight) {
            game.ball.dx = -game.ball.dx;
             // Add some spin/angle change
            const hitPoint = (game.ball.y + ballSize/2) - (game.ai.y + paddleHeight/2);
            game.ball.dy = hitPoint * 0.2;
        }

        // Scoring
        if (game.ball.x < 0) {
            game.ai.score++;
            updateScore();
            resetBall();
        } else if (game.ball.x > canvas.width) {
            game.player.score++;
            updateScore();
            resetBall();
        }

        draw();
        game.requestId = requestAnimationFrame(update);
    }

    function updateScore() {
        const p1 = document.getElementById(`pong-score-p1-${windowId}`);
        const p2 = document.getElementById(`pong-score-p2-${windowId}`);
        if (p1 && p2) {
            p1.textContent = game.player.score;
            p2.textContent = game.ai.score;
        }
    }

    function draw() {
        // Clear
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center Line
        ctx.strokeStyle = '#333';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(game.player.x, game.player.y, paddleWidth, paddleHeight);
        ctx.fillRect(game.ai.x, game.ai.y, paddleWidth, paddleHeight);

        // Ball
        ctx.fillRect(game.ball.x, game.ball.y, ballSize, ballSize);
    }

    // Input Handling
    if (win) {
        win.onkeydown = (e) => {
            if (e.key === 'ArrowUp') {
                game.player.dy = -5;
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                game.player.dy = 5;
                e.preventDefault();
            }
        };

        win.onkeyup = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                game.player.dy = 0;
            }
        };
    }

    pongGames[windowId] = game;
    update();
}

// 2048 Game Logic
function initGame2048(windowId) {
    const grid = document.getElementById(`game-2048-grid-${windowId}`);
    if (!grid) return;

    // Reset state
    game2048States[windowId] = {
        board: Array(4).fill().map(() => Array(4).fill(0)),
        score: 0,
        gameOver: false,
        won: false
    };

    // Load Best Score
    const bestScore = localStorage.getItem('2048-best') || 0;
    const bestEl = document.getElementById(`game-2048-best-${windowId}`);
    if(bestEl) bestEl.textContent = bestScore;

    // Add initial tiles
    addRandomTile2048(windowId);
    addRandomTile2048(windowId);

    updateGame2048Display(windowId);

    // Hide overlay
    const overlay = document.getElementById(`game-2048-overlay-${windowId}`);
    if (overlay) overlay.style.display = 'none';

    // Focus window for key events
    const win = document.getElementById(windowId);
    if (win) {
        win.tabIndex = 0;
        win.focus();

        // Remove old listener if any (though closeWindow handles cleanup, re-init might need it)
        // We'll use onkeydown property to override
        win.onkeydown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                moveGame2048(windowId, e.key);
            }
        };
    }
}

function addRandomTile2048(windowId) {
    const state = game2048States[windowId];
    if (!state) return;

    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (state.board[r][c] === 0) {
                emptyCells.push({r, c});
            }
        }
    }

    if (emptyCells.length > 0) {
        const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        state.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateGame2048Display(windowId) {
    const state = game2048States[windowId];
    const grid = document.getElementById(`game-2048-grid-${windowId}`);
    const scoreEl = document.getElementById(`game-2048-score-${windowId}`);

    if (!state || !grid) return;

    grid.innerHTML = '';

    if (scoreEl) scoreEl.textContent = state.score;

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const val = state.board[r][c];
            const cell = document.createElement('div');
            cell.className = 'game-2048-cell';

            if (val > 0) {
                const tile = document.createElement('div');
                tile.className = `game-2048-tile tile-${val}`;
                tile.textContent = val;
                cell.appendChild(tile);
            }

            grid.appendChild(cell);
        }
    }
}

function moveGame2048(windowId, direction) {
    const state = game2048States[windowId];
    if (!state || state.gameOver) return;

    let rotated = false;
    let moved = false;
    let board = state.board;

    // Helper to rotate matrix clockwise
    const rotate = (m) => m[0].map((val, index) => m.map(row => row[index]).reverse());

    // Normalize to "Left" move
    if (direction === 'ArrowRight') {
        board = rotate(rotate(board)); // 180
    } else if (direction === 'ArrowUp') {
        board = rotate(rotate(rotate(board))); // 270 (-90)
    } else if (direction === 'ArrowDown') {
        board = rotate(board); // 90
    }

    // Process rows (Slide Left)
    for (let r = 0; r < 4; r++) {
        let row = board[r];
        let newRow = row.filter(val => val !== 0); // Remove zeros

        // Merge
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i+1]) {
                newRow[i] *= 2;
                state.score += newRow[i];
                newRow[i+1] = 0;
            }
        }
        newRow = newRow.filter(val => val !== 0); // Remove zeros again

        // Fill with zeros
        while (newRow.length < 4) {
            newRow.push(0);
        }

        if (newRow.join(',') !== row.join(',')) {
            moved = true;
        }
        board[r] = newRow;
    }

    // Rotate back
    if (direction === 'ArrowRight') {
        board = rotate(rotate(board));
    } else if (direction === 'ArrowUp') {
        board = rotate(board);
    } else if (direction === 'ArrowDown') {
        board = rotate(rotate(rotate(board)));
    }

    state.board = board;

    if (moved) {
        addRandomTile2048(windowId);
        updateGame2048Display(windowId);

        // Update Best Score
        const currentBest = parseInt(localStorage.getItem('2048-best') || 0);
        if (state.score > currentBest) {
            localStorage.setItem('2048-best', state.score);
            const bestEl = document.getElementById(`game-2048-best-${windowId}`);
            if(bestEl) bestEl.textContent = state.score;
        }

        if (checkGameOver2048(state.board)) {
            state.gameOver = true;
            const overlay = document.getElementById(`game-2048-overlay-${windowId}`);
            const msg = document.getElementById(`game-2048-msg-${windowId}`);
            if (overlay) {
                overlay.style.display = 'flex';
                msg.textContent = 'Game Over';
            }
        }
    }
}

function checkGameOver2048(board) {
    // Check for empty cells
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return false;
        }
    }

    // Check for merges
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (c < 3 && board[r][c] === board[r][c+1]) return false;
            if (r < 3 && board[r][c] === board[r+1][c]) return false;
        }
    }

    return true;
}

// Sudoku Logic
const sudokuStates = {};

function initSudoku(windowId) {
    const difficultySelect = document.getElementById(`sudoku-difficulty-${windowId}`);
    const difficulty = difficultySelect ? difficultySelect.value : 'medium';

    // Generate a solved board
    const solution = generateSolvedSudoku();

    // Create the puzzle by removing numbers
    let removeCount = 30; // Easy
    if (difficulty === 'medium') removeCount = 45;
    if (difficulty === 'hard') removeCount = 55;

    const puzzle = JSON.parse(JSON.stringify(solution));
    const cellsToRemove = [];
    while (cellsToRemove.length < removeCount) {
        const idx = Math.floor(Math.random() * 81);
        if (!cellsToRemove.includes(idx)) {
            cellsToRemove.push(idx);
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            puzzle[r][c] = 0;
        }
    }

    sudokuStates[windowId] = {
        solution: solution,
        puzzle: puzzle, // Initial state
        current: JSON.parse(JSON.stringify(puzzle)), // Current state
        selected: null // {r, c}
    };

    renderSudoku(windowId);

    // Add keyboard support
    const win = document.getElementById(windowId);
    if (win) {
        win.tabIndex = 0;
        win.focus();
        win.onkeydown = (e) => {
            if (e.key >= '1' && e.key <= '9') {
                handleSudokuInput(windowId, parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                handleSudokuInput(windowId, 0);
            } else if (e.key.startsWith('Arrow')) {
                moveSudokuSelection(windowId, e.key);
                e.preventDefault();
            }
        };
    }
}

function moveSudokuSelection(windowId, key) {
    const state = sudokuStates[windowId];
    if (!state || !state.selected) {
        // Select first editable or 0,0
        selectSudokuCell(windowId, 0, 0);
        return;
    }

    let {r, c} = state.selected;
    if (key === 'ArrowUp') r = Math.max(0, r - 1);
    if (key === 'ArrowDown') r = Math.min(8, r + 1);
    if (key === 'ArrowLeft') c = Math.max(0, c - 1);
    if (key === 'ArrowRight') c = Math.min(8, c + 1);

    selectSudokuCell(windowId, r, c);
}

function generateSolvedSudoku() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    fillSudoku(board);
    return board;
}

function fillSudoku(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const nums = [1,2,3,4,5,6,7,8,9];
                shuffleArray(nums);

                for (let num of nums) {
                    if (isValidSudokuMove(board, r, c, num)) {
                        board[r][c] = num;
                        if (fillSudoku(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidSudokuMove(board, row, col, num) {
    // Row
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    // Col
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    // Box
    const startR = Math.floor(row / 3) * 3;
    const startC = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[startR + r][startC + c] === num) return false;
        }
    }
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderSudoku(windowId) {
    const state = sudokuStates[windowId];
    const boardEl = document.getElementById(`sudoku-board-${windowId}`);
    if (!state || !boardEl) return;

    boardEl.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = state.current[r][c];
            const isPrefilled = state.puzzle[r][c] !== 0;

            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            if (isPrefilled) cell.classList.add('prefilled');
            else if (val !== 0) cell.classList.add('user-filled');

            if (state.selected && state.selected.r === r && state.selected.c === c) {
                cell.classList.add('selected');
            }

            cell.textContent = val === 0 ? '' : val;
            cell.onclick = () => selectSudokuCell(windowId, r, c);

            boardEl.appendChild(cell);
        }
    }
}

function selectSudokuCell(windowId, r, c) {
    const state = sudokuStates[windowId];
    if (!state) return;

    state.selected = {r, c};
    renderSudoku(windowId);
}

function handleSudokuInput(windowId, num) {
    const state = sudokuStates[windowId];
    if (!state || !state.selected) return;

    const {r, c} = state.selected;

    // Check if prefilled
    if (state.puzzle[r][c] !== 0) return;

    state.current[r][c] = num;
    renderSudoku(windowId);
}

function checkSudoku(windowId) {
    const state = sudokuStates[windowId];
    if (!state) return;

    let isCorrect = true;
    let isComplete = true;

    // Validate against solution
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (state.current[r][c] === 0) {
                isComplete = false;
            } else if (state.current[r][c] !== state.solution[r][c]) {
                isCorrect = false;
            }
        }
    }

    if (isComplete && isCorrect) {
        alert("Congratulations! You solved the Sudoku!");
    } else if (!isCorrect) {
        alert("There are errors in your solution.");
    } else {
        alert("The board is not complete yet.");
    }
}

// Markdown Editor Logic
function initMarkdownEditor(windowId, filename) {
    const textarea = document.getElementById(`md-input-area-${windowId}`);
    const preview = document.getElementById(`md-preview-${windowId}`);

    if (filename && fileSystem[filename]) {
        textarea.value = fileSystem[filename];
        textarea.dataset.filename = filename;
    }

    // Initial Render
    updateMarkdownPreview(windowId);

    // Live Update
    textarea.addEventListener('input', () => updateMarkdownPreview(windowId));
}

function updateMarkdownPreview(windowId) {
    const textarea = document.getElementById(`md-input-area-${windowId}`);
    const preview = document.getElementById(`md-preview-${windowId}`);
    if (!textarea || !preview) return;

    const text = textarea.value;
    const html = renderMarkdown(text); // Reuse existing parser
    preview.innerHTML = html;
}

function saveMarkdownFile(windowId) {
    const textarea = document.getElementById(`md-input-area-${windowId}`);
    const text = textarea.value;
    const defaultName = textarea.dataset.filename || "document.md";

    const filename = prompt("Enter filename to save (e.g., notes.md):", defaultName);
    if (filename) {
        fileSystem[filename] = text;
        saveFileSystem();
        alert(`File "${filename}" saved to system.`);
    }
}

function downloadMarkdownFile(windowId) {
    const textarea = document.getElementById(`md-input-area-${windowId}`);
    const text = textarea.value;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = textarea.dataset.filename || 'document.md';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

function openMarkdownFile(windowId) {
    const input = document.getElementById(`md-input-${windowId}`);
    const textarea = document.getElementById(`md-input-area-${windowId}`);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            textarea.value = e.target.result;
            textarea.dataset.filename = file.name;
            updateMarkdownPreview(windowId);
        };
        reader.readAsText(file);
    }
}
