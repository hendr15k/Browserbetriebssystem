const appCategories = {
    system: ['terminal', 'file-explorer', 'task-manager', 'system-monitor', 'system-center', 'settings', 'about', 'clock', 'wine', 'calculator', 'printer', 'recyclebin'],
    productivity: ['notepad', 'code-editor', 'spreadsheet', 'markdown-editor', 'pdf-viewer', 'pomodoro', 'calendar', 'sticky-notes', 'email', 'unit-converter'],
    games: ['snake', 'minesweeper', '2048', 'tetris', 'solitaire', 'sudoku', 'pong', 'memory', 'tictactoe'],
    creative: ['paint', 'piano', 'voice-recorder', 'camera', 'music-player', 'video-player', 'speak', 'photo-gallery'],
    internet: ['browser', 'weather', 'chat']
};

const appData = {
    terminal: { name: 'Terminal', icon: '>_', bg: '#333', color: 'white' },
    notepad: { name: 'Notepad', icon: 'Txt', bg: 'white', color: 'black' },
    'file-explorer': { name: 'Explorer', icon: '📂', bg: '#f1c40f', color: 'white' },
    calculator: { name: 'Calculator', icon: '=', bg: '#27ae60', color: 'white' },
    snake: { name: 'Snake', icon: 'S', bg: '#9b59b6', color: 'white' },
    paint: { name: 'Paint', icon: 'P', bg: '#e67e22', color: 'white' },
    tictactoe: { name: 'Tic Tac Toe', icon: '#', bg: '#e74c3c', color: 'white' },
    settings: { name: 'Settings', icon: '⚙', bg: '#777', color: 'white' },
    'system-center': { name: 'System Center', icon: '🖥️', bg: '#1f2937', color: 'white' },
    about: { name: 'About', icon: '?', bg: '#0078d7', color: 'white' },
    speak: { name: 'Speak', icon: '🔊', bg: '#e91e63', color: 'white' },
    camera: { name: 'Camera', icon: '📷', bg: '#000', color: 'white' },
    minesweeper: { name: 'Minesweeper', icon: '💣', bg: '#c0392b', color: 'white' },
    calendar: { name: 'Calendar', icon: '📅', bg: '#2980b9', color: 'white' },
    clock: { name: 'Clock', icon: '⏰', bg: '#2c3e50', color: 'white' },
    memory: { name: 'Memory', icon: '🧠', bg: '#f39c12', color: 'white' },
    'music-player': { name: 'Music Player', icon: '🎵', bg: '#e91e63', color: 'white' },
    'video-player': { name: 'Video Player', icon: '🎬', bg: '#673ab7', color: 'white' },
    'task-manager': { name: 'Task Manager', icon: '📊', bg: '#34495e', color: 'white' },
    tetris: { name: 'Tetris', icon: 'T', bg: '#9b59b6', color: 'white' },
    browser: { name: 'Web Browser', icon: '🌐', bg: '#00a8e8', color: 'white' },
    'unit-converter': { name: 'Unit Converter', icon: '⚖️', bg: '#16a085', color: 'white' },
    'sticky-notes': { name: 'Sticky Notes', icon: '📝', bg: '#f1c40f', color: 'white' },
    'markdown-editor': { name: 'Markdown Editor', icon: 'Md', bg: '#333', color: 'white' },
    'code-editor': { name: 'Code Editor', icon: '</>', bg: '#2c3e50', color: '#ecf0f1' },
    solitaire: { name: 'Solitaire', icon: '🃏', bg: '#27ae60', color: 'white' },
    pong: { name: 'Pong', icon: '🏓', bg: '#000', color: 'white' },
    '2048': { name: '2048', icon: '2048', bg: '#edc22e', color: 'white' },
    sudoku: { name: 'Sudoku', icon: '🔢', bg: '#34495e', color: 'white' },
    weather: { name: 'Weather', icon: '🌤️', bg: '#3498db', color: 'white' },
    pomodoro: { name: 'Pomodoro Timer', icon: '🍅', bg: '#e67e22', color: 'white' },
    'voice-recorder': { name: 'Voice Recorder', icon: '🎙️', bg: '#e74c3c', color: 'white' },
    piano: { name: 'Piano', icon: '🎹', bg: '#333', color: 'white' },
    spreadsheet: { name: 'Spreadsheet', icon: '📊', bg: '#27ae60', color: 'white' },
    'pdf-viewer': { name: 'PDF Viewer', icon: '📄', bg: '#e74c3c', color: 'white' },
    email: { name: 'Email', icon: '📧', bg: '#0078d7', color: 'white' },
    chat: { name: 'Chat', icon: '💬', bg: '#2ecc71', color: 'white' },
    'photo-gallery': { name: 'Photo Gallery', icon: '🖼️', bg: '#9b59b6', color: 'white' },
    printer: { name: 'Printer Settings', icon: '🖨️', bg: '#7f8c8d', color: 'white' },
    wine: { name: 'Wine', icon: '🍷', bg: '#8b0000', color: 'white' },
    recyclebin: { name: 'Recycle Bin', icon: '🗑️', bg: '#16a085', color: 'white' }
};

let currentCategory = 'all';

function renderStartApps(category = 'all') {
    const container = document.getElementById('start-apps-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let apps = [];
    if (category === 'all') {
        apps = Object.keys(appData);
    } else if (appCategories[category]) {
        apps = appCategories[category];
    }
    
    apps.forEach(appId => {
        const app = appData[appId];
        if (!app) return;
        
        const item = document.createElement('div');
        item.className = 'start-item';
        item.dataset.app = appId;
        item.onclick = () => { openApp(appId); toggleStartMenu(); };
        
        if (isPinned(appId)) {
            const pinMark = document.createElement('span');
            pinMark.className = 'start-item-pin';
            pinMark.textContent = '📌';
            pinMark.style.cssText = 'position:absolute;top:4px;right:6px;font-size:11px;opacity:0.7;';
            item.style.position = 'relative';
            item.appendChild(pinMark);
        }
        
        const icon = document.createElement('div');
        icon.className = 'start-item-icon';
        icon.style.background = app.bg;
        icon.style.color = app.color;
        if (app.bg === 'white') icon.style.border = '1px solid #ccc';
        icon.textContent = app.icon;
        
        const label = document.createElement('div');
        label.className = 'start-item-label';
        label.textContent = app.name;
        
        item.appendChild(icon);
        item.appendChild(label);
        container.appendChild(item);
    });
}

function switchStartCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.start-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    renderStartApps(category);
    filterStartMenu(document.getElementById('start-search')?.value || '');
}

function filterStartMenu(query) {
    const items = document.querySelectorAll('.start-item');
    const noResults = document.getElementById('start-no-results');
    const searchCount = document.getElementById('start-search-count');
    const q = query.trim().toLowerCase();
    let visibleCount = 0;
    
    items.forEach(item => {
        const appId = item.dataset.app;
        const app = appData[appId];
        const labelEl = item.querySelector('.start-item-label');
        const labelText = app?.name || '';
        const isVisible = labelText.toLowerCase().includes(q);
        
        item.style.display = isVisible ? 'flex' : 'none';
        
        if (q) {
            const matchStart = labelText.toLowerCase().indexOf(q);
            if (matchStart !== -1) {
                const before = labelText.slice(0, matchStart);
                const match = labelText.slice(matchStart, matchStart + q.length);
                const after = labelText.slice(matchStart + q.length);
                labelEl.innerHTML = before + '<span class="start-item-label-mark">' + match + '</span>' + after;
            }
        } else {
            labelEl.textContent = labelText;
        }
        
        if (isVisible) visibleCount++;
    });
    
    if (searchCount) {
        if (q) {
            const noun = visibleCount === 1 ? 'app' : 'apps';
            searchCount.textContent = `${visibleCount} ${noun} found`;
            searchCount.style.display = 'block';
        } else {
            searchCount.style.display = 'none';
        }
    }
    
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('clock');
    clock.textContent = `${hours}:${minutes}`;
    clock.title = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    if (lockTime && lockDate) {
        lockTime.textContent = `${hours}:${minutes}`;
        lockDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
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

const defaultSystemProfile = {
    username: 'user',
    hostname: 'webos-machine',
    startupApps: ['file-explorer'],
    createdAt: Date.now()
};

let sessionStartTime = Date.now();

function getSystemProfile() {
    const saved = localStorage.getItem('systemProfile');
    if (!saved) return { ...defaultSystemProfile };

    try {
        const parsed = JSON.parse(saved);
        return { ...defaultSystemProfile, ...parsed };
    } catch (error) {
        return { ...defaultSystemProfile };
    }
}

function saveSystemProfile(profile) {
    localStorage.setItem('systemProfile', JSON.stringify(profile));
}

function getStorageStats() {
    const entries = Object.entries(fileSystem);
    let fileCount = 0;
    let directoryCount = 0;
    let totalBytes = 0;

    entries.forEach(([_, value]) => {
        if (value === 'directory') {
            directoryCount += 1;
            return;
        }

        fileCount += 1;
        totalBytes += (typeof value === 'string' ? value.length : 0);
    });

    const noteCount = Object.keys(stickyNotes || {}).length;

    return { fileCount, directoryCount, totalBytes, noteCount };
}

function runStartupApps() {
    const profile = getSystemProfile();
    const validApps = new Set(['terminal', 'file-explorer', 'task-manager', 'system-monitor', 'browser']);

    profile.startupApps
        .filter(app => validApps.has(app))
        .forEach((app, index) => {
            setTimeout(() => openApp(app), 150 * index);
        });
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
  });

  // ===================== FEATURE 1: CONTEXT MENUS =====================

  // Global state for context menus
  let activeIconContextMenu = null;
  let activeTaskbarContextMenu = null;

  // Desktop Context Menu
  document.addEventListener('DOMContentLoaded', () => {
      const desktop = document.getElementById('desktop');
      const contextMenu = document.getElementById('context-menu');
      const iconContextMenu = document.getElementById('icon-context-menu');
      const taskbarContextMenu = document.getElementById('taskbar-context-menu');

    // Desktop right-click
    desktop.addEventListener('contextmenu', (e) => {
        // Don't show if right-clicking on an icon or taskbar
        if (e.target.closest('.icon') || e.target.closest('#taskbar') || e.target.closest('.context-menu')) return;
        e.preventDefault();
        hideAllContextMenus();
        contextMenu.classList.remove('hidden');
        positionMenu(contextMenu, e.clientX, e.clientY);
    });

    // Taskbar right-click
    document.getElementById('taskbar').addEventListener('contextmenu', (e) => {
        if (e.target.closest('.taskbar-item') || e.target.closest('#taskbar-context-menu')) return;
        e.preventDefault();
        hideAllContextMenus();
        contextMenu.classList.remove('hidden');
        positionMenu(contextMenu, e.clientX, e.clientY);
    });

    // Click outside to close all context menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu') && !e.target.closest('#taskbar')) {
            hideAllContextMenus();
        }
    });

    // Right-click on desktop icons
    desktop.addEventListener('contextmenu', (e) => {
        const icon = e.target.closest('.icon');
        if (!icon) return;
        e.preventDefault();
        e.stopPropagation();
        hideAllContextMenus();
        activeIconContextMenu = icon.dataset.app;
        const app = appData[icon.dataset.app];
        document.getElementById('icon-context-title').textContent = app ? app.name : 'App';
        const hasPinned = isPinned(app?.id || icon.dataset.app);
        document.querySelector('[data-action="pin-app"]').style.display = hasPinned ? 'none' : 'flex';
        document.querySelector('[data-action="unpin-app"]').style.display = hasPinned ? 'flex' : 'none';
        iconContextMenu.classList.remove('hidden');
        positionMenu(iconContextMenu, e.clientX, e.clientY);
    });

    // Right-click on taskbar items
    document.getElementById('taskbar').addEventListener('contextmenu', (e) => {
        const taskbarItem = e.target.closest('.taskbar-item');
        if (!taskbarItem) return;
        e.preventDefault();
        e.stopPropagation();
        hideAllContextMenus();
        activeTaskbarContextMenu = taskbarItem.id.replace('taskbar-', '');
        document.getElementById('taskbar-context-title').textContent = taskbarItem.querySelector('.taskbar-icon + span')?.textContent || 'App';
        positionMenu(taskbarContextMenu, e.clientX, e.clientY);
    });
});

function positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let left = x;
    let top = y;
    if (left + rect.width > winW) left = winW - rect.width - 5;
    if (top + rect.height > winH) top = winH - rect.height - 5;
    if (left < 0) left = 5;
    if (top < 0) top = 5;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.style.display = 'block';
}

function hideAllContextMenus() {
    document.querySelectorAll('.context-menu').forEach(m => {
        m.classList.add('hidden');
        m.style.display = 'none';
    });
}

function handleContextMenuAction(action) {
    hideAllContextMenus();
    switch(action) {
        case 'refresh':
            location.reload();
            break;
        case 'new-file':
            const fname = prompt('Enter filename:', 'newfile.txt');
            if (fname) {
                fileSystem[fname] = '';
                saveFileSystem();
                showNotification('File Created', `Created ${fname}`);
            }
            break;
        case 'new-folder':
            const folderName = prompt('Enter folder name:', 'New Folder');
            if (folderName) {
                const key = folderName + '/';
                if (!fileSystem[key]) {
                    fileSystem[key] = 'directory';
                    saveFileSystem();
                    showNotification('Folder Created', `Created ${folderName}`);
                } else {
                    alert('Folder already exists');
                }
            }
            break;
        case 'settings':
            openApp('settings');
            break;
        case 'lock':
            lockSystem();
            break;
        case 'shutdown':
            shutdownSystem();
            break;
        case 'restart':
            restartSystem();
            break;
    }
}

function handleIconContextMenuAction(action) {
    hideAllContextMenus();
    if (!activeIconContextMenu) return;
    const appId = activeIconContextMenu;
    switch(action) {
        case 'open':
            openApp(appId);
            break;
        case 'pin':
            togglePin(appId);
            break;
        case 'unpin':
            togglePin(appId);
            break;
        case 'remove':
            // Remove from desktop by hiding the icon
            const icon = document.querySelector(`.icon[data-app="${appId}"]`);
            if (icon) {
                icon.style.display = 'none';
                const hidden = JSON.parse(localStorage.getItem('hiddenDesktopIcons') || '[]');
                if (!hidden.includes(appId)) hidden.push(appId);
                localStorage.setItem('hiddenDesktopIcons', JSON.stringify(hidden));
            }
            showNotification('Icon Removed', `${appData[appId]?.name || appId} removed from desktop.`);
            break;
    }
    activeIconContextMenu = null;
}

function handleTaskbarContextMenuAction(action) {
    hideAllContextMenus();
    if (!activeTaskbarContextMenu) return;
    const windowId = activeTaskbarContextMenu;
    switch(action) {
        case 'restore':
            minimizeWindow(windowId); // toggles restore
            break;
        case 'minimize':
            const win = document.getElementById(windowId);
            if (win && win.style.display !== 'none') {
                minimizeWindow(windowId);
            }
            break;
        case 'maximize':
            maximizeWindow(windowId);
            break;
        case 'close':
            closeWindow(windowId);
            break;
    }
    activeTaskbarContextMenu = null;
}

// ===================== FEATURE 3: APP PINNING =====================

function getPinnedApps() {
    return JSON.parse(localStorage.getItem('pinnedApps') || '[]');
}

function savePinnedApps(pinned) {
    localStorage.setItem('pinnedApps', JSON.stringify(pinned));
}

function isPinned(appId) {
    return getPinnedApps().includes(appId);
}

function togglePin(appId) {
    const pinned = getPinnedApps();
    const idx = pinned.indexOf(appId);
    if (idx === -1) {
        pinned.push(appId);
        showNotification('Angeheftet', `${appData[appId]?.name || appId} wurde angeheftet.`);
    } else {
        pinned.splice(idx, 1);
        showNotification('Abgeheftet', `${appData[appId]?.name || appId} wurde abgeheftet.`);
    }
    savePinnedApps(pinned);
    renderPinnedApps();
    renderStartApps(currentCategory);
}

function renderPinnedApps() {
    const container = document.getElementById('pinned-apps');
    if (!container) return;
    container.innerHTML = '';
    
    const pinned = getPinnedApps();
    pinned.forEach(appId => {
        const app = appData[appId];
        if (!app) return;
        
        const item = document.createElement('div');
        item.className = 'pinned-app-item';
        item.title = app.name;
        item.onclick = () => openApp(appId);
        
        const icon = document.createElement('span');
        icon.className = 'pinned-app-icon';
        icon.textContent = app.icon;
        icon.style.background = app.bg;
        icon.style.color = app.color;
        if (app.bg === 'white') icon.style.border = '1px solid #ccc';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'pinned-tooltip';
        tooltip.textContent = app.name;
        
        item.appendChild(icon);
        item.appendChild(tooltip);
        container.appendChild(item);
    });
}



// ===================== FEATURE 2: SYSTEM CLOCK TOOLTIP =====================

function updateClockTooltip() {
    const tooltip = document.getElementById('clock-tooltip');
    if (!tooltip) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const weekNum = getWeekNumber(now);

    document.getElementById('clock-tooltip-time').textContent = timeStr;
    document.getElementById('clock-tooltip-date').textContent = dateStr;
    document.getElementById('clock-tooltip-day').textContent = `KW ${weekNum}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Clock tooltip on hover
document.addEventListener('DOMContentLoaded', () => {
    const clock = document.getElementById('clock');
    const tooltip = document.getElementById('clock-tooltip');
    if (clock && tooltip) {
        clock.addEventListener('mouseenter', () => {
            updateClockTooltip();
            tooltip.classList.add('visible');
        });
        clock.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
        // Update tooltip time every second when visible
        setInterval(() => {
            if (tooltip.classList.contains('visible')) {
                updateClockTooltip();
            }
        }, 1000);
    }
});

    // Initialize Desktop Icons (dynamically generated)
    renderDesktopIcons();
    initDesktopIcons();

    // Initialize Sticky Notes
    initStickyNotes();

    // Restore window states from previous session
    restoreWindowStates();

    // Welcome Notification
    setTimeout(() => {
        showNotification('Welcome', 'WebOS initialized successfully.');
    }, 1000);

    setTimeout(() => {
        runStartupApps();
    }, 700);


function renderPinnedSection() {
    const container = document.getElementById('start-apps-container');
    if (!container) return;
    container.innerHTML = '';
    
    const pinned = getPinnedApps();
    if (pinned.length === 0) {
        container.innerHTML = '<div style="padding:30px;color:rgba(255,255,255,0.4);text-align:center;">No apps pinned yet.<br>Right-click an app to pin it.</div>';
        return;
    }
    
    pinned.forEach(appId => {
        const app = appData[appId];
        if (!app) return;
        
        const item = document.createElement('div');
        item.className = 'start-item';
        item.dataset.app = appId;
        item.onclick = () => { openApp(appId); toggleStartMenu(); };
        
        const icon = document.createElement('div');
        icon.className = 'start-item-icon';
        icon.style.background = app.bg;
        icon.style.color = app.color;
        if (app.bg === 'white') icon.style.border = '1px solid #ccc';
        icon.textContent = app.icon;
        
        const label = document.createElement('div');
        label.className = 'start-item-label';
        label.textContent = app.name;
        
        const unpinBtn = document.createElement('span');
        unpinBtn.textContent = '✕';
        unpinBtn.style.cssText = 'position:absolute;top:3px;right:4px;cursor:pointer;font-size:12px;opacity:0.5;';
        unpinBtn.onclick = (e) => { e.stopPropagation(); togglePin(appId); renderPinnedSection(); };
        item.style.position = 'relative';
        item.appendChild(unpinBtn);
        
        item.appendChild(icon);
        item.appendChild(label);
        container.appendChild(item);
    });
}


// Desktop Icons Rendering (dynamic from appData)
function renderDesktopIcons() {
    const container = document.getElementById('desktop-icons');
    if (!container) return;
    container.innerHTML = '';

    const categoryOrder = ['system', 'productivity', 'games', 'creative', 'internet'];
    const added = new Set();

    categoryOrder.forEach(cat => {
        const apps = appCategories[cat] || [];
        apps.forEach(appId => {
            if (added.has(appId)) return;
            added.add(appId);

            const app = appData[appId];
            if (!app) return;

            const icon = document.createElement('div');
            icon.className = 'icon';
            icon.dataset.app = appId;
            icon.onclick = (e) => {
                createRipple(e, icon);
                openApp(appId);
            };

            const iconImg = document.createElement('div');
            iconImg.className = 'icon-img';
            iconImg.style.background = app.bg;
            iconImg.style.color = app.color;
            if (app.bg === 'white') iconImg.style.border = '1px solid #ccc';
            iconImg.textContent = app.icon;

            const iconLabel = document.createElement('div');
            iconLabel.className = 'icon-label';
            iconLabel.textContent = app.name;

            icon.appendChild(iconImg);
            icon.appendChild(iconLabel);
            container.appendChild(icon);
        });
    });
}

// Ripple Effect for Desktop Icons
function createRipple(event, element) {
    const circle = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add('ripple-effect');

    const ripple = element.querySelector('.ripple-effect');
    if (ripple) ripple.remove();

    element.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
}

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
        icon.ontouchstart = (e) => startDragIcon(e, icon);
    });
}

let isDraggingIcon = false;
let currentDragIcon = null;
let iconDragOffset = { x: 0, y: 0 };
const ICON_DRAG_THRESHOLD = 5;
let iconDownPoint = null;
let iconDragArmed = false;

function startDragIcon(e, icon) {
    if (e.button !== undefined && e.button !== 0) return; // only primary button
    currentDragIcon = icon;
    const pt = getPointer(e);
    iconDownPoint = { x: pt.x, y: pt.y };
    iconDragArmed = true;
    isDraggingIcon = false;

    document.addEventListener('mousemove', dragIcon);
    document.addEventListener('mouseup', stopDragIcon);
    document.addEventListener('touchmove', dragIcon, { passive: false });
    document.addEventListener('touchend', stopDragIcon);
    document.addEventListener('touchcancel', stopDragIcon);
}

function dragIcon(e) {
    if (!currentDragIcon || !iconDragArmed) return;
    const pt = getPointer(e);

    // Only begin actually dragging once the pointer has moved past a small threshold,
    // so plain clicks still work and the icon doesn't snap to absolute on mere mousedown.
    if (!isDraggingIcon) {
        const dx = pt.x - iconDownPoint.x;
        const dy = pt.y - iconDownPoint.y;
        if (Math.abs(dx) < ICON_DRAG_THRESHOLD && Math.abs(dy) < ICON_DRAG_THRESHOLD) return;
        if (e.cancelable) e.preventDefault();
        isDraggingIcon = true;

        const desktop = document.getElementById('desktop');
        const iconRect = currentDragIcon.getBoundingClientRect();
        const desktopRect = desktop.getBoundingClientRect();
        if (getComputedStyle(currentDragIcon).position !== 'absolute') {
            currentDragIcon.style.position = 'absolute';
            currentDragIcon.style.left = `${iconRect.left - desktopRect.left}px`;
            currentDragIcon.style.top = `${iconRect.top - desktopRect.top}px`;
            currentDragIcon.style.margin = '0';
        }
        iconDragOffset.x = pt.x - currentDragIcon.getBoundingClientRect().left;
        iconDragOffset.y = pt.y - currentDragIcon.getBoundingClientRect().top;
    }

    if (e.cancelable) e.preventDefault();
    const desktop = document.getElementById('desktop');
    const desktopRect = desktop.getBoundingClientRect();
    const x = pt.x - desktopRect.left - iconDragOffset.x;
    const y = pt.y - desktopRect.top - iconDragOffset.y;
    currentDragIcon.style.left = `${x}px`;
    currentDragIcon.style.top = `${y}px`;
}

function stopDragIcon() {
    if (isDraggingIcon && currentDragIcon) {
        const savedPositions = JSON.parse(localStorage.getItem('desktopIconPositions')) || {};
        savedPositions[currentDragIcon.id] = {
            left: currentDragIcon.style.left,
            top: currentDragIcon.style.top
        };
        localStorage.setItem('desktopIconPositions', JSON.stringify(savedPositions));
    }
    isDraggingIcon = false;
    currentDragIcon = null;
    iconDragArmed = false;
    iconDownPoint = null;
    document.removeEventListener('mousemove', dragIcon);
    document.removeEventListener('mouseup', stopDragIcon);
    document.removeEventListener('touchmove', dragIcon);
    document.removeEventListener('touchend', stopDragIcon);
    document.removeEventListener('touchcancel', stopDragIcon);
}

// Start Menu Logic
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');
    const searchInput = document.getElementById('start-search');

    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
        btn.classList.add('active');
        renderStartApps(currentCategory);
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

let selectedStartItemIndex = -1;

function getVisibleStartItems() {
    return Array.from(document.querySelectorAll('.start-item')).filter(item => item.style.display !== 'none');
}

function updateStartSelection(newIndex) {
    const visibleItems = getVisibleStartItems();
    visibleItems.forEach(item => item.classList.remove('selected'));

    if (!visibleItems.length) {
        selectedStartItemIndex = -1;
        return;
    }

    if (newIndex < 0) {
        newIndex = visibleItems.length - 1;
    } else if (newIndex >= visibleItems.length) {
        newIndex = 0;
    }

    selectedStartItemIndex = newIndex;
    const selectedItem = visibleItems[selectedStartItemIndex];
    selectedItem.classList.add('selected');
    selectedItem.scrollIntoView({ block: 'nearest' });
}

// Initialize Search Listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('start-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterStartMenu(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            const menu = document.getElementById('start-menu');
            if (menu.style.display !== 'block') return;

            const visibleItems = getVisibleStartItems();

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateStartSelection(selectedStartItemIndex + 1);
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateStartSelection(selectedStartItemIndex - 1);
                return;
            }

            if (e.key === 'Enter' && visibleItems.length > 0) {
                e.preventDefault();
                const indexToLaunch = selectedStartItemIndex >= 0 ? selectedStartItemIndex : 0;
                visibleItems[indexToLaunch].click();
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                toggleStartMenu();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && e.key === 'Escape') || (e.altKey && e.key.toLowerCase() === 's')) {
            e.preventDefault();
            const menu = document.getElementById('start-menu');
            const isOpen = menu.style.display === 'block';

            if (!isOpen) {
                toggleStartMenu();
            }
        }
    });
});

// Close start menu when clicking outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');

    if (menu.style.display === 'block' &&
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

function togglePowerMenu() {
    const menu = document.getElementById('power-menu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function lockSystem() {
    const lockScreen = document.getElementById('lock-screen');
    const powerMenu = document.getElementById('power-menu');
    if (powerMenu) powerMenu.style.display = 'none';
    if (lockScreen) lockScreen.classList.remove('hidden');
}

function unlockSystem() {
    const pinInput = document.getElementById('unlock-pin');
    const error = document.getElementById('lock-error');
    const lockScreen = document.getElementById('lock-screen');
    const correctPin = localStorage.getItem('systemPin') || '1234';

    if (!pinInput || !error || !lockScreen) return;

    if (pinInput.value === correctPin) {
        lockScreen.classList.add('hidden');
        pinInput.value = '';
        error.textContent = '';
    } else {
        error.textContent = 'Falscher PIN. Bitte erneut versuchen.';
    }
}

function restartSystem() {
    location.reload();
}

function shutdownSystem() {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;

    lockScreen.classList.remove('hidden');
    lockScreen.innerHTML = `
        <div class="lock-card">
            <div id="lock-time">System</div>
            <div id="lock-date">WebOS wurde heruntergefahren.</div>
            <p>Zum Starten auf den Button klicken.</p>
            <button onclick="restartSystem()">Einschalten</button>
        </div>
    `;
}

// Window Management
let zIndex = 100;
let windowCount = 0;

function openApp(appName, arg = null, restoreData = null) {
    const windowId = restoreData && restoreData.id ? restoreData.id : `window-${windowCount++}`;
    const windowArea = document.getElementById('window-area');
    if (!windowArea) return;

    const win = document.createElement('div');
    win.className = 'window';
    if (restoreData && restoreData.restoredMaximized) {
        win.classList.add('maximized');
    } else if (window.innerWidth <= 768) {
        win.classList.add('maximized');
    }
    win.id = windowId;
    win.dataset.appName = appName;
    if (restoreData && restoreData.restoredZIndex) {
        win.style.zIndex = restoreData.restoredZIndex;
    } else {
        win.style.zIndex = ++zIndex;
    }

    if (restoreData && restoreData.left && restoreData.top) {
        win.style.left = restoreData.left;
        win.style.top = restoreData.top;
        if (restoreData.width) win.style.width = restoreData.width;
        if (restoreData.height) win.style.height = restoreData.height;
        if (restoreData.restoredDisplay) win.style.display = restoreData.restoredDisplay;
    } else {
        // Randomize position slightly
        const offsetPos = (windowCount || 0) * 20;
        win.style.left = `${50 + (offsetPos % 200)}px`;
        win.style.top = `${50 + (offsetPos % 200)}px`;
    }

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
                <button onclick="uploadFile('${windowId}')" style="font-size: 12px; padding: 2px 8px; cursor: pointer;">Upload</button>
                <input type="file" id="explorer-upload-${windowId}" style="display: none;" onchange="handleFileUpload('${windowId}', this)">
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
            <div class="settings-container">
                <section class="settings-section">
                    <h3>🖼️ Desktop Background</h3>
                    <div class="settings-grid">
                        <div class="bg-option" onclick="setBackground('linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)')" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);" title="Ocean Blue"></div>
                        <div class="bg-option" onclick="setBackground('linear-gradient(to right, #8e2de2, #4a00e0')" style="background: linear-gradient(to right, #8e2de2, #4a00e0);" title="Purple Haze"></div>
                        <div class="bg-option" onclick="setBackground('linear-gradient(to right, #f12711, #f5af19)')" style="background: linear-gradient(to right, #f12711, #f5af19);" title="Sunset"></div>
                        <div class="bg-option" onclick="setBackground('#222')" style="background: #222;" title="Dark"></div>
                        <div class="bg-option" onclick="setBackground('#1a1a2e')" style="background: #1a1a2e;" title="Midnight"></div>
                        <div class="bg-option" onclick="setBackground('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" title="Lavender"></div>
                        <div class="bg-option" onclick="setBackground('linear-gradient(to right, #00b09b, #96c93d)')" style="background: linear-gradient(to right, #00b09b, #96c93d);" title="Nature"></div>
                        <div class="bg-option" style="background: url(https://source.unsplash.com/random/1600x900/?nature); background-size: cover; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);" onclick="setBackground('url(https://source.unsplash.com/random/1600x900/?nature)')" title="Random Nature"></div>
                    </div>
                </section>
                <hr>
                <section class="settings-section">
                    <h3>🎨 Window Theme</h3>
                    <div class="settings-grid">
                        <div class="color-swatch" onclick="setThemeColor('#0078d7')" style="background: #0078d7;" title="Blue"></div>
                        <div class="color-swatch" onclick="setThemeColor('#2ecc71')" style="background: #2ecc71;" title="Green"></div>
                        <div class="color-swatch" onclick="setThemeColor('#e74c3c')" style="background: #e74c3c;" title="Red"></div>
                        <div class="color-swatch" onclick="setThemeColor('#9b59b6')" style="background: #9b59b6;" title="Purple"></div>
                        <div class="color-swatch" onclick="setThemeColor('#34495e')" style="background: #34495e;" title="Dark Slate"></div>
                        <div class="color-swatch" onclick="setThemeColor('#e67e22')" style="background: #e67e22;" title="Orange"></div>
                        <input type="color" onchange="setThemeColor(this.value)" value="#0078d7" title="Custom color">
                    </div>
                </section>
                <hr>
                <section class="settings-section">
                    <h3>🔒 Security</h3>
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
                        <input id="pin-input-${windowId}" type="password" placeholder="PIN setzen (min. 4 Zeichen)" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex: 1;">
                        <button onclick="saveSystemPin('${windowId}')" style="padding: 8px 16px; border: none; background: var(--theme-color); color: white; border-radius: 4px; cursor: pointer;">Speichern</button>
                    </div>
                </section>
                <hr>
                <section class="settings-section">
                    <h3>⚠️ Danger Zone</h3>
                    <button onclick="if(confirm('All settings and data will be cleared. Continue?')) { localStorage.clear(); location.reload(); }" class="danger-btn">
                        🗑️ Reset to Defaults
                    </button>
                </section>
            </div>
        `;
    } else if (appName === 'system-center') {
        title = "System Center";
        const profile = getSystemProfile();
        const startupOptions = [
            { id: 'terminal', label: 'Terminal' },
            { id: 'file-explorer', label: 'File Explorer' },
            { id: 'task-manager', label: 'Task Manager' },
            { id: 'system-monitor', label: 'System Monitor' },
            { id: 'browser', label: 'Web Browser' }
        ];

        content = `
            <div class="system-center">
                <h3 style="margin-top: 0;">System Center</h3>
                <div class="system-center-grid">
                    <div class="system-card">
                        <h4>Account & Device</h4>
                        <label>User name</label>
                        <input id="sys-user-${windowId}" type="text" value="${profile.username}">
                        <label>Host name</label>
                        <input id="sys-host-${windowId}" type="text" value="${profile.hostname}">
                        <button onclick="saveSystemIdentity('${windowId}')">Save identity</button>
                    </div>
                    <div class="system-card">
                        <h4>Startup Apps</h4>
                        <div class="system-startup-list">
                            ${startupOptions.map(({ id, label }) => `
                                <label><input type="checkbox" id="startup-${windowId}-${id}" ${profile.startupApps.includes(id) ? 'checked' : ''}> ${label}</label>
                            `).join('')}
                        </div>
                        <div class="system-actions">
                            <button onclick="saveStartupApps('${windowId}')">Save startup</button>
                            <button onclick="runStartupApps()">Run now</button>
                        </div>
                    </div>
                    <div class="system-card">
                        <h4>System Status</h4>
                        <div id="system-status-${windowId}" class="system-status"></div>
                        <button onclick="refreshSystemStatus('${windowId}')">Refresh</button>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => refreshSystemStatus(windowId), 0);
    } else if (appName === 'system-monitor') {
        title = "System Monitor";
        content = `
            <div style="padding: 14px; background: #fff; height: 100%; box-sizing: border-box; overflow: auto;">
                <h3 style="margin-top: 0;">Systemüberwachung</h3>
                <div class="system-monitor-grid">
                    <div class="system-stat"><h4>CPU-Auslastung</h4><div id="sys-cpu-${windowId}">0%</div></div>
                    <div class="system-stat"><h4>RAM-Verbrauch</h4><div id="sys-ram-${windowId}">0 MB</div></div>
                    <div class="system-stat"><h4>Offene Fenster</h4><div id="sys-win-${windowId}">0</div></div>
                </div>
                <h4 style="margin-bottom: 8px;">Laufende Anwendungen</h4>
                <div id="sys-apps-${windowId}" style="font-family: monospace; font-size: 13px; white-space: pre-line;"></div>
            </div>
        `;
        setTimeout(() => initSystemMonitor(windowId), 0);
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
                <button onclick="openCalendarEventDialog('${windowId}')" title="Add Event to Selected Day" style="margin-left: auto;">+ New Event</button>
            </div>
            <div class="calendar-grid" id="cal-grid-${windowId}">
                <!-- Days generated by JS -->
            </div>
            <div class="calendar-event-list" id="calendar-event-list-${windowId}">
                <div class="calendar-event-list-header">
                    <span id="cal-selected-day-${windowId}">Select a day to view events</span>
                </div>
                <div id="calendar-event-items-${windowId}"></div>
            </div>
            <div class="calendar-event-dialog hidden" id="calendar-event-dialog-${windowId}">
                <div class="calendar-event-dialog-inner">
                    <h3 id="calendar-event-dialog-title-${windowId}">New Event</h3>
                    <input type="text" id="calendar-event-title-input-${windowId}" placeholder="Event title" maxlength="60">
                    <div class="calendar-event-row">
                        <label>Time:</label>
                        <input type="time" id="calendar-event-time-input-${windowId}">
                    </div>
                    <textarea id="calendar-event-desc-input-${windowId}" placeholder="Description (optional)" rows="3" maxlength="500"></textarea>
                    <div class="calendar-event-dialog-actions">
                        <button onclick="closeCalendarEventDialog('${windowId}')">Cancel</button>
                        <button onclick="saveCalendarEvent('${windowId}')">Save</button>
                    </div>
                </div>
            </div>
        `;
        win.style.width = '500px';
        win.style.height = '600px';
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

        let trackName = "No file selected";
        let src = "";

        if (arg && fileSystem[arg]) {
            trackName = arg;
            src = fileSystem[arg];
        }

        content = `
            <div class="music-player-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; background: #222; color: white; box-sizing: border-box;">
                <div class="music-icon" style="font-size: 64px; margin-bottom: 20px;">🎵</div>
                <div id="music-track-name-${windowId}" style="margin-bottom: 20px; font-weight: bold; text-align: center; word-break: break-all;">${trackName}</div>
                <audio id="music-audio-${windowId}" controls style="width: 100%; margin-bottom: 20px;" src="${src}"></audio>
                <label style="background: #e91e63; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; transition: background 0.3s;">
                    Open Music File
                    <input type="file" id="music-input-${windowId}" accept="audio/*" style="display: none;" onchange="handleMusicFile('${windowId}')">
                </label>
            </div>
        `;

        if (src) {
             setTimeout(() => {
                 const audio = document.getElementById(`music-audio-${windowId}`);
                 if(audio) audio.play().catch(e => console.log('Autoplay blocked:', e));
             }, 100);
        }
    } else if (appName === 'video-player') {
        title = "Video Player";
        win.classList.add('video-player-window');

        let videoName = "No video";
        let src = "";

        if (arg && fileSystem[arg]) {
            videoName = arg;
            src = fileSystem[arg];
        }

        content = `
            <div class="video-player-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 0; background: #000; color: white; box-sizing: border-box; overflow: hidden;">
                <video id="video-player-${windowId}" controls style="width: 100%; height: 100%; max-height: calc(100% - 40px); object-fit: contain;" src="${src}"></video>
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; width: 100%; background: #222;">
                    <label style="background: #673ab7; color: white; padding: 5px 15px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 10px;">
                        Open Video
                        <input type="file" id="video-input-${windowId}" accept="video/*" style="display: none;" onchange="handleVideoFile('${windowId}')">
                    </label>
                    <div id="video-name-${windowId}" style="font-size: 12px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${videoName}</div>
                </div>
            </div>
        `;

        if (src) {
             setTimeout(() => {
                 const video = document.getElementById(`video-player-${windowId}`);
                 if(video) video.play().catch(e => console.log('Autoplay blocked:', e));
             }, 100);
        }
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
    } else if (appName === 'sudoku') {
        title = "Sudoku";
        win.classList.add('sudoku-window');
        // Initial Sudoku Layout
        content = `
            <div class="sudoku-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                 <div style="font-weight: bold; font-size: 16px;">Sudoku</div>
                 <div style="display: flex; gap: 5px;">
                     <button onclick="initSudoku('${windowId}', 'easy')" style="padding: 2px 8px; cursor: pointer;">Easy</button>
                     <button onclick="initSudoku('${windowId}', 'medium')" style="padding: 2px 8px; cursor: pointer;">Medium</button>
                     <button onclick="initSudoku('${windowId}', 'hard')" style="padding: 2px 8px; cursor: pointer;">Hard</button>
                 </div>
            </div>
            <div class="sudoku-container" style="display: flex; flex-direction: column; align-items: center;">
                <div class="sudoku-grid" id="sudoku-grid-${windowId}">
                    <!-- Grid generated by JS -->
                </div>
                <div class="sudoku-controls" style="margin-top: 10px; display: flex; gap: 10px;">
                    <button onclick="checkSudokuWin('${windowId}', true)" style="padding: 5px 15px; cursor: pointer; font-weight: bold;">Check</button>
                    <button onclick="initSudoku('${windowId}')" style="padding: 5px 15px; cursor: pointer;">Restart</button>
                </div>
                <div id="sudoku-status-${windowId}" style="margin-top: 5px; height: 20px; color: #333; font-weight: bold;"></div>
            </div>
        `;
        // Make window focusable for keyboard input
        win.tabIndex = 0;
        win.addEventListener('keydown', (e) => handleSudokuInput(windowId, e));
        setTimeout(() => initSudoku(windowId), 0);
    } else if (appName === 'weather') {
        title = "Weather";
        win.classList.add('weather-window');
        content = `
            <div class="weather-search">
                <input type="text" id="weather-input-${windowId}" placeholder="Enter city..." onkeydown="if(event.key === 'Enter') searchWeather('${windowId}', this.value)">
                <button onclick="searchWeather('${windowId}', document.getElementById('weather-input-${windowId}').value)">Search</button>
            </div>
            <div id="weather-content-${windowId}" style="flex-grow: 1; display: flex; flex-direction: column; width: 100%;">
                <!-- Weather content -->
            </div>
        `;
        setTimeout(() => initWeather(windowId), 0);
    } else if (appName === 'pomodoro') {
        title = "Pomodoro Timer";
        win.classList.add('pomodoro-window');
        win.style.width = '360px';
        win.style.height = '360px';
        content = `
            <div class="pomodoro-container">
                <div class="pomodoro-phase" id="pomodoro-phase-${windowId}">Focus</div>
                <div class="pomodoro-time" id="pomodoro-time-${windowId}">25:00</div>
                <div class="pomodoro-controls">
                    <button onclick="togglePomodoro('${windowId}')" id="pomodoro-toggle-${windowId}">Start</button>
                    <button onclick="resetPomodoro('${windowId}')">Reset</button>
                    <button onclick="switchPomodoroMode('${windowId}')" id="pomodoro-mode-${windowId}">Break</button>
                </div>
                <div class="pomodoro-presets">
                    <button onclick="setPomodoroPreset('${windowId}', 25, 5)">25/5</button>
                    <button onclick="setPomodoroPreset('${windowId}', 50, 10)">50/10</button>
                    <button onclick="setPomodoroPreset('${windowId}', 15, 3)">15/3</button>
                </div>
            </div>
        `;
        setTimeout(() => initPomodoro(windowId), 0);
    } else if (appName === 'voice-recorder') {
        title = "Voice Recorder";
        win.classList.add('voice-recorder-window');
        win.style.width = '400px';
        win.style.height = '500px';

        content = `
            <div class="vr-container">
                <canvas id="vr-visualizer-${windowId}" class="vr-visualizer" width="380" height="100"></canvas>
                <div class="vr-time-display" id="vr-timer-${windowId}">00:00</div>
                <div class="vr-controls">
                    <button class="vr-btn record" id="vr-record-btn-${windowId}" onclick="startRecording('${windowId}')" title="Record">
                        <div class="record-icon"></div>
                    </button>
                    <button class="vr-btn stop" id="vr-stop-btn-${windowId}" onclick="stopRecording('${windowId}')" disabled title="Stop">
                        <div class="stop-icon"></div>
                    </button>
                </div>
                <div class="vr-list-container">
                    <h3>Recordings</h3>
                    <div id="vr-list-${windowId}" class="vr-list">
                        <div style="text-align: center; color: #888; padding: 10px;">No recordings yet</div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initVoiceRecorder(windowId), 0);
    } else if (appName === 'markdown-editor') {
        title = "Markdown Editor";
        win.classList.add('markdown-editor-window');
        win.style.width = '800px';
        win.style.height = '500px';

        content = `
            <div class="markdown-editor-toolbar">
                <button onclick="saveMarkdown('${windowId}')">Save</button>
                <button onclick="downloadMarkdown('${windowId}')">Download</button>
                <label class="file-upload">
                    Open <input type="file" onchange="openMarkdownFile('${windowId}', this)" accept=".md,.txt">
                </label>
            </div>
            <div class="markdown-editor-container">
                <textarea id="markdown-editor-${windowId}" class="markdown-editor-pane" oninput="updateMarkdownPreview('${windowId}')" placeholder="# Start typing markdown..."></textarea>
                <div id="markdown-preview-${windowId}" class="markdown-preview-pane"></div>
            </div>
        `;
        setTimeout(() => updateMarkdownPreview(windowId), 0);
    } else if (appName === 'code-editor') {
        title = "Code Editor";
        win.classList.add('code-editor-window');
        win.style.width = '800px';
        win.style.height = '600px';

        content = `
            <div class="code-editor-toolbar">
                <button onclick="saveCode('${windowId}')">Save</button>
                <button onclick="downloadCode('${windowId}')">Download</button>
                <label class="file-upload">
                    Open <input type="file" onchange="openCodeFile('${windowId}', this)" accept=".js,.html,.css,.py,.json,.txt,.md">
                </label>
            </div>
            <div class="code-editor-container">
                <div id="code-gutter-${windowId}" class="code-gutter">1</div>
                <textarea id="code-area-${windowId}" class="code-textarea" oninput="updateLineNumbers('${windowId}')" onkeydown="handleCodeInput('${windowId}', event)" spellcheck="false" placeholder="// Start coding..."></textarea>
            </div>
        `;
        // Use timeout to allow DOM update
        setTimeout(() => {
            const gutter = document.getElementById(`code-gutter-${windowId}`);
            const textarea = document.getElementById(`code-area-${windowId}`);
            if (gutter && textarea) {
                // Sync scroll
                textarea.addEventListener('scroll', () => {
                    gutter.scrollTop = textarea.scrollTop;
                });
            }
        }, 0);
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
    } else if (appName === 'pdf-viewer') {
        title = "PDF Viewer";
        win.classList.add('pdf-viewer-window');
        win.style.width = '800px';
        win.style.height = '600px';

        let src = "";
        let fileName = "No file selected";

        if (arg && fileSystem[arg]) {
            src = fileSystem[arg];
            fileName = arg;
        }

        content = `
            <div class="pdf-toolbar" style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 12px; padding: 2px 8px; cursor: pointer; border: 1px solid #999; background: #ddd; display: inline-block;">
                    Open PDF <input type="file" id="pdf-input-${windowId}" accept="application/pdf" style="display: none;" onchange="handlePdfFile('${windowId}')">
                </label>
                <div id="pdf-name-${windowId}" style="font-size: 12px; color: #555;">${fileName}</div>
            </div>
            <div id="pdf-container-${windowId}" style="flex-grow: 1; height: 100%; background: #525659; display: flex; justify-content: center; align-items: center;">
                ${src ? `<iframe src="${src}" style="width: 100%; height: 100%; border: none;"></iframe>` : '<div style="color: #ccc;">Open a PDF file to view</div>'}
            </div>
        `;
    } else if (appName === 'piano') {
        title = "Piano";
        win.classList.add('piano-window');
        win.style.width = '600px';
        win.style.height = '350px';

        content = `
            <div class="piano-container" id="piano-container-${windowId}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #222; padding: 10px;">
                <div class="piano-keys" id="piano-keys-${windowId}" style="display: flex; position: relative; height: 200px; margin-bottom: 20px;">
                    <!-- Keys generated by JS -->
                </div>
                <div class="piano-controls" style="color: white; text-align: center;">
                    <label>Volume: <input type="range" id="piano-volume-${windowId}" min="0" max="1" step="0.1" value="0.5" style="vertical-align: middle;"></label>
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">Use keyboard: A-K (White), W-U (Black)</div>
                </div>
            </div>
        `;
        setTimeout(() => initPiano(windowId), 0);
    } else if (appName === 'spreadsheet') {
        title = "Spreadsheet";
        win.classList.add('spreadsheet-window');
        win.style.width = '800px';
        win.style.height = '600px';

        content = `
            <div class="spreadsheet-toolbar">
                <button onclick="saveSpreadsheet('${windowId}')">Save</button>
                <label class="file-upload">
                    Load <input type="file" onchange="loadSpreadsheet('${windowId}', this)" accept=".json,.csv">
                </label>
            </div>
            <div class="spreadsheet-formula-bar">
                <span>fx</span>
                <input type="text" id="spreadsheet-formula-${windowId}" disabled placeholder="Select a cell...">
            </div>
            <div class="spreadsheet-grid-container" id="spreadsheet-grid-container-${windowId}">
                <!-- Grid generated by JS -->
            </div>
        `;
        setTimeout(() => initSpreadsheet(windowId), 0);
    } else if (appName === 'image-viewer') {
        title = "Image Viewer";
        win.classList.add('image-viewer-window');

        let src = "";
        let fileName = "No image selected";

        if (arg && fileSystem[arg]) {
            src = fileSystem[arg];
            fileName = arg;
        }

        // Safe filename display
        const safeFileName = fileName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        content = `
            <div style="display: flex; flex-direction: column; height: 100%; background: #222;">
                <div style="padding: 5px; background: #333; color: white; border-bottom: 1px solid #444; font-size: 12px; display: flex; justify-content: space-between;">
                    <span>${safeFileName}</span>
                </div>
                <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 10px;">
                    ${src ? `<img src="${src}" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 0 10px rgba(0,0,0,0.5);">` : '<div style="color: #888;">No image to display</div>'}
                </div>
            </div>
        `;
    } else if (appName === 'email') {
        title = "Email";
        win.classList.add('email-window');
        win.style.width = '700px';
        win.style.height = '500px';

        content = `
            <div class="email-container" id="email-container-${windowId}">
                <!-- App rendered by JS -->
            </div>
        `;
        setTimeout(() => initEmail(windowId), 0);
    } else if (appName === 'chat') {
        title = "Chat";
        win.classList.add('chat-window');
        win.style.width = '600px';
        win.style.height = '450px';

        content = `
            <div class="chat-container" id="chat-container-${windowId}">
                <!-- App rendered by JS -->
            </div>
        `;
        setTimeout(() => initChat(windowId), 0);
    } else if (appName === 'photo-gallery') {
        title = "Photo Gallery";
        win.classList.add('gallery-window');
        win.style.width = '800px';
        win.style.height = '600px';

        content = `
            <div class="gallery-container" id="gallery-container-${windowId}">
                <!-- App rendered by JS -->
            </div>
        `;
        setTimeout(() => initGallery(windowId), 0);
    } else if (appName === 'printer') {
        title = "Printer Settings";
        win.classList.add('printer-window');
        win.style.width = '500px';
        win.style.height = '400px';

        content = `
            <div class="printer-container" id="printer-container-${windowId}">
                <!-- App rendered by JS -->
            </div>
        `;
        setTimeout(() => initPrinter(windowId), 0);
    } else if (appName === 'recyclebin') {
        title = "Recycle Bin";
        win.classList.add('recyclebin-window');
        win.style.width = '600px';
        win.style.height = '450px';

        content = `
            <div class="recyclebin-container" id="recyclebin-container-${windowId}">
            </div>
        `;
        setTimeout(() => initRecycleBin(windowId), 0);
    } else if (appName === 'wine') {
        title = "Wine";
        win.style.width = '900px';
        win.style.height = '650px';
        win.style.minWidth = '600px';
        win.style.minHeight = '400px';
        content = `
            <div class="wine-container" style="width:100%;height:100%;display:flex;flex-direction:column;">
                <iframe src="boxedwine/wine-runner.html" id="wine-iframe-${windowId}"
                    style="width:100%;height:100%;border:none;background:#1a1a2e;"
                    allow="autoplay; clipboard-write">
                </iframe>
            </div>
        `;
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="startDrag(event, '${windowId}')" ontouchstart="startDrag(event, '${windowId}')">
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
        <div class="resize-handle resize-r" onmousedown="startResize(event, '${windowId}', 'r')" ontouchstart="startResize(event, '${windowId}', 'r')"></div>
        <div class="resize-handle resize-b" onmousedown="startResize(event, '${windowId}', 'b')" ontouchstart="startResize(event, '${windowId}', 'b')"></div>
        <div class="resize-handle resize-br" onmousedown="startResize(event, '${windowId}', 'br')" ontouchstart="startResize(event, '${windowId}', 'br')"></div>
    `;

    windowArea.appendChild(win);
    focusWindow(windowId);

    // Trigger opening animation
    requestAnimationFrame(() => {
        win.classList.add('window-opening');
        win.addEventListener('animationend', () => {
            win.classList.remove('window-opening');
        }, { once: true });
    });

    // Show launch toast for desktop-launched apps
    const app = appData[appName];
    if (app) {
        showToast(app.name, 'Wird gestartet...', app.icon);
    }

    // Add to taskbar
    const taskbarApps = document.getElementById('taskbar-apps');
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item active';
    taskbarItem.id = `taskbar-${windowId}`;

    if (app) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'taskbar-icon';
        iconSpan.textContent = app.icon;
        taskbarItem.appendChild(iconSpan);
    }

    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    taskbarItem.appendChild(titleSpan);

    // Add preview tooltip
    const preview = document.createElement('div');
    preview.className = 'taskbar-preview';
    preview.innerHTML = `
        <div class="taskbar-preview-title">${title}</div>
        <div class="taskbar-preview-status">App läuft</div>
    `;
    taskbarItem.appendChild(preview);

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

    if (appName === 'wine') {
        const iframe = document.getElementById(`wine-iframe-${windowId}`);
        if (iframe) {
            iframe.addEventListener('load', function onLoad() {
                const handler = function(e) {
                    if (e.source === iframe.contentWindow && e.data && e.data.type === 'wine-ready') {
                        window.removeEventListener('message', handler);
                        if (arg && wineExeFiles[arg]) {
                            iframe.contentWindow.postMessage({
                                type: 'run-exe-file',
                                data: wineExeFiles[arg],
                                filename: arg.split('/').pop() || arg
                            }, '*');
                        }
                    }
                };
                window.addEventListener('message', handler);
            });
        }
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
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const val = this.value;
                const tokens = val.split(' ');
                const lastToken = tokens[tokens.length - 1];

                if (lastToken) {
                    const supportedCommands = ['ls', 'cd', 'mkdir', 'rmdir', 'pwd', 'touch', 'rm', 'cat', 'open', 'whoami', 'history', 'date', 'clear', 'help', 'reboot', 'cp', 'mv', 'grep', 'head', 'tail', 'wc'];

                    const cwd = terminalStates[windowId].cwd;
                    let prefix = cwd === '/' ? '' : cwd.substring(1) + '/';

                    const files = Object.keys(fileSystem)
                        .filter(k => k.startsWith(prefix))
                        .map(k => {
                            const rel = k.substring(prefix.length);
                            if (rel.indexOf('/') === -1) return rel;
                            return rel.split('/')[0] + '/';
                        });
                    const uniqueFiles = [...new Set(files)];

                    const candidates = [];
                    // Always suggest commands if first token, but also allow files as first token (e.g. ./script)
                    if (tokens.length === 1) {
                         candidates.push(...supportedCommands.filter(c => c.startsWith(lastToken)));
                    }
                    candidates.push(...uniqueFiles.filter(f => f.startsWith(lastToken)));

                    const uniqueCandidates = [...new Set(candidates)];

                    if (uniqueCandidates.length === 1) {
                        tokens[tokens.length - 1] = uniqueCandidates[0];
                        this.value = tokens.join(' ');
                    }
                }
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
    const win = document.getElementById(windowId);
    if (!win) return;

    // Prevent double-close
    if (win.classList.contains('window-closing')) return;

    // Play closing animation
    win.classList.add('window-closing');
    win.addEventListener('animationend', () => {
        // Perform actual cleanup
        performWindowCleanup(windowId);
    }, { once: true });
}

function performWindowCleanup(windowId) {
    // Cleanup Snake game if active
    if (snakeGames[windowId]) {
        clearInterval(snakeGames[windowId].interval);
        delete snakeGames[windowId];
    }

    // Cleanup Tic Tac Toe game if active
    if (tictactoeGames[windowId]) {
        delete tictactoeGames[windowId];
    }

    if (systemMonitorStates[windowId]) {
        clearInterval(systemMonitorStates[windowId]);
        delete systemMonitorStates[windowId];
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
    if (sudokuGames[windowId]) {
        delete sudokuGames[windowId];
    }

    // Cleanup Weather
    if (weatherStates[windowId]) {
        delete weatherStates[windowId];
    }

    // Cleanup Pomodoro
    if (pomodoroStates[windowId]) {
        clearInterval(pomodoroStates[windowId].interval);
        delete pomodoroStates[windowId];
    }

    // Cleanup Voice Recorder
    if (voiceRecorderStates[windowId]) {
        const state = voiceRecorderStates[windowId];
        if (state.isRecording) {
            stopRecording(windowId);
        }
        if (state.currentPlaybackAudio) {
            state.currentPlaybackAudio.pause();
            state.currentPlaybackAudio = null;
        }
        if (state.audioContext) {
            state.audioContext.close();
        }
        state.recordings.forEach(rec => URL.revokeObjectURL(rec.url));
        delete voiceRecorderStates[windowId];
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

    // Cleanup Spreadsheet
    if (spreadsheetStates[windowId]) {
        delete spreadsheetStates[windowId];
    }

    // Cleanup Gallery
    if (galleryStates[windowId]) {
        if (galleryStates[windowId].slideshowInterval) {
            clearInterval(galleryStates[windowId].slideshowInterval);
        }
        delete galleryStates[windowId];
    }

    // Cleanup Email
    if (emailStates[windowId]) {
        delete emailStates[windowId];
    }

    // Cleanup Chat
    if (chatStates[windowId]) {
        delete chatStates[windowId];
    }

    // Cleanup Printer Settings
    if (printerStates[windowId]) {
        delete printerStates[windowId];
    }

    // Cleanup Recycle Bin
    if (recycleBinStates[windowId]) {
        delete recycleBinStates[windowId];
    }

    const winRef = document.getElementById(windowId);
    if (winRef) {
        // Cleanup Music Player
        if (winRef.querySelector('audio')) {
            const audio = winRef.querySelector('audio');
            if (audio.src && audio.src.startsWith('blob:')) {
                URL.revokeObjectURL(audio.src);
            }
        }

        // Cleanup Video Player
        if (winRef.querySelector('video')) {
            const video = winRef.querySelector('video');
            if (video.src && video.src.startsWith('blob:')) {
                URL.revokeObjectURL(video.src);
            }
        }

        winRef.remove();
    }
    const taskbarItem = document.getElementById(`taskbar-${windowId}`);
    if (taskbarItem) {
        taskbarItem.remove();
    }

    // Save window states after close
    saveWindowStates();
}

// Toast Notification
function showToast(title, message, icon = 'ℹ️') {
    if (typeof showNotification === 'function') {
        showNotification(title, message);
        return;
    }
    const container = document.getElementById('notification-area');
    if (!container) {
        const area = document.createElement('div');
        area.id = 'notification-area';
        document.body.appendChild(area);
    }
    const notifArea = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="notification-title">${icon} ${title}</div>
        <div class="notification-message">${message}</div>
    `;
    notifArea.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Scheduled Notifications System
let scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');

function scheduleNotification(title, message, time, icon = '🔔') {
    const id = Date.now().toString();
    scheduledNotifications.push({ id, title, message, time, icon });
    saveScheduledNotifications();
    updateScheduleBadge();
    return id;
}

function saveScheduledNotifications() {
    localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
}

function updateScheduleBadge() {
    const badge = document.getElementById('schedule-badge');
    if (badge) {
        const activeCount = scheduledNotifications.filter(n => n.time > Date.now()).length;
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
    }
}

function checkScheduledNotifications() {
    const now = Date.now();
    const due = scheduledNotifications.filter(n => n.time <= now);
    due.forEach(n => {
        showToast(n.title, n.message, n.icon);
    });
    scheduledNotifications = scheduledNotifications.filter(n => n.time > now);
    saveScheduledNotifications();
    updateScheduleBadge();
}

function cancelScheduledNotification(id) {
    scheduledNotifications = scheduledNotifications.filter(n => n.id !== id);
    saveScheduledNotifications();
    updateScheduleBadge();
}

// Check for due notifications every 30 seconds
setInterval(checkScheduledNotifications, 30000);
checkScheduledNotifications();

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

// Snap (Aero Snap) state
const SNAP_THRESHOLD = 24;
let activeSnapZone = null;
let snapPreview = null;

function getPointer(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function ensureSnapPreview() {
    if (snapPreview) return snapPreview;
    snapPreview = document.createElement('div');
    snapPreview.id = 'snap-preview';
    snapPreview.className = 'snap-preview';
    document.body.appendChild(snapPreview);
    return snapPreview;
}

function getSnapZone(x, y) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (y <= SNAP_THRESHOLD) return 'top';
    if (x <= SNAP_THRESHOLD) return 'left';
    if (x >= vw - SNAP_THRESHOLD) return 'right';
    return null;
}

function applySnap(windowId, zone) {
    const win = document.getElementById(windowId);
    if (!win) return;

    const vw = window.innerWidth;
    const taskbarH = 40;
    const vh = window.innerHeight - taskbarH;

    if (!win.dataset.snapPrevLeft) {
        win.dataset.snapPrevLeft = win.style.left || '';
        win.dataset.snapPrevTop = win.style.top || '';
        win.dataset.snapPrevWidth = win.style.width || '';
        win.dataset.snapPrevHeight = win.style.height || '';
    }

    win.classList.remove('maximized', 'snapped-left', 'snapped-right');
    win.style.top = '0px';
    win.style.height = vh + 'px';

    if (zone === 'top') {
        win.classList.add('maximized');
        win.style.left = '';
        win.style.top = '';
        win.style.width = '';
        win.style.height = '';
    } else if (zone === 'left') {
        win.classList.add('snapped-left');
        win.style.left = '0px';
        win.style.width = (vw / 2) + 'px';
    } else if (zone === 'right') {
        win.classList.add('snapped-right');
        win.style.left = (vw / 2) + 'px';
        win.style.width = (vw / 2) + 'px';
    }
    win.dataset.snapZone = zone;
}

function clearSnapZone(win) {
    if (!win || !win.dataset.snapZone) return;
    win.classList.remove('snapped-left', 'snapped-right');
    win.style.left = win.dataset.snapPrevLeft || '';
    win.style.top = win.dataset.snapPrevTop || '';
    win.style.width = win.dataset.snapPrevWidth || '';
    win.style.height = win.dataset.snapPrevHeight || '';
    delete win.dataset.snapZone;
    delete win.dataset.snapPrevLeft;
    delete win.dataset.snapPrevTop;
    delete win.dataset.snapPrevWidth;
    delete win.dataset.snapPrevHeight;
}

function showSnapPreview(zone) {
    const preview = ensureSnapPreview();
    const vw = window.innerWidth;
    const taskbarH = 40;
    const vh = window.innerHeight - taskbarH;
    preview.style.display = 'block';
    if (zone === 'top') {
        preview.style.left = '0px';
        preview.style.top = '0px';
        preview.style.width = vw + 'px';
        preview.style.height = vh + 'px';
    } else if (zone === 'left') {
        preview.style.left = '0px';
        preview.style.top = '0px';
        preview.style.width = (vw / 2) + 'px';
        preview.style.height = vh + 'px';
    } else if (zone === 'right') {
        preview.style.left = (vw / 2) + 'px';
        preview.style.top = '0px';
        preview.style.width = (vw / 2) + 'px';
        preview.style.height = vh + 'px';
    } else {
        preview.style.display = 'none';
    }
}

function hideSnapPreview() {
    if (snapPreview) snapPreview.style.display = 'none';
}

function startDrag(e, windowId) {
    if (e.target.closest('.window-button')) return;
    if (e.cancelable) e.preventDefault();
    isDragging = true;
    currentWindow = document.getElementById(windowId);
    focusWindow(windowId);

    const rect = currentWindow.getBoundingClientRect();
    const pt = getPointer(e);
    offset.x = pt.x - rect.left;
    offset.y = pt.y - rect.top;

    // If currently snapped, restore geometry as we begin dragging
    if (currentWindow.dataset.snapZone) {
        clearSnapZone(currentWindow);
    }

    // Dragging a maximized window restores it to a centered normal size under the cursor
    if (currentWindow.classList.contains('maximized')) {
        const vw = window.innerWidth;
        const newW = Math.min(rect.width, vw * 0.7);
        const newH = rect.height;
        currentWindow.classList.remove('maximized');
        currentWindow.style.width = newW + 'px';
        currentWindow.style.height = newH + 'px';
        currentWindow.style.left = (pt.x - newW / 2) + 'px';
        currentWindow.style.top = '0px';
        const newRect = currentWindow.getBoundingClientRect();
        offset.x = pt.x - newRect.left;
        offset.y = pt.y - newRect.top;
        if (currentWindow.dataset.prevWidth) delete currentWindow.dataset.prevWidth;
        if (currentWindow.dataset.prevHeight) delete currentWindow.dataset.prevHeight;
        if (currentWindow.dataset.prevLeft) delete currentWindow.dataset.prevLeft;
        if (currentWindow.dataset.prevTop) delete currentWindow.dataset.prevTop;
    }

    activeSnapZone = null;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchcancel', stopDrag);
}

function drag(e) {
    if (!isDragging || !currentWindow) return;
    if (e.cancelable) e.preventDefault();
    const pt = getPointer(e);
    const x = pt.x - offset.x;
    const y = pt.y - offset.y;

    // Aero Snap edge detection (only while actively dragging by the title bar)
    const zone = getSnapZone(pt.x, pt.y);
    if (zone !== activeSnapZone) {
        activeSnapZone = zone;
        if (zone) showSnapPreview(zone); else hideSnapPreview();
    }

    currentWindow.style.left = `${x}px`;
    currentWindow.style.top = `${y}px`;
}

function stopDrag() {
    if (currentWindow) {
        if (currentWindow.dataset.noteId) {
            updateStickyNotePosition(currentWindow.dataset.noteId, currentWindow.style.left, currentWindow.style.top);
        }
        // Apply snap on release
        if (activeSnapZone) {
            applySnap(currentWindow.id, activeSnapZone);
        }
    }
    hideSnapPreview();
    isDragging = false;
    currentWindow = null;
    activeSnapZone = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
    document.removeEventListener('touchcancel', stopDrag);
}

// ===================== WINDOW MANAGEMENT HELPERS =====================

function isTypingInField() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

function getVisibleWindows() {
    return Array.from(document.querySelectorAll('.window'))
        .filter(w => w.style.display !== 'none' && !w.classList.contains('window-closing'));
}

function getFocusedWindow() {
    const visible = getVisibleWindows();
    if (!visible.length) return null;
    return visible.reduce((top, w) =>
        (parseInt(w.style.zIndex || 0) > parseInt(top.style.zIndex || 0)) ? w : top
    );
}

let altTabWindowList = null;

function altTabNext() {
    const visible = getVisibleWindows();
    if (visible.length === 0) return;

    visible.sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));

    if (!altTabWindowList) {
        altTabWindowList = visible.slice();
    }

    const focused = getFocusedWindow();
    const currentIdx = altTabWindowList.indexOf(focused);
    const nextIdx = (currentIdx + 1) % altTabWindowList.length;
    if (altTabWindowList[nextIdx]) focusWindow(altTabWindowList[nextIdx].id);
}

// ===================== GLOBAL KEYBOARD SHORTCUTS =====================

document.addEventListener('keydown', (e) => {
    // Escape closes overlays (start menu, context menus, power menu) globally
    if (e.key === 'Escape') {
        const startMenu = document.getElementById('start-menu');
        if (startMenu && startMenu.style.display === 'block') {
            startMenu.style.display = 'none';
            document.getElementById('start-button')?.classList.remove('active');
        }
        hideAllContextMenus();
        const powerMenu = document.getElementById('power-menu');
        if (powerMenu && powerMenu.style.display === 'flex') powerMenu.style.display = 'none';
        hideSnapPreview();
        altTabWindowList = null;
        return;
    }

    // Alt+Tab (also Ctrl+Alt+Tab for reliability): cycle through open windows
    if ((e.altKey && e.key === 'Tab') || (e.ctrlKey && e.altKey && e.key === 'Tab')) {
        // Ignore if typing only when it would hijack text entry — but allow globally for app switching
        e.preventDefault();
        altTabNext();
        return;
    }

    // Reset the Alt-Tab session when Alt is released
    if (e.key === 'Alt' && !e.altKey) {
        altTabWindowList = null;
    }

    // Show Desktop: Win+D / Ctrl+Win+D (best-effort). Also accept Ctrl+Shift+D fallback.
    if ((e.metaKey && (e.key === 'd' || e.key === 'D')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D'))) {
        if (isTypingInField()) return;
        e.preventDefault();
        toggleDesktop();
        return;
    }

    // Close focused window: Alt+F4 (best-effort, OS may swallow) or Ctrl+Alt+W
    if ((e.altKey && e.key === 'F4') || (e.ctrlKey && e.altKey && (e.key === 'w' || e.key === 'W'))) {
        e.preventDefault();
        const focused = getFocusedWindow();
        if (focused) closeWindow(focused.id);
        return;
    }

    // Minimize / maximize / restore focused window
    if (e.ctrlKey && e.altKey && (e.key === 'm' || e.key === 'M')) {
        if (isTypingInField()) return;
        e.preventDefault();
        const focused = getFocusedWindow();
        if (focused) minimizeWindow(focused.id);
        return;
    }
    if (e.ctrlKey && e.altKey && (e.key === 'x' || e.key === 'X')) {
        if (isTypingInField()) return;
        e.preventDefault();
        const focused = getFocusedWindow();
        if (focused) maximizeWindow(focused.id);
        return;
    }
});

// End the Alt-Tab session on keyup of Alt/Tab
document.addEventListener('keyup', (e) => {
    if (e.key === 'Tab' && !e.altKey) altTabWindowList = null;
});
const fileSystem = {
    'readme.txt': 'Welcome to WebOS! This is a simple browser-based OS.',
    'todo.list': '- Buy milk\n- Walk the dog\n- Code more',
};
window.fileSystem = fileSystem;
const wineExeFiles = {}; // key -> ArrayBuffer for .exe files
window.wineExeFiles = wineExeFiles;

// Terminal State
const terminalStates = {};
const systemMonitorStates = {};

// Sticky Notes State
let stickyNotes = {};

function saveStickyNotesToStorage(notify = false) {
    localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
    if (notify) {
        showNotification('Sticky Notes', 'Notes saved successfully.');
    }
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

function saveSystemIdentity(windowId) {
    const usernameInput = document.getElementById(`sys-user-${windowId}`);
    const hostnameInput = document.getElementById(`sys-host-${windowId}`);
    if (!usernameInput || !hostnameInput) return;

    const profile = getSystemProfile();
    profile.username = usernameInput.value.trim() || defaultSystemProfile.username;
    profile.hostname = hostnameInput.value.trim() || defaultSystemProfile.hostname;
    saveSystemProfile(profile);
    showNotification('System Center', 'Identity updated.');
}

function saveStartupApps(windowId) {
    const profile = getSystemProfile();
    const apps = ['terminal', 'file-explorer', 'task-manager', 'system-monitor', 'browser'];
    profile.startupApps = apps.filter(app => {
        const checkbox = document.getElementById(`startup-${windowId}-${app}`);
        return checkbox && checkbox.checked;
    });

    saveSystemProfile(profile);
    showNotification('System Center', `Saved ${profile.startupApps.length} startup app(s).`);
}

function refreshSystemStatus(windowId) {
    const status = document.getElementById(`system-status-${windowId}`);
    if (!status) return;

    const profile = getSystemProfile();
    const storage = getStorageStats();
    const uptimeMs = Date.now() - sessionStartTime;
    const uptimeMin = Math.floor(uptimeMs / 60000);

    status.innerHTML = `
        <div><strong>User:</strong> ${profile.username}</div>
        <div><strong>Host:</strong> ${profile.hostname}</div>
        <div><strong>Uptime:</strong> ${uptimeMin} min</div>
        <div><strong>Files:</strong> ${storage.fileCount} | <strong>Folders:</strong> ${storage.directoryCount}</div>
        <div><strong>Stored data:</strong> ${storage.totalBytes} bytes</div>
        <div><strong>Sticky notes:</strong> ${storage.noteCount}</div>
        <div><strong>Open windows:</strong> ${document.querySelectorAll('.window').length}</div>
    `;
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
        response = 'Available commands: help, date, clear, echo [text], ls, cat [file], open [file], touch [file], rm [file], mkdir [dir], rmdir [dir], cd [dir], cp [src] [dst], mv [src] [dst], grep [pattern] [file], head [-n lines] [file], tail [-n lines] [file], wc [file], about, reboot, whoami, pwd, history [count], history -c, sysinfo, startup [list|add|remove|run] [app]';
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
                } else if (fsKey.endsWith('.exe')) {
                    openApp('wine', fsKey);
                    response = `Opening ${fsKey} in Wine...`;
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
        response = getSystemProfile().username;
    } else if (command === 'sysinfo') {
        const profile = getSystemProfile();
        const storage = getStorageStats();
        const uptimeMin = Math.floor((Date.now() - sessionStartTime) / 60000);
        response = `WebOS\nUser: ${profile.username}\nHost: ${profile.hostname}\nUptime: ${uptimeMin} min\nFiles: ${storage.fileCount}\nFolders: ${storage.directoryCount}\nData: ${storage.totalBytes} bytes\nWindows: ${document.querySelectorAll('.window').length}`;
    } else if (command === 'startup') {
        const profile = getSystemProfile();
        const validApps = ['terminal', 'file-explorer', 'task-manager', 'system-monitor', 'browser'];
        const action = args[0] || 'list';
        const app = args[1];

        if (action === 'list') {
            response = `Startup apps: ${profile.startupApps.join(', ') || '(none)'}`;
        } else if (action === 'add') {
            if (!app || !validApps.includes(app)) {
                response = `Usage: startup add [${validApps.join('|')}]`;
            } else if (profile.startupApps.includes(app)) {
                response = `${app} is already in startup.`;
            } else {
                profile.startupApps.push(app);
                saveSystemProfile(profile);
                response = `Added ${app} to startup.`;
            }
        } else if (action === 'remove') {
            if (!app) {
                response = 'Usage: startup remove [app]';
            } else {
                profile.startupApps = profile.startupApps.filter(a => a !== app);
                saveSystemProfile(profile);
                response = `Removed ${app} from startup.`;
            }
        } else if (action === 'run') {
            runStartupApps();
            response = 'Starting configured startup apps...';
        } else {
            response = 'Usage: startup [list|add|remove|run] [app]';
        }
    } else if (command === 'pwd') {
        response = cwd;
    } else if (command === 'history') {
        if (!window.terminalHistory) window.terminalHistory = [];

        if (args[0] === '-c') {
            window.terminalHistory = [];
            response = 'History cleared.';
        } else {
            let commandList = window.terminalHistory;

            if (args[0] !== undefined) {
                const count = parseInt(args[0], 10);
                if (Number.isNaN(count) || count < 1) {
                    response = 'Usage: history [count] | history -c';
                } else {
                    commandList = window.terminalHistory.slice(-count);
                }
            }

            if (!response) {
                response = commandList
                    .map((entry, index) => {
                        const commandIndex = window.terminalHistory.length - commandList.length + index + 1;
                        return `${commandIndex}  ${entry}`;
                    })
                    .join('\n');
            }
        }
    } else if (command === 'grep') {
        if (args.length < 2) {
            response = 'Usage: grep [pattern] [filename]';
        } else {
            const pattern = args[0];
            const filename = args[1];
            const targetPath = resolvePath(cwd, filename);
            const fsKey = targetPath.substring(1);

            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                const content = fileSystem[fsKey];
                const lines = content.split('\n');
                const matchingLines = lines.filter(line => line.includes(pattern));
                response = matchingLines.join('\n');
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'head') {
        let n = 10;
        let filename;
        if (args.length === 1) {
            filename = args[0];
        } else if (args.length >= 3 && args[0] === '-n') {
            n = parseInt(args[1]);
            filename = args[2];
        } else {
            response = 'Usage: head [-n lines] [filename]';
        }

        if (filename && !response) {
            const targetPath = resolvePath(cwd, filename);
            const fsKey = targetPath.substring(1);
            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                const content = fileSystem[fsKey];
                const lines = content.split('\n');
                response = lines.slice(0, n).join('\n');
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'tail') {
        let n = 10;
        let filename;
        if (args.length === 1) {
            filename = args[0];
        } else if (args.length >= 3 && args[0] === '-n') {
            n = parseInt(args[1]);
            filename = args[2];
        } else {
            response = 'Usage: tail [-n lines] [filename]';
        }

        if (filename && !response) {
            const targetPath = resolvePath(cwd, filename);
            const fsKey = targetPath.substring(1);
            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                const content = fileSystem[fsKey];
                const lines = content.split('\n');
                response = lines.slice(-n).join('\n');
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === 'wc') {
        if (args.length === 0) {
            response = 'Usage: wc [filename]';
        } else {
            const filename = args[0];
            const targetPath = resolvePath(cwd, filename);
            const fsKey = targetPath.substring(1);
            if (fileSystem[fsKey] !== undefined && fileSystem[fsKey] !== 'directory') {
                const content = fileSystem[fsKey];
                const lines = content.split('\n');
                const words = content.trim().split(/\s+/).filter(w => w.length > 0);
                const chars = content.length;
                response = `${lines.length} ${words.length} ${chars} ${filename}`;
            } else {
                response = `File not found: ${filename}`;
            }
        }
    } else if (command === '') {
        response = '';
    } else {
        response = `Command not found: ${command}`;
    }

    if (cmd.trim() !== '' && !(command === 'history' && args[0] === '-c')) {
        if (!window.terminalHistory) window.terminalHistory = [];
        window.terminalHistory.push(cmd);

        const maxHistory = 200;
        if (window.terminalHistory.length > maxHistory) {
            window.terminalHistory = window.terminalHistory.slice(-maxHistory);
        }
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
        showNotification('Paint', `Image "${filename}" saved to system.`);
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

function uploadFile(windowId) {
    const input = document.getElementById(`explorer-upload-${windowId}`);
    if (input) input.click();
}

function handleFileUpload(windowId, input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const currentPath = explorerStates[windowId].path;
        const prefix = currentPath === '/' ? '' : currentPath.substring(1) + '/';
        const filename = file.name;
        const key = prefix + filename;

        if (file.name.endsWith('.exe')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (fileSystem[key]) {
                    if (!confirm(`File "${filename}" already exists. Overwrite?`)) return;
                }
                wineExeFiles[key] = e.target.result;
                fileSystem[key] = '__exe__';
                saveFileSystem();
                renderFileExplorer(windowId);
                alert(`Uploaded ${filename}`);
                input.value = '';
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                if (fileSystem[key]) {
                    if (!confirm(`File "${filename}" already exists. Overwrite?`)) return;
                }
                fileSystem[key] = content;
                saveFileSystem();
                renderFileExplorer(windowId);
                alert(`Uploaded ${filename}`);
                input.value = '';
            };
            reader.readAsDataURL(file);
        }
    }
}

function initSystemMonitor(windowId) {
    const update = () => {
        const cpuEl = document.getElementById(`sys-cpu-${windowId}`);
        const ramEl = document.getElementById(`sys-ram-${windowId}`);
        const winEl = document.getElementById(`sys-win-${windowId}`);
        const appsEl = document.getElementById(`sys-apps-${windowId}`);
        if (!cpuEl || !ramEl || !winEl || !appsEl) return;

        const openWindows = Array.from(document.querySelectorAll('.window'));
        const appNames = openWindows.map(w => w.querySelector('.window-title')?.textContent || 'Application');
        cpuEl.textContent = `${Math.floor(Math.random() * 45) + 10}%`;
        ramEl.textContent = `${Math.floor(Math.random() * 2200) + 900} MB`;
        winEl.textContent = String(openWindows.length);
        appsEl.textContent = appNames.length ? appNames.join('\n') : 'Keine Apps aktiv';
    };

    update();
    systemMonitorStates[windowId] = setInterval(update, 1500);
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
        else if (displayName.endsWith('.exe')) iconChar = '🍷';
        else if (displayName.endsWith('.png') || displayName.endsWith('.jpg')) iconChar = '🖼️';
        else if (displayName.endsWith('.mp4') || displayName.endsWith('.webm') || displayName.endsWith('.ogg') || displayName.endsWith('.mov')) iconChar = '🎞️';
        else if (displayName.endsWith('.mp3') || displayName.endsWith('.wav')) iconChar = '🎵';

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
            if(confirm(`Move ${displayName} to Recycle Bin?`)) {
                if (isDir) {
                    // Recursive move to recycle bin
                    const childPrefix = key;
                    const keysToMove = Object.keys(fileSystem).filter(k => k.startsWith(childPrefix));
                    keysToMove.forEach(k => moveToRecycleBin(k));
                    moveToRecycleBin(key);
                } else {
                    moveToRecycleBin(key);
                }
                renderFileExplorer(windowId);
                showNotification('Recycle Bin', `"${displayName}" moved to Recycle Bin.`);
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

        fileDiv.onclick = (e) => {
             e.stopPropagation();
             if (isDir) {
                 // Navigate into
                 explorerStates[windowId].path = currentPath === '/' ? '/' + displayName : currentPath + '/' + displayName;
                 renderFileExplorer(windowId);
             } else {
                 if (displayName.endsWith('.png') || displayName.endsWith('.jpg') || displayName.endsWith('.jpeg') || displayName.endsWith('.gif')) {
                     openApp('image-viewer', key); // Pass full key
                 } else if (displayName.endsWith('.mp4') || displayName.endsWith('.webm') || displayName.endsWith('.ogg') || displayName.endsWith('.mov')) {
                     openApp('video-player', key); // Pass full key
                 } else if (displayName.endsWith('.mp3') || displayName.endsWith('.wav')) {
                     openApp('music-player', key); // Pass full key
                 } else if (displayName.endsWith('.md')) {
                     openApp('markdown-viewer', key); // Pass full key
                 } else if (displayName.endsWith('.pdf')) {
                     openApp('pdf-viewer', key); // Pass full key
                 } else if (displayName.endsWith('.exe')) {
                     openApp('wine', key); // Pass full key
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
        showNotification('Notepad', `File "${filename}" saved to system.`);
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
        win.classList.remove('minimizing');
        win.style.display = 'flex';
        focusWindow(windowId);
    } else {
        // Minimize with animation
        win.style.animation = 'none'; // Reset
        void win.offsetWidth; // Trigger reflow
        win.classList.add('minimizing');
        setTimeout(() => {
            win.style.display = 'none';
            win.classList.remove('minimizing');
        }, 250);
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
    if (e.cancelable) e.preventDefault();
    isResizing = true;
    currentResizeWindow = document.getElementById(windowId);
    resizeDir = direction;
    const pt = getPointer(e);
    resizeOffset.x = pt.x;
    resizeOffset.y = pt.y;

    const rect = currentResizeWindow.getBoundingClientRect();
    originalSize.w = rect.width;
    originalSize.h = rect.height;
    originalPos.x = rect.left;
    originalPos.y = rect.top;

    // Un-snap before resizing a snapped window
    if (currentResizeWindow.dataset.snapZone) {
        clearSnapZone(currentResizeWindow);
    }

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchmove', resize, { passive: false });
    document.addEventListener('touchend', stopResize);
    document.addEventListener('touchcancel', stopResize);
}

function resize(e) {
    if (!isResizing || !currentResizeWindow) return;
    if (e.cancelable) e.preventDefault();
    const pt = getPointer(e);
    const dx = pt.x - resizeOffset.x;
    const dy = pt.y - resizeOffset.y;

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
    document.removeEventListener('touchmove', resize);
    document.removeEventListener('touchend', stopResize);
    document.removeEventListener('touchcancel', stopResize);
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

// Window State Persistence
function saveWindowStates() {
    const windows = document.querySelectorAll('.window');
    const states = [];
    windows.forEach(win => {
        states.push({
            id: win.id,
            left: win.style.left,
            top: win.style.top,
            width: win.style.width,
            height: win.style.height,
            display: win.style.display,
            appName: win.dataset.appName || '',
            maximized: win.classList.contains('maximized'),
            zIndex: win.style.zIndex
        });
    });
    localStorage.setItem('windowStates', JSON.stringify(states));
}

function restoreWindowStates() {
    const saved = localStorage.getItem('windowStates');
    if (!saved) return;

    try {
        const states = JSON.parse(saved);
        if (!Array.isArray(states) || states.length === 0) return;

        // Compute max zIndex from saved state (handles NaN)
        const zValues = states.map(s => parseInt(s.zIndex) || 0).filter(v => !isNaN(v));
        if (zValues.length > 0) {
            zIndex = Math.max(zIndex, ...zValues);
        }

        states.forEach(state => {
            openApp(state.appName, null, {
                id: state.id,
                left: state.left,
                top: state.top,
                width: state.width,
                height: state.height,
                restoredDisplay: state.display,
                restoredMaximized: state.maximized,
                restoredZIndex: state.zIndex
            });
        });
    } catch (e) {
        console.error('Failed to restore window states:', e);
    }
}

// Auto-save window states on window close and interactions
// (closeWindow is modified in-place; openApp already handles save via mouseup)
document.addEventListener('mouseup', () => {
    // Debounced save on drag/resize end
    clearTimeout(window._saveWindowStateTimer);
    window._saveWindowStateTimer = setTimeout(saveWindowStates, 200);
});

// Also save state when minimize/restore happens
const _origMinimize = minimizeWindow;
window.minimizeWindow = function(windowId) {
    _origMinimize(windowId);
    clearTimeout(window._saveWindowStateTimer);
    window._saveWindowStateTimer = setTimeout(saveWindowStates, 200);
};

// Speak App Logic

function saveSystemPin(windowId) {
    const input = document.getElementById(`pin-input-${windowId}`);
    if (!input || input.value.trim().length < 4) {
        alert('PIN muss mindestens 4 Zeichen lang sein.');
        return;
    }

    localStorage.setItem('systemPin', input.value.trim());
    input.value = '';
    alert('System-PIN gespeichert.');
}

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

// Shared helper: Escape HTML entities for safe rendering of untrusted text.
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Calendar Logic
const calendarStates = {};
let calendarEvents = JSON.parse(localStorage.getItem('webos-calendar-events') || '{}');

function saveCalendarEvents() {
    localStorage.setItem('webos-calendar-events', JSON.stringify(calendarEvents));
}

function initCalendar(windowId) {
    const now = new Date();
    calendarStates[windowId] = {
        currentMonth: now.getMonth(),
        currentYear: now.getFullYear(),
        selectedDay: now.getDate(),
        editingEventId: null
    };
    renderCalendar(windowId);
    selectCalendarDay(windowId, now.getDate(), now.getMonth(), now.getFullYear());
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
        
        const dateKey = `${state.currentYear}-${state.currentMonth + 1}-${i}`;
        const hasEvents = calendarEvents[dateKey] && calendarEvents[dateKey].length > 0;
        
        if (hasEvents) {
            const dot = document.createElement('div');
            dot.className = 'calendar-event-dot';
            div.appendChild(dot);
        }

        if (i === today.getDate() && state.currentMonth === today.getMonth() && state.currentYear === today.getFullYear()) {
            div.classList.add('today');
        }
        
        if (i === state.selectedDay) {
            div.classList.add('selected');
        }

        div.onclick = () => selectCalendarDay(windowId, i, state.currentMonth, state.currentYear);
        grid.appendChild(div);
    }

    // Next month days to fill grid (assuming 6 rows max -> 42 cells)
    const totalCells = firstDay + daysInMonth;
    for (let i = 1; i <= (42 - totalCells); i++) {
         const div = document.createElement('div');
         div.className = 'calendar-day other-month';
         div.textContent = i;
         grid.appendChild(div);
    }
}

function selectCalendarDay(windowId, day, month, year) {
    const state = calendarStates[windowId];
    if (!state) return;
    state.selectedDay = day;
    
    // Update selected visual state in grid
    const grid = document.getElementById(`cal-grid-${windowId}`);
    if (grid) {
        grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(el => {
            el.classList.toggle('selected', parseInt(el.textContent) === day);
        });
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const header = document.getElementById(`cal-selected-day-${windowId}`);
    if (header) {
        header.textContent = `${monthNames[month]} ${day}, ${year}`;
    }

    renderCalendarEvents(windowId, day, month, year);
}

function renderCalendarEvents(windowId, day, month, year) {
    const itemsContainer = document.getElementById(`calendar-event-items-${windowId}`);
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';
    const dateKey = `${year}-${month + 1}-${day}`;
    const events = calendarEvents[dateKey] || [];

    if (events.length === 0) {
        itemsContainer.innerHTML = '<div class="calendar-no-events">No events scheduled.</div>';
    } else {
        const sortedEvents = [...events].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
        sortedEvents.forEach(event => {
            const div = document.createElement('div');
            div.className = 'calendar-event-item';
            div.innerHTML = `
                <div class="calendar-event-info">
                    <div class="calendar-event-title">${escapeHtml(event.title)}</div>
                    <div class="calendar-event-meta">${event.time ? event.time : 'No time'}</div>
                    ${event.desc ? `<div class="calendar-event-desc">${escapeHtml(event.desc)}</div>` : ''}
                </div>
                <div class="calendar-event-actions">
                    <button onclick="editCalendarEvent('${windowId}', '${dateKey}', '${event.id}')">✏️</button>
                    <button onclick="deleteCalendarEvent('${windowId}', '${dateKey}', '${event.id}')">🗑️</button>
                </div>
            `;
            itemsContainer.appendChild(div);
        });
    }
}

function openCalendarEventDialog(windowId, eventToEdit = null) {
    const dialog = document.getElementById(`calendar-event-dialog-${windowId}`);
    const titleInput = document.getElementById(`calendar-event-title-input-${windowId}`);
    const timeInput = document.getElementById(`calendar-event-time-input-${windowId}`);
    const descInput = document.getElementById(`calendar-event-desc-input-${windowId}`);
    const dialogTitle = document.getElementById(`calendar-event-dialog-title-${windowId}`);

    if (!dialog) return;

    const state = calendarStates[windowId];
    if (eventToEdit) {
        state.editingEventId = eventToEdit.id;
        dialogTitle.textContent = 'Edit Event';
        titleInput.value = eventToEdit.title;
        timeInput.value = eventToEdit.time || '';
        descInput.value = eventToEdit.desc || '';
    } else {
        state.editingEventId = null;
        dialogTitle.textContent = 'New Event';
        titleInput.value = '';
        timeInput.value = '';
        descInput.value = '';
    }

    dialog.classList.remove('hidden');
    titleInput.focus();
}

function closeCalendarEventDialog(windowId) {
    const dialog = document.getElementById(`calendar-event-dialog-${windowId}`);
    if (dialog) dialog.classList.add('hidden');
    if (calendarStates[windowId]) calendarStates[windowId].editingEventId = null;
}

function saveCalendarEvent(windowId) {
    const state = calendarStates[windowId];
    if (!state) return;

    const titleInput = document.getElementById(`calendar-event-title-input-${windowId}`);
    const timeInput = document.getElementById(`calendar-event-time-input-${windowId}`);
    const descInput = document.getElementById(`calendar-event-desc-input-${windowId}`);

    const title = titleInput.value.trim();
    if (!title) {
        alert("Please enter an event title.");
        return;
    }

    const dateKey = `${state.currentYear}-${state.currentMonth + 1}-${state.selectedDay}`;
    if (!calendarEvents[dateKey]) calendarEvents[dateKey] = [];

    if (state.editingEventId) {
        const index = calendarEvents[dateKey].findIndex(e => e.id === state.editingEventId);
        if (index !== -1) {
            calendarEvents[dateKey][index] = {
                ...calendarEvents[dateKey][index],
                title,
                time: timeInput.value,
                desc: descInput.value
            };
        }
    } else {
        calendarEvents[dateKey].push({
            id: 'event-' + Date.now(),
            title,
            time: timeInput.value,
            desc: descInput.value
        });
    }

    saveCalendarEvents();
    closeCalendarEventDialog(windowId);
    renderCalendar(windowId);
    renderCalendarEvents(windowId, state.selectedDay, state.currentMonth, state.currentYear);
}

function deleteCalendarEvent(windowId, dateKey, eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    if (calendarEvents[dateKey]) {
        calendarEvents[dateKey] = calendarEvents[dateKey].filter(e => e.id !== eventId);
        if (calendarEvents[dateKey].length === 0) delete calendarEvents[dateKey];
        saveCalendarEvents();
        
        const state = calendarStates[windowId];
        renderCalendar(windowId);
        renderCalendarEvents(windowId, state.selectedDay, state.currentMonth, state.currentYear);
    }
}

function editCalendarEvent(windowId, dateKey, eventId) {
    const event = calendarEvents[dateKey]?.find(e => e.id === eventId);
    if (event) {
        openCalendarEventDialog(windowId, event);
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
        delBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); removeWorldCity(windowId, index); };

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

// Markdown Editor Logic
function updateMarkdownPreview(windowId) {
    const editor = document.getElementById(`markdown-editor-${windowId}`);
    const preview = document.getElementById(`markdown-preview-${windowId}`);
    if (editor && preview) {
        preview.innerHTML = renderMarkdown(editor.value || editor.placeholder);
    }
}

function saveMarkdown(windowId) {
    const editor = document.getElementById(`markdown-editor-${windowId}`);
    const content = editor.value;
    const filename = prompt("Enter filename to save (e.g., doc.md):", "doc.md");

    if (filename) {
        if (filename.includes('/') || filename.includes('\\')) {
             alert("Invalid name");
             return;
        }
        fileSystem[filename] = content;
        saveFileSystem();
        showNotification('Markdown Editor', `File "${filename}" saved.`);
    }
}

function downloadMarkdown(windowId) {
    const editor = document.getElementById(`markdown-editor-${windowId}`);
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'document.md';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

function openMarkdownFile(windowId, input) {
    const editor = document.getElementById(`markdown-editor-${windowId}`);

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            editor.value = e.target.result;
            updateMarkdownPreview(windowId);
        };
        reader.readAsText(input.files[0]);
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
const sudokuGames = {};
const spreadsheetStates = {};

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
function initSudoku(windowId, difficulty = 'medium') {
    const status = document.getElementById(`sudoku-status-${windowId}`);
    if (status) status.textContent = '';

    // Generate a solved board
    const solution = generateSudokuBoard();

    // Copy solution to create puzzle
    const puzzle = solution.map(row => [...row]);

    // Remove numbers based on difficulty
    let attempts = 40;
    if (difficulty === 'easy') attempts = 30;
    else if (difficulty === 'hard') attempts = 50;

    removeCells(puzzle, attempts);

    // Store state
    sudokuGames[windowId] = {
        solution: solution,
        puzzle: puzzle, // Initial state (fixed cells)
        current: puzzle.map(row => [...row]), // Current user state
        selected: { r: 0, c: 0 },
        difficulty: difficulty
    };

    renderSudoku(windowId);

    // Focus window
    const win = document.getElementById(windowId);
    if (win) win.focus();
}

function generateSudokuBoard() {
    // Start with empty board
    const board = Array.from({length: 9}, () => Array(9).fill(0));

    // Fill diagonal 3x3 matrices (independent)
    fillDiagonal(board);

    // Solve to fill the rest
    solveSudoku(board);

    return board;
}

function fillDiagonal(board) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
}

function fillBox(board, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeInBox(board, row, col, num));
            board[row + i][col + j] = num;
        }
    }
}

function isSafeInBox(board, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[rowStart + i][colStart + j] === num) return false;
        }
    }
    return true;
}

function isSafe(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;

    // Check col
    for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;

    // Check box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function removeCells(board, count) {
    while (count > 0) {
        const cellId = Math.floor(Math.random() * 81);
        const r = Math.floor(cellId / 9);
        const c = cellId % 9;
        if (board[r][c] !== 0) {
            board[r][c] = 0;
            count--;
        }
    }
}

function renderSudoku(windowId) {
    const game = sudokuGames[windowId];
    if (!game) return;

    const container = document.getElementById(`sudoku-grid-${windowId}`);
    if (!container) return;

    container.innerHTML = '';

    // Set grid styles dynamically to ensure it works
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(9, 30px)';
    container.style.gridTemplateRows = 'repeat(9, 30px)';
    container.style.gap = '1px';
    container.style.background = '#333';
    container.style.border = '2px solid #333';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            const val = game.current[r][c];
            const isFixed = game.puzzle[r][c] !== 0;
            const isSelected = game.selected.r === r && game.selected.c === c;

            cell.className = 'sudoku-cell';
            if (isFixed) cell.classList.add('fixed');
            if (isSelected) cell.classList.add('selected');

            // Borders for 3x3 subgrids
            if (c === 2 || c === 5) cell.style.borderRight = '2px solid #333';
            if (r === 2 || r === 5) cell.style.borderBottom = '2px solid #333';

            // Basic cell style
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.background = isSelected ? '#bbdefb' : (isFixed ? '#eee' : 'white');
            cell.style.cursor = 'pointer';
            cell.style.fontSize = '16px';
            if (isFixed) cell.style.fontWeight = 'bold';

            cell.textContent = val === 0 ? '' : val;

            cell.onclick = (e) => {
                e.stopPropagation(); // Prevent window focus handling interfering?
                game.selected = { r, c };
                renderSudoku(windowId);
                // Ensure window has focus for key events
                const win = document.getElementById(windowId);
                if (win) win.focus();
            };

            container.appendChild(cell);
        }
    }
}

function handleSudokuInput(windowId, e) {
    const game = sudokuGames[windowId];
    if (!game) return;

    const { r, c } = game.selected;
    let key = e.key;

    // Navigation
    if (key === 'ArrowUp') {
        game.selected.r = (r - 1 + 9) % 9;
        renderSudoku(windowId);
        return;
    } else if (key === 'ArrowDown') {
        game.selected.r = (r + 1) % 9;
        renderSudoku(windowId);
        return;
    } else if (key === 'ArrowLeft') {
        game.selected.c = (c - 1 + 9) % 9;
        renderSudoku(windowId);
        return;
    } else if (key === 'ArrowRight') {
        game.selected.c = (c + 1) % 9;
        renderSudoku(windowId);
        return;
    }

    // Check if cell is fixed
    if (game.puzzle[r][c] !== 0) return;

    // Input
    if (key >= '1' && key <= '9') {
        game.current[r][c] = parseInt(key);
        renderSudoku(windowId);

        // Auto check if full? optional
    } else if (key === 'Backspace' || key === 'Delete') {
        game.current[r][c] = 0;
        renderSudoku(windowId);
    }
}

function checkSudokuWin(windowId, alertUser = false) {
    const game = sudokuGames[windowId];
    if (!game) return;

    const status = document.getElementById(`sudoku-status-${windowId}`);

    // Check if full
    let isFull = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (game.current[r][c] === 0) {
                isFull = false;
                break;
            }
        }
    }

    if (!isFull) {
        if (alertUser) {
             if (status) {
                 status.textContent = "Incomplete!";
                 status.style.color = "orange";
             }
        }
        return false;
    }

    // Check against solution
    let isCorrect = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (game.current[r][c] !== game.solution[r][c]) {
                isCorrect = false;
                break;
            }
        }
    }

    if (isCorrect) {
        if (status) {
            status.textContent = "Solved! Good job!";
            status.style.color = "green";
        }
        if (alertUser) alert("Congratulations! You solved it!");
    } else {
        if (status) {
             status.textContent = "Incorrect. Keep trying.";
             status.style.color = "red";
        }
    }

    return isCorrect;
}

// Weather App Logic
const weatherStates = {};
const pomodoroStates = {};

function initPomodoro(windowId) {
    if (!pomodoroStates[windowId]) {
        pomodoroStates[windowId] = {
            mode: 'focus',
            focusMinutes: 25,
            breakMinutes: 5,
            remainingSeconds: 25 * 60,
            running: false,
            interval: null
        };
    }
    renderPomodoro(windowId);
}

function renderPomodoro(windowId) {
    const state = pomodoroStates[windowId];
    if (!state) return;

    const timeEl = document.getElementById(`pomodoro-time-${windowId}`);
    const phaseEl = document.getElementById(`pomodoro-phase-${windowId}`);
    const toggleEl = document.getElementById(`pomodoro-toggle-${windowId}`);
    const modeEl = document.getElementById(`pomodoro-mode-${windowId}`);
    if (!timeEl || !phaseEl || !toggleEl || !modeEl) return;

    const minutes = Math.floor(state.remainingSeconds / 60).toString().padStart(2, '0');
    const seconds = (state.remainingSeconds % 60).toString().padStart(2, '0');

    timeEl.textContent = `${minutes}:${seconds}`;
    phaseEl.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
    toggleEl.textContent = state.running ? 'Pause' : 'Start';
    modeEl.textContent = state.mode === 'focus' ? 'Break' : 'Focus';
}

function togglePomodoro(windowId) {
    const state = pomodoroStates[windowId];
    if (!state) return;

    if (state.running) {
        clearInterval(state.interval);
        state.interval = null;
        state.running = false;
        renderPomodoro(windowId);
        return;
    }

    state.running = true;
    state.interval = setInterval(() => {
        if (!pomodoroStates[windowId]) return;
        state.remainingSeconds -= 1;

        if (state.remainingSeconds <= 0) {
            switchPomodoroMode(windowId, true);
            return;
        }

        renderPomodoro(windowId);
    }, 1000);

    renderPomodoro(windowId);
}

function resetPomodoro(windowId) {
    const state = pomodoroStates[windowId];
    if (!state) return;

    clearInterval(state.interval);
    state.interval = null;
    state.running = false;
    state.remainingSeconds = (state.mode === 'focus' ? state.focusMinutes : state.breakMinutes) * 60;
    renderPomodoro(windowId);
}

function switchPomodoroMode(windowId, fromTimer = false) {
    const state = pomodoroStates[windowId];
    if (!state) return;

    const wasRunning = state.running;
    clearInterval(state.interval);
    state.interval = null;

    state.mode = state.mode === 'focus' ? 'break' : 'focus';
    state.remainingSeconds = (state.mode === 'focus' ? state.focusMinutes : state.breakMinutes) * 60;
    state.running = false;
    renderPomodoro(windowId);

    if (fromTimer) {
        showNotification('Pomodoro', state.mode === 'focus' ? 'Break is over. Back to focus!' : 'Focus session done. Time for a break!');
    }

    if (fromTimer && wasRunning) {
        togglePomodoro(windowId);
    }
}

function setPomodoroPreset(windowId, focusMinutes, breakMinutes) {
    const state = pomodoroStates[windowId];
    if (!state) return;

    state.focusMinutes = focusMinutes;
    state.breakMinutes = breakMinutes;
    resetPomodoro(windowId);
}

function initWeather(windowId) {
    if (!weatherStates[windowId]) {
        weatherStates[windowId] = {
            location: 'London',
            data: null,
            loading: false
        };
    }
    // Initial fetch
    searchWeather(windowId, 'London');
}

function searchWeather(windowId, query) {
    if (!query) return;
    const state = weatherStates[windowId];
    if (state) {
        state.loading = true;
        renderWeather(windowId);
        fetchWeatherData(windowId, query);
    }
}

async function fetchWeatherData(windowId, location) {
    const state = weatherStates[windowId];
    if (!state) return;

    try {
        // 1. Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('Location not found');
            state.loading = false;
            renderWeather(windowId);
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        state.location = `${name}, ${country}`;

        // 2. Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        state.data = weatherData;
        state.loading = false;
        renderWeather(windowId);

    } catch (error) {
        console.error('Weather fetch error:', error);
        alert('Failed to fetch weather data');
        state.loading = false;
        renderWeather(windowId);
    }
}

function renderWeather(windowId) {
    const state = weatherStates[windowId];
    const container = document.getElementById(`weather-content-${windowId}`);
    if (!container || !state) return;

    if (state.loading) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading...</div>';
        return;
    }

    if (!state.data) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">No Data</div>';
        return;
    }

    const current = state.data.current_weather;
    // Map WMO weather codes to text/emoji
    const getWeatherDesc = (code) => {
        const codes = {
            0: 'Clear sky ☀️',
            1: 'Mainly clear 🌤️',
            2: 'Partly cloudy ⛅',
            3: 'Overcast ☁️',
            45: 'Fog 🌫️', 48: 'Depositing rime fog 🌫️',
            51: 'Drizzle: Light 🌧️', 53: 'Drizzle: Moderate 🌧️', 55: 'Drizzle: Dense 🌧️',
            61: 'Rain: Slight 🌧️', 63: 'Rain: Moderate 🌧️', 65: 'Rain: Heavy 🌧️',
            71: 'Snow: Slight ❄️', 73: 'Snow: Moderate ❄️', 75: 'Snow: Heavy ❄️',
            80: 'Rain showers: Slight 🌦️', 81: 'Rain showers: Moderate 🌦️', 82: 'Rain showers: Violent ⛈️',
            95: 'Thunderstorm: Slight or moderate ⚡', 96: 'Thunderstorm with slight hail ⛈️', 99: 'Thunderstorm with heavy hail ⛈️'
        };
        return codes[code] || 'Unknown';
    };

    const desc = getWeatherDesc(current.weathercode);

    container.innerHTML = `
        <div class="weather-current">
            <div class="weather-location">${state.location}</div>
            <div class="weather-temp">${current.temperature}°C</div>
            <div class="weather-desc">${desc}</div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Wind</div>
                    <div class="weather-detail-value">${current.windspeed} km/h</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Elevation</div>
                    <div class="weather-detail-value">${state.data.elevation} m</div>
                </div>
            </div>
        </div>
    `;
}

// Voice Recorder Logic
const voiceRecorderStates = {};

function initVoiceRecorder(windowId) {
    if (!voiceRecorderStates[windowId]) {
        voiceRecorderStates[windowId] = {
            audioContext: null,
            analyser: null,
            mediaRecorder: null,
            chunks: [],
            isRecording: false,
            startTime: 0,
            timerInterval: null,
            visualizerAnimationFrame: null,
            recordings: []
        };
    }
    renderRecordingsList(windowId);
}

function renderRecordingsList(windowId) {
    const state = voiceRecorderStates[windowId];
    const list = document.getElementById(`vr-list-${windowId}`);
    if (!list || !state) return;

    if (state.recordings.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #888; padding: 10px;">No recordings yet</div>';
        return;
    }

    list.innerHTML = '';
    state.recordings.forEach((rec, index) => {
        const item = document.createElement('div');
        item.className = 'vr-recording-item';
        item.innerHTML = `
            <div class="vr-rec-info">
                <span class="vr-rec-name">Recording ${index + 1}</span>
                <span class="vr-rec-time">${rec.duration}</span>
            </div>
            <div class="vr-rec-actions">
                <button onclick="playRecording('${windowId}', ${index})">▶</button>
                <a href="${rec.url}" download="recording-${index + 1}.webm" class="vr-download-btn">⬇</a>
                <button onclick="deleteRecording('${windowId}', ${index})" style="color: #e74c3c;">✕</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function startRecording(windowId) {
    const state = voiceRecorderStates[windowId];
    if (!state || state.isRecording) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = state.audioContext.createMediaStreamSource(stream);
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 2048;
        source.connect(state.analyser);

        state.mediaRecorder = new MediaRecorder(stream);
        state.chunks = [];

        state.mediaRecorder.ondataavailable = (e) => {
            state.chunks.push(e.data);
        };

        state.mediaRecorder.onstop = () => {
            const blob = new Blob(state.chunks, { 'type' : 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const duration = document.getElementById(`vr-timer-${windowId}`).innerText;
            state.recordings.push({ url, blob, duration });
            renderRecordingsList(windowId);
            state.chunks = [];
        };

        state.mediaRecorder.start();
        state.isRecording = true;
        state.startTime = Date.now();

        // Update UI
        document.getElementById(`vr-record-btn-${windowId}`).disabled = true;
        document.getElementById(`vr-stop-btn-${windowId}`).disabled = false;

        // Start Timer
        state.timerInterval = setInterval(() => {
            const elapsed = Date.now() - state.startTime;
            const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
            const timerEl = document.getElementById(`vr-timer-${windowId}`);
            if (timerEl) timerEl.innerText = `${minutes}:${seconds}`;
        }, 1000);

        // Start Visualizer
        drawVisualizer(windowId);

    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please ensure you have granted permission.');
    }
}

function stopRecording(windowId) {
    const state = voiceRecorderStates[windowId];
    if (!state || !state.isRecording) return;

    state.mediaRecorder.stop();
    state.isRecording = false;

    // Stop all tracks to release microphone
    state.mediaRecorder.stream.getTracks().forEach(track => track.stop());

    // Close AudioContext if not needed or suspend
    // Actually, we might need it for playback? No, playback is via <audio> element or similar.
    // But let's close it to be safe and release resources.
    if (state.audioContext) {
        state.audioContext.close();
        state.audioContext = null;
    }

    clearInterval(state.timerInterval);
    cancelAnimationFrame(state.visualizerAnimationFrame);

    // Reset UI
    document.getElementById(`vr-record-btn-${windowId}`).disabled = false;
    document.getElementById(`vr-stop-btn-${windowId}`).disabled = true;

    // Reset Timer Display after a short delay or keep it?
    // Usually it resets on new recording. Let's keep it for now.
}

function drawVisualizer(windowId) {
    const state = voiceRecorderStates[windowId];
    if (!state || !state.isRecording) return;

    const canvas = document.getElementById(`vr-visualizer-${windowId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    state.analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#f0f0f0'; // Background color matches window content usually
    // Or transparent? Let's check style.css later.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e74c3c'; // Red color
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    state.visualizerAnimationFrame = requestAnimationFrame(() => drawVisualizer(windowId));
}

function playRecording(windowId, index) {
    const state = voiceRecorderStates[windowId];
    if (!state || !state.recordings[index]) return;

    if (state.currentPlaybackAudio) {
        state.currentPlaybackAudio.pause();
        state.currentPlaybackAudio = null;
    }

    const url = state.recordings[index].url;
    const audio = new Audio(url);
    state.currentPlaybackAudio = audio;
    audio.play().catch(e => console.error("Error playing audio:", e));
    audio.onended = () => {
        state.currentPlaybackAudio = null;
    };
}

function deleteRecording(windowId, index) {
    const state = voiceRecorderStates[windowId];
    if (!state || !state.recordings[index]) return;

    if (confirm("Are you sure you want to delete this recording?")) {
        const rec = state.recordings[index];
        URL.revokeObjectURL(rec.url); // Clean up blob URL
        state.recordings.splice(index, 1);
        renderRecordingsList(windowId);
    }
}

// PDF Viewer Logic
function handlePdfFile(windowId) {
    const input = document.getElementById(`pdf-input-${windowId}`);
    const nameDisplay = document.getElementById(`pdf-name-${windowId}`);
    const container = document.getElementById(`pdf-container-${windowId}`);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        nameDisplay.textContent = file.name;

        container.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    }
}

// Piano Logic
const pianoStates = {};

function initPiano(windowId) {
    const keysContainer = document.getElementById(`piano-keys-${windowId}`);
    if (!keysContainer) return;

    pianoStates[windowId] = {
        audioContext: new (window.AudioContext || window.webkitAudioContext)(),
        oscillators: {}
    };

    const notes = [
        { note: 'C4', freq: 261.63, type: 'white', key: 'a' },
        { note: 'C#4', freq: 277.18, type: 'black', key: 'w' },
        { note: 'D4', freq: 293.66, type: 'white', key: 's' },
        { note: 'D#4', freq: 311.13, type: 'black', key: 'e' },
        { note: 'E4', freq: 329.63, type: 'white', key: 'd' },
        { note: 'F4', freq: 349.23, type: 'white', key: 'f' },
        { note: 'F#4', freq: 369.99, type: 'black', key: 't' },
        { note: 'G4', freq: 392.00, type: 'white', key: 'g' },
        { note: 'G#4', freq: 415.30, type: 'black', key: 'y' },
        { note: 'A4', freq: 440.00, type: 'white', key: 'h' },
        { note: 'A#4', freq: 466.16, type: 'black', key: 'u' },
        { note: 'B4', freq: 493.88, type: 'white', key: 'j' },
        { note: 'C5', freq: 523.25, type: 'white', key: 'k' }
    ];

    pianoStates[windowId].notes = notes;

    keysContainer.innerHTML = ''; // Clear

    let whiteKeyIndex = 0;
    notes.forEach(n => {
        const keyDiv = document.createElement('div');
        keyDiv.className = `piano-key ${n.type}`;
        keyDiv.dataset.note = n.note;
        keyDiv.dataset.freq = n.freq;
        keyDiv.dataset.inputKey = n.key;

        if (n.type === 'white') {
            keyDiv.textContent = n.key.toUpperCase();
            keyDiv.style.left = `${whiteKeyIndex * 40}px`;
            whiteKeyIndex++;
        } else {
            // Black key position: After previous white key
            // Offset for visual centering between keys
            keyDiv.style.left = `${(whiteKeyIndex - 1) * 40 + 25}px`;
        }

        // Event listeners
        keyDiv.onmousedown = () => playNote(windowId, n.freq, n.note);
        keyDiv.onmouseup = () => stopNote(windowId, n.note);
        keyDiv.onmouseleave = () => stopNote(windowId, n.note);

        keysContainer.appendChild(keyDiv);
    });

    // Keyboard support
    const win = document.getElementById(windowId);
    if (win) {
        win.tabIndex = 0;
        win.focus();

        win.onkeydown = (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            const note = notes.find(n => n.key === key);
            if (note) {
                const keyEl = keysContainer.querySelector(`[data-note="${note.note}"]`);
                if (keyEl && !keyEl.classList.contains('active')) {
                    playNote(windowId, note.freq, note.note);
                    keyEl.classList.add('active');
                }
            }
        };

        win.onkeyup = (e) => {
            const key = e.key.toLowerCase();
            const note = notes.find(n => n.key === key);
            if (note) {
                stopNote(windowId, note.note);
                const keyEl = keysContainer.querySelector(`[data-note="${note.note}"]`);
                if (keyEl) keyEl.classList.remove('active');
            }
        };
    }
}

function playNote(windowId, freq, noteName) {
    const state = pianoStates[windowId];
    if (!state) return;

    if (state.oscillators[noteName]) return; // Already playing

    const ctx = state.audioContext;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const volumeEl = document.getElementById(`piano-volume-${windowId}`);
    const volume = volumeEl ? parseFloat(volumeEl.value) : 0.5;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); // Decay

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    state.oscillators[noteName] = { osc, gainNode };
}

function stopNote(windowId, noteName) {
    const state = pianoStates[windowId];
    if (!state || !state.oscillators[noteName]) return;

    const { osc, gainNode } = state.oscillators[noteName];

    try {
        gainNode.gain.cancelScheduledValues(state.audioContext.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, state.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 0.1);

        osc.stop(state.audioContext.currentTime + 0.1);
    } catch(e) {
        // Ignore errors if already stopped
    }

    delete state.oscillators[noteName];
}

// Spreadsheet Logic
function initSpreadsheet(windowId) {
    const container = document.getElementById(`spreadsheet-grid-container-${windowId}`);
    if (!container) return;

    // Initialize state if not present
    if (!spreadsheetStates[windowId]) {
        const rows = 20;
        const cols = 10; // A-J
        const data = {};
        for (let r = 1; r <= rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellId = `${String.fromCharCode(65 + c)}${r}`;
                data[cellId] = { value: '', formula: '' };
            }
        }
        spreadsheetStates[windowId] = {
            rows,
            cols,
            data,
            selected: null
        };
    }

    renderSpreadsheet(windowId);
}

function renderSpreadsheet(windowId) {
    const container = document.getElementById(`spreadsheet-grid-container-${windowId}`);
    if (!container) return;

    const state = spreadsheetStates[windowId];
    if (!state) return;

    let html = '<div class="spreadsheet-grid">';

    // Header Row (Corner + A, B, C...)
    html += '<div class="spreadsheet-row header">';
    html += '<div class="spreadsheet-header-corner"></div>'; // Corner
    for (let c = 0; c < state.cols; c++) {
        html += `<div class="spreadsheet-header-col">${String.fromCharCode(65 + c)}</div>`;
    }
    html += '</div>';

    // Data Rows
    for (let r = 1; r <= state.rows; r++) {
        html += `<div class="spreadsheet-row">`;
        html += `<div class="spreadsheet-header-row">${r}</div>`; // Row Number
        for (let c = 0; c < state.cols; c++) {
            const cellId = `${String.fromCharCode(65 + c)}${r}`;
            const cellData = state.data[cellId];
            const value = cellData ? cellData.value : '';
            const isSelected = state.selected === cellId;

            html += `<div class="spreadsheet-cell ${isSelected ? 'selected' : ''}"
                           id="spreadsheet-cell-${windowId}-${cellId}"
                           data-cell-id="${cellId}"
                           onclick="handleCellClick('${windowId}', '${cellId}')">
                           ${value}
                       </div>`;
        }
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Add event listener for formula bar if selected
    if (state.selected) {
        const formulaInput = document.getElementById(`spreadsheet-formula-${windowId}`);
        if (formulaInput) {
            formulaInput.disabled = false;
            formulaInput.value = state.data[state.selected].formula || state.data[state.selected].value;
            formulaInput.oninput = (e) => handleCellChange(windowId, state.selected, e.target.value);
            formulaInput.focus();
        }
    } else {
        const formulaInput = document.getElementById(`spreadsheet-formula-${windowId}`);
        if (formulaInput) {
            formulaInput.disabled = true;
            formulaInput.value = '';
        }
    }
}

function handleCellClick(windowId, cellId) {
    const state = spreadsheetStates[windowId];
    if (!state) return;

    state.selected = cellId;
    renderSpreadsheet(windowId);
}

function handleCellChange(windowId, cellId, value) {
    const state = spreadsheetStates[windowId];
    if (!state) return;

    state.data[cellId].formula = value;

    // Evaluate if formula
    if (value.startsWith('=')) {
        state.data[cellId].value = evaluateFormula(value.substring(1), state.data);
    } else {
        state.data[cellId].value = value;
    }

    // Re-evaluate all cells (simple dependency handling)
    recalculateAll(windowId);

    // Only update grid text, don't full re-render to lose focus if we were editing in grid (though we edit in bar now)
    // Actually, simple re-render is safer for now.
    // Optimization: update specific cell DOM
    const cellEl = document.getElementById(`spreadsheet-cell-${windowId}-${cellId}`);
    if (cellEl) cellEl.textContent = state.data[cellId].value;
}

function recalculateAll(windowId) {
    const state = spreadsheetStates[windowId];
    // Simple 2-pass or iterative approach to resolve dependencies?
    // For now, just iterate all cells once. Circular deps will be static or old value.
    // Better: Recursive evaluation with loop detection, but let's keep it simple.
    // We'll just iterate all cells that have formulas.

    for (let r = 1; r <= state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            const cellId = `${String.fromCharCode(65 + c)}${r}`;
            const cellData = state.data[cellId];
            if (cellData.formula.startsWith('=')) {
                cellData.value = evaluateFormula(cellData.formula.substring(1), state.data);
                const cellEl = document.getElementById(`spreadsheet-cell-${windowId}-${cellId}`);
                if (cellEl) cellEl.textContent = cellData.value;
            }
        }
    }
}

function evaluateFormula(expr, data) {
    // Replace cell references with values
    // Regex for A1..J20 (case insensitive)
    const parsedExpr = expr.replace(/([a-jA-J])([0-9]+)/g, (match, col, row) => {
        const cellId = col.toUpperCase() + row;
        const cell = data[cellId];
        if (cell) {
            const val = parseFloat(cell.value);
            return isNaN(val) ? 0 : val;
        }
        return 0;
    });

    try {
        // Safety check: only allow numbers, operators, parenthesis, and Math functions
        if (/^[0-9+\-/*().\sMathsincostanqrtpow,]+$/.test(parsedExpr)) {
            // eslint-disable-next-line no-eval
            return eval(parsedExpr);
        } else {
            return '#ERR';
        }
    } catch (e) {
        return '#ERR';
    }
}

function saveSpreadsheet(windowId) {
    const state = spreadsheetStates[windowId];
    if (!state) return;

    // Save as JSON for full fidelity (formulas) or CSV for data?
    // JSON is better for preserving formulas.

    const exportData = {
        rows: state.rows,
        cols: state.cols,
        data: state.data
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const filename = prompt("Enter filename to save (e.g., sheet.json):", "sheet.json");
    if (filename) {
        // Save to virtual FileSystem
        fileSystem[filename] = json;
        saveFileSystem();
        showNotification('Spreadsheet', `Saved ${filename} to system.`);

        // Also offer download
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }

    URL.revokeObjectURL(url);
}

function loadSpreadsheet(windowId, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (loadedData.rows && loadedData.cols && loadedData.data) {
                    spreadsheetStates[windowId] = {
                        rows: loadedData.rows,
                        cols: loadedData.cols,
                        data: loadedData.data,
                        selected: null
                    };
                    renderSpreadsheet(windowId);
                } else {
                    alert("Invalid spreadsheet file.");
                }
            } catch (err) {
                alert("Error loading file: " + err.message);
            }
        };
        reader.readAsText(input.files[0]);
    }
}

// Email App Logic
const emailStates = {};

function initEmail(windowId) {
    if (!emailStates[windowId]) {
        let emails = [];
        try {
            const stored = localStorage.getItem('webos-emails');
            if (stored) {
                emails = JSON.parse(stored);
            } else {
                emails = [
                    { id: 1, from: 'system@webos.local', subject: 'Welcome to WebOS Email', body: 'This is a simulated email client. Your emails are stored in your browser.', date: new Date().toISOString(), read: false }
                ];
                localStorage.setItem('webos-emails', JSON.stringify(emails));
            }
        } catch (e) {
            console.error('Error loading emails:', e);
            emails = [];
        }

        emailStates[windowId] = {
            emails: emails,
            view: 'inbox', // 'inbox', 'compose', 'read'
            currentEmailId: null
        };
    }

    renderEmailApp(windowId);
}

function renderEmailApp(windowId) {
    const container = document.getElementById(`email-container-${windowId}`);
    if (!container) return;

    const state = emailStates[windowId];

    let html = `
        <div class="email-sidebar">
            <button class="email-btn compose" onclick="switchEmailView('${windowId}', 'compose')">Compose</button>
            <div class="email-folder active" onclick="switchEmailView('${windowId}', 'inbox')">Inbox</div>
        </div>
        <div class="email-main">
    `;

    if (state.view === 'inbox') {
        html += `
            <div class="email-header">
                <h2>Inbox</h2>
            </div>
            <div class="email-list">
        `;

        if (state.emails.length === 0) {
            html += '<div style="padding: 20px; text-align: center; color: #888;">No emails found.</div>';
        } else {
            // Sort by date desc
            const sortedEmails = [...state.emails].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedEmails.forEach(email => {
                const dateObj = new Date(email.date);
                const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            // XSS prevention
            const safeFrom = email.from.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeSubject = email.subject.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

                html += `
                    <div class="email-item ${email.read ? '' : 'unread'}" onclick="viewEmail('${windowId}', ${email.id})">
                    <div class="email-item-from">${safeFrom}</div>
                    <div class="email-item-subject">${safeSubject}</div>
                        <div class="email-item-date">${dateStr}</div>
                    </div>
                `;
            });
        }

        html += `</div>`;
    } else if (state.view === 'compose') {
        html += `
            <div class="email-header">
                <h2>New Message</h2>
            </div>
            <div class="email-compose-form">
                <input type="email" id="email-to-${windowId}" placeholder="To:" class="email-input">
                <input type="text" id="email-subject-${windowId}" placeholder="Subject:" class="email-input">
                <textarea id="email-body-${windowId}" placeholder="Write your message here..." class="email-textarea"></textarea>
                <div class="email-actions">
                    <button class="email-btn primary" onclick="sendEmail('${windowId}')">Send</button>
                    <button class="email-btn" onclick="switchEmailView('${windowId}', 'inbox')">Cancel</button>
                </div>
            </div>
        `;
    } else if (state.view === 'read' && state.currentEmailId) {
        const email = state.emails.find(e => e.id === state.currentEmailId);
        if (email) {
            if (!email.read) {
                email.read = true;
                saveEmails(windowId);
            }

            const dateObj = new Date(email.date);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();

            // XSS prevention
            const safeFrom = email.from.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeSubject = email.subject.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeBody = email.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');

            html += `
                <div class="email-header email-read-header">
                    <div>
                        <h2>${safeSubject}</h2>
                        <div class="email-read-meta">From: ${safeFrom} | ${dateStr}</div>
                    </div>
                    <div>
                        <button class="email-btn" onclick="switchEmailView('${windowId}', 'inbox')">Back</button>
                        <button class="email-btn danger" onclick="deleteEmail('${windowId}', ${email.id})">Delete</button>
                    </div>
                </div>
                <div class="email-read-body">
                    ${safeBody}
                </div>
            `;
        } else {
            html += '<div style="padding: 20px;">Email not found.</div>';
        }
    }

    html += `</div>`;
    container.innerHTML = html;
}

function switchEmailView(windowId, viewName) {
    const state = emailStates[windowId];
    if (state) {
        state.view = viewName;
        renderEmailApp(windowId);
    }
}

function viewEmail(windowId, emailId) {
    const state = emailStates[windowId];
    if (state) {
        state.currentEmailId = emailId;
        switchEmailView(windowId, 'read');
    }
}

function sendEmail(windowId) {
    const toInput = document.getElementById(`email-to-${windowId}`);
    const subjectInput = document.getElementById(`email-subject-${windowId}`);
    const bodyInput = document.getElementById(`email-body-${windowId}`);

    if (!toInput || !subjectInput || !bodyInput) return;

    const to = toInput.value.trim();
    const subject = subjectInput.value.trim();
    const body = bodyInput.value.trim();

    if (!to) {
        alert("Please enter a recipient.");
        return;
    }

    const state = emailStates[windowId];
    if (state) {
        // Since this is simulated, we'll just act as if sending to ourselves or save it in 'sent' (but we only have inbox).
        // Let's simulate receiving a copy if sent, or just show a notification.
        // Actually, to simulate it working, we can just add it to our own inbox to see it,
        // or just show "Sent" and go back. We'll just show "Sent" and return to Inbox.

        // Let's add it to inbox to simulate "sending to self" or just having a record
        const newEmail = {
            id: Date.now(),
            from: `Me (to: ${to})`,
            subject: subject || '(No Subject)',
            body: body,
            date: new Date().toISOString(),
            read: true
        };

        state.emails.push(newEmail);
        saveEmails(windowId);

        showNotification('Email', 'Message sent successfully.');
        switchEmailView(windowId, 'inbox');
    }
}

function deleteEmail(windowId, emailId) {
    const state = emailStates[windowId];
    if (state) {
        if (confirm("Are you sure you want to delete this email?")) {
            state.emails = state.emails.filter(e => e.id !== emailId);
            saveEmails(windowId);
            switchEmailView(windowId, 'inbox');
        }
    }
}

function saveEmails(windowId) {
    const state = emailStates[windowId];
    if (state) {
        localStorage.setItem('webos-emails', JSON.stringify(state.emails));
    }
}

// Chat App Logic
const chatStates = {};

function initChat(windowId) {
    if (!chatStates[windowId]) {
        let contacts = [
            { id: 'contact1', name: 'Alice' },
            { id: 'contact2', name: 'Bob' },
            { id: 'contact3', name: 'Charlie' }
        ];

        let messages = {};
        try {
            const stored = localStorage.getItem('webos-chat-messages');
            if (stored) {
                messages = JSON.parse(stored);
            } else {
                messages = {
                    'contact1': [{ sender: 'them', text: 'Hey there!', time: new Date().toISOString() }],
                    'contact2': [],
                    'contact3': [{ sender: 'them', text: 'Did you see the new update?', time: new Date().toISOString() }]
                };
                localStorage.setItem('webos-chat-messages', JSON.stringify(messages));
            }
        } catch (e) {
            console.error('Error loading chat messages:', e);
        }

        chatStates[windowId] = {
            contacts: contacts,
            messages: messages,
            activeContactId: null
        };
    }

    renderChatApp(windowId);
}

function renderChatApp(windowId) {
    const container = document.getElementById(`chat-container-${windowId}`);
    if (!container) return;

    const state = chatStates[windowId];

    let html = `
        <div class="chat-sidebar">
            <div class="chat-sidebar-header">Contacts</div>
            <div class="chat-contact-list">
    `;

    state.contacts.forEach(contact => {
        const isActive = contact.id === state.activeContactId;
        const lastMsg = state.messages[contact.id] && state.messages[contact.id].length > 0 ?
            state.messages[contact.id][state.messages[contact.id].length - 1].text : 'No messages';

        html += `
            <div class="chat-contact ${isActive ? 'active' : ''}" onclick="selectChatContact('${windowId}', '${contact.id}')">
                <div class="chat-contact-avatar">${contact.name.charAt(0)}</div>
                <div class="chat-contact-info">
                    <div class="chat-contact-name">${contact.name}</div>
                    <div class="chat-contact-lastmsg">${lastMsg}</div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
        <div class="chat-main">
    `;

    if (state.activeContactId) {
        const activeContact = state.contacts.find(c => c.id === state.activeContactId);

        html += `
            <div class="chat-header">
                <div class="chat-contact-avatar">${activeContact.name.charAt(0)}</div>
                <div class="chat-contact-name">${activeContact.name}</div>
            </div>
            <div class="chat-messages" id="chat-messages-${windowId}">
        `;

        const contactMessages = state.messages[state.activeContactId] || [];
        contactMessages.forEach(msg => {
            const timeObj = new Date(msg.time);
            const timeStr = timeObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            // XSS prevention
            const safeText = msg.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            html += `
                <div class="chat-msg-wrapper ${msg.sender === 'me' ? 'me' : 'them'}">
                    <div class="chat-msg">
                        <div class="chat-msg-text">${safeText}</div>
                        <div class="chat-msg-time">${timeStr}</div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input-${windowId}" class="chat-input" placeholder="Type a message..." onkeydown="if(event.key === 'Enter') sendChatMessage('${windowId}')">
                <button class="chat-send-btn" onclick="sendChatMessage('${windowId}')">Send</button>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; height: 100%; align-items: center; justify-content: center; color: #888;">
                Select a contact to start chatting
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Scroll to bottom of messages
    if (state.activeContactId) {
        const msgContainer = document.getElementById(`chat-messages-${windowId}`);
        if (msgContainer) {
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }

        // Focus input
        const input = document.getElementById(`chat-input-${windowId}`);
        if (input) input.focus();
    }
}

function selectChatContact(windowId, contactId) {
    const state = chatStates[windowId];
    if (state) {
        state.activeContactId = contactId;
        renderChatApp(windowId);
    }
}

function sendChatMessage(windowId) {
    const input = document.getElementById(`chat-input-${windowId}`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const state = chatStates[windowId];
    if (state && state.activeContactId) {
        if (!state.messages[state.activeContactId]) {
            state.messages[state.activeContactId] = [];
        }

        state.messages[state.activeContactId].push({
            sender: 'me',
            text: text,
            time: new Date().toISOString()
        });

        saveChatMessages(windowId);
        input.value = '';
        renderChatApp(windowId);

        // Simulate reply
        setTimeout(() => {
            const activeContactName = state.contacts.find(c => c.id === state.activeContactId).name;
            state.messages[state.activeContactId].push({
                sender: 'them',
                text: `${activeContactName} says: That's interesting!`,
                time: new Date().toISOString()
            });
            saveChatMessages(windowId);
            renderChatApp(windowId);
        }, 2000);
    }
}

function saveChatMessages(windowId) {
    const state = chatStates[windowId];
    if (state) {
        localStorage.setItem('webos-chat-messages', JSON.stringify(state.messages));
    }
}

// Photo Gallery Logic
const galleryStates = {};

function initGallery(windowId) {
    if (!galleryStates[windowId]) {
        let images = [];
        try {
            const stored = localStorage.getItem('webos-gallery-images');
            if (stored) {
                images = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading gallery images:', e);
        }

        galleryStates[windowId] = {
            images: images,
            view: 'grid', // 'grid', 'single', 'slideshow'
            currentIndex: 0,
            slideshowInterval: null
        };
    }

    renderGalleryApp(windowId);
}

function renderGalleryApp(windowId) {
    const container = document.getElementById(`gallery-container-${windowId}`);
    if (!container) return;

    const state = galleryStates[windowId];
    let html = '';

    if (state.view === 'grid') {
        html = `
            <div class="gallery-toolbar">
                <button class="gallery-btn" onclick="startGallerySlideshow('${windowId}')">Slideshow</button>
                <label class="gallery-btn primary">
                    Upload Images
                    <input type="file" multiple accept="image/*" style="display: none;" onchange="uploadGalleryImages('${windowId}', this)">
                </label>
            </div>
            <div class="gallery-grid">
        `;

        if (state.images.length === 0) {
            html += '<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #888;">No images uploaded yet.</div>';
        } else {
            state.images.forEach((img, index) => {
                html += `
                    <div class="gallery-item" onclick="viewGalleryImage('${windowId}', ${index})">
                        <img src="${img.data}" alt="${img.name}">
                        <div class="gallery-item-name">${img.name}</div>
                        <button class="gallery-item-delete" onclick="event.stopPropagation(); deleteGalleryImage('${windowId}', ${index})">✕</button>
                    </div>
                `;
            });
        }

        html += `</div>`;
    } else if (state.view === 'single' || state.view === 'slideshow') {
        const img = state.images[state.currentIndex];

        html = `
            <div class="gallery-toolbar">
                <button class="gallery-btn" onclick="stopGallerySlideshow('${windowId}'); switchGalleryView('${windowId}', 'grid')">Back to Grid</button>
                ${state.view === 'slideshow' ?
                    `<button class="gallery-btn" onclick="stopGallerySlideshow('${windowId}')">Stop Slideshow</button>` :
                    `<button class="gallery-btn" onclick="startGallerySlideshow('${windowId}')">Start Slideshow</button>`
                }
            </div>
            <div class="gallery-viewer">
                ${state.view === 'single' ? `<button class="gallery-nav prev" onclick="navigateGallery('${windowId}', -1)">❮</button>` : ''}

                ${img ? `<img src="${img.data}" alt="${img.name}" class="gallery-viewer-img">` : '<div style="color: white;">No image</div>'}

                ${state.view === 'single' ? `<button class="gallery-nav next" onclick="navigateGallery('${windowId}', 1)">❯</button>` : ''}

                ${img ? `<div class="gallery-viewer-caption">${img.name} (${state.currentIndex + 1} / ${state.images.length})</div>` : ''}
            </div>
        `;
    }

    container.innerHTML = html;
}

function switchGalleryView(windowId, viewName) {
    const state = galleryStates[windowId];
    if (state) {
        state.view = viewName;
        renderGalleryApp(windowId);
    }
}

function uploadGalleryImages(windowId, input) {
    const state = galleryStates[windowId];
    if (!state || !input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    let loadedCount = 0;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            state.images.push({
                id: Date.now() + Math.random(),
                name: file.name,
                data: e.target.result,
                date: new Date().toISOString()
            });

            loadedCount++;
            if (loadedCount === files.length) {
                saveGalleryImages(windowId);
                renderGalleryApp(windowId);
                showNotification('Photo Gallery', `${files.length} image(s) uploaded successfully.`);
            }
        };
        reader.readAsDataURL(file);
    });
}

function saveGalleryImages(windowId) {
    const state = galleryStates[windowId];
    if (state) {
        try {
            localStorage.setItem('webos-gallery-images', JSON.stringify(state.images));
        } catch (e) {
            alert("Storage limit exceeded. Some images may not be saved.");
        }
    }
}

function viewGalleryImage(windowId, index) {
    const state = galleryStates[windowId];
    if (state && state.images[index]) {
        state.currentIndex = index;
        switchGalleryView(windowId, 'single');
    }
}

function deleteGalleryImage(windowId, index) {
    const state = galleryStates[windowId];
    if (state && state.images[index]) {
        if (confirm("Delete this image?")) {
            state.images.splice(index, 1);
            saveGalleryImages(windowId);
            renderGalleryApp(windowId);
        }
    }
}

function navigateGallery(windowId, direction) {
    const state = galleryStates[windowId];
    if (state && state.images.length > 0) {
        state.currentIndex += direction;
        if (state.currentIndex < 0) state.currentIndex = state.images.length - 1;
        if (state.currentIndex >= state.images.length) state.currentIndex = 0;
        renderGalleryApp(windowId);
    }
}

function startGallerySlideshow(windowId) {
    const state = galleryStates[windowId];
    if (state && state.images.length > 0) {
        state.view = 'slideshow';
        if (state.slideshowInterval) clearInterval(state.slideshowInterval);

        state.slideshowInterval = setInterval(() => {
            navigateGallery(windowId, 1);
        }, 3000); // 3 seconds per slide

        renderGalleryApp(windowId);
    } else {
        alert("Upload some images first to start a slideshow.");
    }
}

function stopGallerySlideshow(windowId) {
    const state = galleryStates[windowId];
    if (state) {
        if (state.slideshowInterval) {
            clearInterval(state.slideshowInterval);
            state.slideshowInterval = null;
        }
        state.view = 'single';
        renderGalleryApp(windowId);
    }
}

// Printer Settings Logic
const printerStates = {};

function initPrinter(windowId) {
    if (!printerStates[windowId]) {
        printerStates[windowId] = {
            printers: [
                { id: 'p1', name: 'WebOS PDF Printer', status: 'Ready', default: true },
                { id: 'p2', name: 'Office LaserJet Pro', status: 'Offline', default: false }
            ]
        };
    }

    renderPrinterApp(windowId);
}

function renderPrinterApp(windowId) {
    const container = document.getElementById(`printer-container-${windowId}`);
    if (!container) return;

    const state = printerStates[windowId];

    let html = `
        <div class="printer-header">
            <h2>Printers & Scanners</h2>
            <button class="printer-btn primary" onclick="addMockPrinter('${windowId}')">+ Add a printer or scanner</button>
        </div>
        <div class="printer-list">
    `;

    if (state.printers.length === 0) {
        html += '<div style="padding: 20px; color: #888;">No printers installed.</div>';
    } else {
        state.printers.forEach((printer, index) => {
            html += `
                <div class="printer-item">
                    <div class="printer-item-icon">🖨️</div>
                    <div class="printer-item-info">
                        <div class="printer-item-name">${printer.name}</div>
                        <div class="printer-item-status ${printer.status.toLowerCase()}">${printer.status} ${printer.default ? '(Default)' : ''}</div>
                    </div>
                    <div class="printer-item-actions">
                        ${!printer.default ? `<button class="printer-btn small" onclick="setDefaultPrinter('${windowId}', ${index})">Set Default</button>` : ''}
                        <button class="printer-btn small danger" onclick="removePrinter('${windowId}', ${index})">Remove</button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    container.innerHTML = html;
}

function addMockPrinter(windowId) {
    const state = printerStates[windowId];
    if (state) {
        // Simulate searching
        const btn = document.querySelector(`#printer-container-${windowId} .printer-header .primary`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Searching...';
            btn.disabled = true;

            setTimeout(() => {
                const newPrinterName = prompt("Found a generic network printer. Enter a name for it:", "New Network Printer");
                if (newPrinterName) {
                    state.printers.push({
                        id: 'p' + Date.now(),
                        name: newPrinterName,
                        status: 'Ready',
                        default: state.printers.length === 0
                    });
                    showNotification('Printers', `Added ${newPrinterName}`);
                }
                btn.textContent = originalText;
                btn.disabled = false;
                renderPrinterApp(windowId);
            }, 1500);
        }
    }
}

function removePrinter(windowId, index) {
    const state = printerStates[windowId];
    if (state && state.printers[index]) {
        if (confirm(`Are you sure you want to remove ${state.printers[index].name}?`)) {
            state.printers.splice(index, 1);

            // If we removed the default, make the first one default if any exist
            if (state.printers.length > 0 && !state.printers.some(p => p.default)) {
                state.printers[0].default = true;
            }

            renderPrinterApp(windowId);
        }
    }
}

function setDefaultPrinter(windowId, index) {
    const state = printerStates[windowId];
    if (state && state.printers[index]) {
        state.printers.forEach(p => p.default = false);
        state.printers[index].default = true;
        renderPrinterApp(windowId);
    }
}

// Code Editor Logic
function initCodeEditor(windowId) {
    const gutter = document.getElementById(`code-gutter-${windowId}`);
    const textarea = document.getElementById(`code-area-${windowId}`);

    if (gutter && textarea) {
        // Sync scroll
        textarea.addEventListener('scroll', () => {
            gutter.scrollTop = textarea.scrollTop;
        });

        // Initialize line numbers
        updateLineNumbers(windowId);
    }
}

function updateLineNumbers(windowId) {
    const textarea = document.getElementById(`code-area-${windowId}`);
    const gutter = document.getElementById(`code-gutter-${windowId}`);

    if (textarea && gutter) {
        const lines = textarea.value.split('\n').length;
        // Simple optimization: check if we really need to rebuild
        // But for simplicity, just rebuild or be smarter?
        // Let's rebuild for now.
        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += `<div>${i}</div>`;
        }
        gutter.innerHTML = html;
    }
}

function handleCodeInput(windowId, e) {
    const textarea = document.getElementById(`code-area-${windowId}`);
    if (!textarea) return;

    if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert 4 spaces
        textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);

        // Move cursor
        textarea.selectionStart = textarea.selectionEnd = start + 4;

        // Trigger input event manually or update line numbers
        updateLineNumbers(windowId);
    }
}

function saveCode(windowId) {
    const textarea = document.getElementById(`code-area-${windowId}`);
    const content = textarea.value;
    const filename = prompt("Enter filename to save (e.g., script.js):", "script.js");

    if (filename) {
        if (filename.includes('/') || filename.includes('\\')) {
             alert("Invalid name");
             return;
        }
        fileSystem[filename] = content;
        saveFileSystem();
        showNotification('Code Editor', `File "${filename}" saved.`);
    }
}

function downloadCode(windowId) {
    const textarea = document.getElementById(`code-area-${windowId}`);
    const content = textarea.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'code.txt';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

function openCodeFile(windowId, input) {
    const textarea = document.getElementById(`code-area-${windowId}`);

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            textarea.value = e.target.result;
            updateLineNumbers(windowId);
        };
        reader.readAsText(input.files[0]);
    }
}

// Recycle Bin App Logic
const recycleBinStates = {};

function loadRecycleBin() {
    try {
        const saved = localStorage.getItem('webos-recyclebin');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load recycle bin:', e);
        return [];
    }
}

function saveRecycleBin(items) {
    localStorage.setItem('webos-recyclebin', JSON.stringify(items));
}

function moveToRecycleBin(filepath) {
    const items = loadRecycleBin();
    if (fileSystem[filepath] !== undefined) {
        items.push({
            id: 'rb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            path: filepath,
            content: fileSystem[filepath],
            isDirectory: fileSystem[filepath] === 'directory',
            deletedAt: new Date().toISOString()
        });
        saveRecycleBin(items);
    }
    delete fileSystem[filepath];
    saveFileSystem();
}

function initRecycleBin(windowId) {
    if (!recycleBinStates[windowId]) {
        recycleBinStates[windowId] = { items: loadRecycleBin() };
    }
    renderRecycleBin(windowId);
}

function renderRecycleBin(windowId) {
    const container = document.getElementById(`recyclebin-container-${windowId}`);
    if (!container) return;

    const state = recycleBinStates[windowId];
    const items = state.items || [];

    let html = `
        <div class="recyclebin-header">
            <div class="recyclebin-info">
                <span class="recyclebin-icon">🗑️</span>
                <h2>Recycle Bin</h2>
                <span class="recyclebin-count">${items.length} item${items.length === 1 ? '' : 's'}</span>
            </div>
            <div class="recyclebin-actions">
                <button class="recyclebin-btn" onclick="restoreAllRecycleBinItems('${windowId}')" ${items.length === 0 ? 'disabled' : ''}>Restore All</button>
                <button class="recyclebin-btn danger" onclick="emptyRecycleBin('${windowId}')" ${items.length === 0 ? 'disabled' : ''}>Empty Bin</button>
            </div>
        </div>
        <div class="recyclebin-list">
    `;

    if (items.length === 0) {
        html += `
            <div class="recyclebin-empty">
                <div class="recyclebin-empty-icon">🗑️</div>
                <div class="recyclebin-empty-text">The Recycle Bin is empty.</div>
                <div class="recyclebin-empty-hint">Deleted files from the File Explorer will appear here.</div>
            </div>
        `;
    } else {
        const sortedItems = [...items].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        sortedItems.forEach(item => {
            const dateObj = new Date(item.deletedAt);
            const dateStr = dateObj.toLocaleString();
            const safePath = escapeHtml(item.path);
            const displayName = item.path.split('/').pop() || item.path;

            html += `
                <div class="recyclebin-item">
                    <div class="recyclebin-item-icon">${item.isDirectory ? '📁' : '📄'}</div>
                    <div class="recyclebin-item-info">
                        <div class="recyclebin-item-name" title="${safePath}">${escapeHtml(displayName)}</div>
                        <div class="recyclebin-item-path">${safePath}</div>
                        <div class="recyclebin-item-date">Deleted: ${escapeHtml(dateStr)}</div>
                    </div>
                    <div class="recyclebin-item-actions">
                        <button class="recyclebin-btn small" onclick="restoreRecycleBinItem('${windowId}', '${item.id}')">Restore</button>
                        <button class="recyclebin-btn small danger" onclick="deleteRecycleBinItem('${windowId}', '${item.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    container.innerHTML = html;
}

function restoreRecycleBinItem(windowId, itemId) {
    const state = recycleBinStates[windowId];
    if (!state) return;
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    if (fileSystem[item.path] !== undefined) {
        alert(`Cannot restore "${item.path}" — a file with that name already exists.`);
        return;
    }

    fileSystem[item.path] = item.content;
    saveFileSystem();
    state.items = state.items.filter(i => i.id !== itemId);
    saveRecycleBin(state.items);
    renderRecycleBin(windowId);
    showNotification('Recycle Bin', `Restored "${item.path}"`);
}

function deleteRecycleBinItem(windowId, itemId) {
    const state = recycleBinStates[windowId];
    if (!state) return;
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Permanently delete "${item.path}"? This cannot be undone.`)) return;

    state.items = state.items.filter(i => i.id !== itemId);
    saveRecycleBin(state.items);
    renderRecycleBin(windowId);
    showNotification('Recycle Bin', `Permanently deleted "${item.path}"`);
}

function emptyRecycleBin(windowId) {
    const state = recycleBinStates[windowId];
    if (!state || state.items.length === 0) return;

    if (!confirm(`Permanently delete all ${state.items.length} item(s) in the Recycle Bin? This cannot be undone.`)) return;

    state.items = [];
    saveRecycleBin(state.items);
    renderRecycleBin(windowId);
    showNotification('Recycle Bin', 'Recycle Bin emptied.');
}

function restoreAllRecycleBinItems(windowId) {
    const state = recycleBinStates[windowId];
    if (!state || state.items.length === 0) return;

    let restored = 0;
    let conflicts = 0;
    const remaining = [];
    state.items.forEach(item => {
        if (fileSystem[item.path] === undefined) {
            fileSystem[item.path] = item.content;
            restored++;
        } else {
            remaining.push(item);
            conflicts++;
        }
    });
    saveFileSystem();
    state.items = remaining;
    saveRecycleBin(state.items);
    renderRecycleBin(windowId);

    let msg = `Restored ${restored} item(s).`;
    if (conflicts > 0) msg += ` ${conflicts} skipped (name conflict).`;
    showNotification('Recycle Bin', msg);
}
