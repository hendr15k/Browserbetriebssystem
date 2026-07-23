// js/apps/browser.js
/**
 * WebOS Mini-Browser App — DOMParser rendering, history stack, VFS bookmarks, and sandboxed iframe.
 */
import Utils from '../core/utils.js';

export class BrowserApp {
    constructor() {
        this.container = null;
        this.history = [];
        this.historyIndex = -1;
        this.bookmarksPath = '/home/user/bookmarks.json';
        this.bookmarks = [];
    }

    async init(container, options = {}) {
        this.container = container;
        await this.loadBookmarks();
        this.render();
        this.setupEvents();
        
        const startUrl = options.url || 'http://start.webos';
        await this.navigateTo(startUrl);
    }

    render() {
        if (!this.container) return;
        this.container.className = 'browser-app os-app-container';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';
        this.container.style.background = '#ffffff';
        this.container.style.color = '#333333';
        this.container.style.fontFamily = 'sans-serif';

        this.container.innerHTML = `
            <div class="browser-toolbar" style="display:flex;gap:6px;padding:8px;background:#f0f0f0;border-bottom:1px solid #ddd;align-items:center;">
                <button class="b-back" title="Back">←</button>
                <button class="b-forward" title="Forward">→</button>
                <button class="b-reload" title="Reload">↻</button>
                <input type="text" class="b-url" style="flex-grow:1;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;" />
                <button class="b-go" title="Go">Go</button>
                <button class="b-bookmark" title="Bookmark">★</button>
            </div>
            <div class="browser-content" style="flex-grow:1;position:relative;overflow:auto;background:#fff;">
                <iframe class="b-iframe" sandbox="allow-same-origin" style="width:100%;height:100%;border:none;display:none;"></iframe>
                <div class="b-dom-render" style="padding:16px;width:100%;height:100%;box-sizing:border-box;overflow:auto;"></div>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;
        const urlInput = this.container.querySelector('.b-url');

        this.container.querySelector('.b-back').addEventListener('click', () => this.goBack());
        this.container.querySelector('.b-forward').addEventListener('click', () => this.goForward());
        this.container.querySelector('.b-reload').addEventListener('click', () => this.reload());
        this.container.querySelector('.b-go').addEventListener('click', () => this.navigateTo(urlInput.value));
        this.container.querySelector('.b-bookmark').addEventListener('click', () => this.toggleBookmark(urlInput.value));

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigateTo(urlInput.value);
            }
        });
    }

    async loadBookmarks() {
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (!vfs) return;
        const raw = await vfs.readFile(this.bookmarksPath);
        if (raw) {
            try {
                this.bookmarks = JSON.parse(raw);
            } catch (e) {
                this.bookmarks = [];
            }
        } else {
            this.bookmarks = [
                { title: 'WebOS Start', url: 'http://start.webos' },
                { title: 'Local Docs', url: 'vfs:///home/user/docs.html' }
            ];
            await vfs.writeFile(this.bookmarksPath, JSON.stringify(this.bookmarks, null, 2));
        }
    }

    async saveBookmarks() {
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (!vfs) return;
        await vfs.writeFile(this.bookmarksPath, JSON.stringify(this.bookmarks, null, 2));
    }

    async toggleBookmark(url) {
        if (!url) return;
        const idx = this.bookmarks.findIndex(b => b.url === url);
        if (idx !== -1) {
            this.bookmarks.splice(idx, 1);
            alert('Bookmark removed!');
        } else {
            this.bookmarks.push({ title: url, url });
            alert('Bookmark added!');
        }
        await this.saveBookmarks();
    }

    async navigateTo(url) {
        if (!url) return;
        url = url.trim();
        const urlInput = this.container.querySelector('.b-url');
        urlInput.value = url;

        // Push to history stack
        if (this.historyIndex === -1 || this.history[this.historyIndex] !== url) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(url);
            this.historyIndex = this.history.length - 1;
        }

        const domRender = this.container.querySelector('.b-dom-render');
        const iframe = this.container.querySelector('.b-iframe');

        if (url.startsWith('vfs://')) {
            const vfsPath = url.replace('vfs://', '');
            const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
            if (vfs) {
                const content = await vfs.readFile(vfsPath);
                if (content !== null) {
                    iframe.style.display = 'none';
                    domRender.style.display = 'block';
                    // Render via DOMParser
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    domRender.innerHTML = '';
                    domRender.appendChild(document.importNode(doc.body, true));
                } else {
                    domRender.style.display = 'block';
                    iframe.style.display = 'none';
                    domRender.innerHTML = `<h2>404 Not Found</h2><p>VFS file not found: ${Utils.escapeHtml(vfsPath)}</p>`;
                }
            }
        } else if (url === 'http://start.webos' || url === 'https://start.webos' || url === 'about:blank') {
            iframe.style.display = 'none';
            domRender.style.display = 'block';
            domRender.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <h1>🌐 WebOS Mini-Browser</h1>
                    <p>Welcome to the secure sandboxed browser.</p>
                    <h3>Bookmarks:</h3>
                    <ul style="list-style:none;padding:0;">
                        ${this.bookmarks.map(b => `<li style="margin:8px 0;"><a href="#" class="b-link" data-url="${b.url}" style="color:#0078d7;text-decoration:underline;">${Utils.escapeHtml(b.title)} (${Utils.escapeHtml(b.url)})</a></li>`).join('')}
                    </ul>
                </div>
            `;
            domRender.querySelectorAll('.b-link').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateTo(el.dataset.url);
                });
            });
        } else {
            // Sandboxed iframe for external / web URLs
            domRender.style.display = 'none';
            iframe.style.display = 'block';
            try {
                iframe.src = url;
            } catch (e) {
                domRender.style.display = 'block';
                iframe.style.display = 'none';
                domRender.innerHTML = `<h2>Navigation Blocked</h2><p>Unable to load URL due to security restrictions.</p>`;
            }
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.navigateTo(this.history[this.historyIndex]);
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.navigateTo(this.history[this.historyIndex]);
        }
    }

    reload() {
        if (this.historyIndex >= 0) {
            this.navigateTo(this.history[this.historyIndex]);
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSBrowserApp = BrowserApp;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BrowserApp };
}
