// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

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

function openApp(appName) {
    const windowId = `window-${windowCount++}`;
    const windowArea = document.getElementById('window-area');

    const win = document.createElement('div');
    win.className = 'window';
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
        content = '<textarea class="notepad-area"></textarea>';
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
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="startDrag(event, '${windowId}')">
            <div class="title-bar-text">${title}</div>
            <div class="title-bar-controls">
                <button class="window-button minimize-button" onclick="minimizeWindow('${windowId}')">_</button>
                <button class="window-button close-button" onclick="closeWindow('${windowId}')">X</button>
            </div>
        </div>
        <div class="window-content" onclick="focusWindow('${windowId}')">
            ${content}
        </div>
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
    }
}

function closeWindow(windowId) {
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

// Terminal Logic
function handleTerminalCommand(cmd, outputDiv) {
    const line = document.createElement('div');
    line.textContent = '> ' + cmd;
    outputDiv.appendChild(line);

    let response = '';
    const command = cmd.trim().toLowerCase();

    if (command === 'help') {
        response = 'Available commands: help, date, clear, echo [text], about, reboot';
    } else if (command === 'date') {
        response = new Date().toString();
    } else if (command === 'clear') {
        outputDiv.innerHTML = '';
        return;
    } else if (command.startsWith('echo ')) {
        response = cmd.substring(5);
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
        const respLine = document.createElement('div');
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
