// js/core/window-manager.js
import { EventBus } from './event-bus.js';

const eventBus = new EventBus();

export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindowId = null;
        this.zIndexCounter = 100;
    }

    createWindow(options) {
        const id = options.id || 'win_' + Math.random().toString(36).substr(2, 9);
        const title = options.title || 'Window';
        const icon = options.icon || '📁';
        const width = options.width || 600;
        const height = options.height || 400;
        const x = options.x || Math.max(50, (window.innerWidth - width) / 2);
        const y = options.y || Math.max(50, (window.innerHeight - height) / 2);

        if (this.windows.has(id)) {
            this.focusWindow(id);
            return this.windows.get(id);
        }

        const winEl = document.createElement('div');
        winEl.className = 'os-window';
        winEl.style.width = width + 'px';
        winEl.style.height = height + 'px';
        winEl.style.left = x + 'px';
        winEl.style.top = y + 'px';
        winEl.style.zIndex = ++this.zIndexCounter;
        winEl.dataset.windowId = id;

        winEl.innerHTML = `
            <div class="os-window-header">
                <div class="os-window-title"><span class="win-icon">${icon}</span> <span class="win-title-text">${title}</span></div>
                <div class="os-window-controls">
                    <button class="win-minimize" title="Minimize">_</button>
                    <button class="win-maximize" title="Maximize">□</button>
                    <button class="win-close" title="Close">×</button>
                </div>
            </div>
            <div class="os-window-body"></div>
        `;

        document.body.appendChild(winEl);

        const winObj = {
            id,
            element: winEl,
            title,
            isMaximized: false,
            isMinimized: false,
            prevRect: null
        };

        this.windows.set(id, winObj);
        this.setupWindowEvents(winObj);
        this.focusWindow(id);

        eventBus.emit('window:created', { id, title });
        return winObj;
    }

    setupWindowEvents(winObj) {
        const { id, element } = winObj;
        const header = element.querySelector('.os-window-header');
        
        element.addEventListener('mousedown', () => {
            this.focusWindow(id);
        });

        header.querySelector('.win-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(id);
        });

        header.querySelector('.win-maximize').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize(id);
        });

        header.querySelector('.win-minimize').addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(id);
        });

        // Dragging logic
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = element.offsetLeft;
            initialTop = element.offsetTop;
            this.focusWindow(id);
            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = Math.max(0, initialLeft + dx) + 'px';
            element.style.top = Math.max(0, initialTop + dy) + 'px';
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        winObj._cleanup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    focusWindow(id) {
        if (!this.windows.has(id)) return;
        this.windows.forEach((win, winId) => {
            if (winId === id) {
                win.element.style.zIndex = ++this.zIndexCounter;
                win.element.classList.add('active');
                this.activeWindowId = id;
            } else {
                win.element.classList.remove('active');
            }
        });
        eventBus.emit('window:focused', { id });
    }

    closeWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;
        if (typeof win._cleanup === 'function') win._cleanup();
        win.element.remove();
        this.windows.delete(id);
        eventBus.emit('window:closed', { id });
    }

    toggleMaximize(id) {
        const win = this.windows.get(id);
        if (!win) return;
        if (!win.isMaximized) {
            win.prevRect = {
                left: win.element.style.left,
                top: win.element.style.top,
                width: win.element.style.width,
                height: win.element.style.height
            };
            win.element.style.left = '0px';
            win.element.style.top = '0px';
            win.element.style.width = '100vw';
            win.element.style.height = 'calc(100vh - 40px)';
            win.element.classList.add('maximized');
            win.isMaximized = true;
        } else {
            if (win.prevRect) {
                win.element.style.left = win.prevRect.left;
                win.element.style.top = win.prevRect.top;
                win.element.style.width = win.prevRect.width;
                win.element.style.height = win.prevRect.height;
            }
            win.element.classList.remove('maximized');
            win.isMaximized = false;
        }
    }

    minimizeWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;
        win.element.style.display = 'none';
        win.isMinimized = true;
        eventBus.emit('window:minimized', { id });
    }
}

export const windowManager = new WindowManager();
export default windowManager;
