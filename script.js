// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
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
});

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
            <div class="calc-display" id="calc-display-${windowId}">0</div>
            <div class="calc-buttons">
                <button class="calc-btn clear" onclick="calcInput('${windowId}', 'C')">C</button>
                <button class="calc-btn operator" onclick="calcInput('${windowId}', '/')">/</button>
                <button class="calc-btn operator" onclick="calcInput('${windowId}', '*')">*</button>
                <button class="calc-btn operator" onclick="calcInput('${windowId}', '-')">-</button>

                <button class="calc-btn" onclick="calcInput('${windowId}', '7')">7</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '8')">8</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '9')">9</button>
                <button class="calc-btn operator" onclick="calcInput('${windowId}', '+')">+</button>

                <button class="calc-btn" onclick="calcInput('${windowId}', '4')">4</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '5')">5</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '6')">6</button>
                <button class="calc-btn equals" style="grid-row: span 2" onclick="calcInput('${windowId}', '=')">=</button>

                <button class="calc-btn" onclick="calcInput('${windowId}', '1')">1</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '2')">2</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '3')">3</button>

                <button class="calc-btn" style="grid-column: span 2" onclick="calcInput('${windowId}', '0')">0</button>
                <button class="calc-btn" onclick="calcInput('${windowId}', '.')">.</button>
            </div>
        `;
    } else if (appName === 'snake') {
        title = "Snake";
        win.classList.add('snake-window');
        content = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #222;">
                <canvas id="snake-canvas-${windowId}" width="400" height="300" style="border: 2px solid #555; background: black;"></canvas>
                <button onclick="startSnake('${windowId}')" style="margin-top: 10px; padding: 5px 15px; cursor: pointer;">Start Game</button>
                <div id="snake-score-${windowId}" style="color: white; margin-top: 5px;">Score: 0</div>
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
            </div>
        `;
    } else if (appName === 'paint') {
        title = "Paint";
        win.classList.add('paint-window');
        content = `
            <div class="paint-toolbar" style="padding: 5px; background: #eee; display: flex; gap: 5px; align-items: center; border-bottom: 1px solid #ccc;">
                <label style="font-size: 12px;">Color:</label>
                <input type="color" id="paint-color-${windowId}" value="#000000" style="height: 25px; cursor: pointer;">
                <label style="font-size: 12px;">Size:</label>
                <input type="range" id="paint-size-${windowId}" min="1" max="50" value="5" style="width: 80px; cursor: pointer;">
                <div style="flex: 1;"></div>
                <button onclick="clearPaint('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Clear</button>
                <label style="font-size: 12px; padding: 2px 8px; cursor: pointer; border: 1px solid #999; background: #ddd; display: inline-block;">
                    Open <input type="file" id="paint-input-${windowId}" style="display: none;" onchange="openPaintFile('${windowId}')" accept="image/*">
                </label>
                <button onclick="savePaint('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer; font-weight: bold;">Save</button>
            </div>
            <div style="flex: 1; overflow: hidden; background: white; position: relative; cursor: crosshair;">
                <canvas id="paint-canvas-${windowId}" style="display: block;"></canvas>
            </div>
        `;
        // Defer initialization to after append
        setTimeout(() => initPaint(windowId), 0);
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
    if (appName === 'notepad' && arg) {
        const ta = document.getElementById(`notepad-area-${windowId}`);
        if (fileSystem[arg] !== undefined) {
            ta.value = fileSystem[arg];
            ta.dataset.filename = arg;
        }
    }

    if (appName === 'terminal') {
        const input = win.querySelector('.terminal-input');
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleTerminalCommand(this.value, win.querySelector('.terminal-output'));
                this.value = '';
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
        response = 'Available commands: help, date, clear, echo [text], ls, cat [file], touch [file], rm [file], about, reboot';
    } else if (command === 'date') {
        response = new Date().toString();
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
    } else if (command === 'about') {
        openApp('about');
        response = 'Opened About window.';
    } else if (command === 'reboot') {
        location.reload();
    } else if (command === '') {
        response = '';
    } else {
        response = `Command not found: ${command}`;
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
    if (!display) return;

    let currentText = display.textContent;

    if (value === 'C') {
        display.textContent = '0';
    } else if (value === '=') {
        try {
            // Safety check: only allow numbers and operators
            if (/^[0-9+\-/*.]+$/.test(currentText)) {
                // eslint-disable-next-line no-eval
                display.textContent = eval(currentText);
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
function initPaint(windowId) {
    const canvas = document.getElementById(`paint-canvas-${windowId}`);
    const container = canvas.parentElement;

    // Resize canvas to fit container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    let painting = false;

    // Handle resizing (basic)
    // For a real app, we might want to preserve content on resize,
    // but for simplicity, we'll just let it be fixed size or crop.

    function startPosition(e) {
        painting = true;
        drawPaint(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function drawPaint(e) {
        if (!painting) return;

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

        fileDiv.appendChild(iconDiv);
        fileDiv.appendChild(nameDiv);

        fileDiv.onmouseover = () => fileDiv.style.backgroundColor = '#e0e0e0';
        fileDiv.onmouseout = () => fileDiv.style.backgroundColor = 'transparent';

        fileDiv.onclick = () => {
             if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
                 alert("Opening images from Explorer not yet supported.");
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

    if (snakeGames[windowId]) {
        clearInterval(snakeGames[windowId].interval);
    }

    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 1;
    let dy = 0;
    let score = 0;
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

// Initialize FileSystem
loadFileSystem();
