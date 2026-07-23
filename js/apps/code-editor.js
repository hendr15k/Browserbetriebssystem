// js/apps/code-editor.js
/**
 * WebOS Code Editor App — ESM module with syntax highlighting, tabs, undo/redo, VFS integration, and JSON validation.
 */
import Utils from '../core/utils.js';

export class CodeEditorApp {
    constructor() {
        this.tabs = []; // { id, path, content, history: [], historyIndex: -1, dirty: false }
        this.activeTabId = null;
        this.container = null;
        this.mountPath = '/home/user/code/';
    }

    async init(container, options = {}) {
        this.container = container;
        this.render();
        this.setupEvents();
        
        // Open default untitled tab
        await this.newTab('untitled.js', '// Write your JS code here\nconsole.log("Hello WebOS!");\n');
        
        if (options.filePath) {
            await this.openFile(options.filePath);
        }
    }

    render() {
        if (!this.container) return;
        this.container.className = 'code-editor-app os-app-container';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';
        this.container.style.background = '#1e1e1e';
        this.container.style.color = '#d4d4d4';
        this.container.style.fontFamily = 'monospace';

        this.container.innerHTML = `
            <div class="ce-toolbar" style="display:flex;gap:6px;padding:6px;background:#252526;border-bottom:1px solid #333;align-items:center;">
                <button class="ce-btn ce-new" title="New File">New</button>
                <button class="ce-btn ce-open" title="Open File">Open</button>
                <button class="ce-btn ce-save" title="Save File">Save</button>
                <button class="ce-btn ce-run" title="Run / Validate">Run/Validate</button>
                <span style="flex-grow:1;"></span>
                <span class="ce-status" style="font-size:12px;color:#888;">Ready</span>
            </div>
            <div class="ce-tabs" style="display:flex;background:#2d2d2d;overflow-x:auto;border-bottom:1px solid #333;min-height:30px;"></div>
            <div class="ce-editor-area" style="position:relative;flex-grow:1;display:flex;overflow:hidden;">
                <textarea class="ce-textarea" spellcheck="false" style="position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;color:transparent;caret-color:#fff;resize:none;border:none;padding:10px;font-family:monospace;font-size:14px;line-height:1.5;z-index:2;white-space:pre;overflow:auto;outline:none;"></textarea>
                <pre class="ce-highlight" style="position:absolute;top:0;left:0;width:100%;height:100%;margin:0;padding:10px;font-family:monospace;font-size:14px;line-height:1.5;z-index:1;pointer-events:none;white-space:pre;overflow:auto;"><code class="ce-code"></code></pre>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;
        const textarea = this.container.querySelector('.ce-textarea');
        const highlight = this.container.querySelector('.ce-code');

        this.container.querySelector('.ce-new').addEventListener('click', () => this.newTab());
        this.container.querySelector('.ce-open').addEventListener('click', () => this.promptOpen());
        this.container.querySelector('.ce-save').addEventListener('click', () => this.saveActiveFile());
        this.container.querySelector('.ce-run').addEventListener('click', () => this.runOrValidate());

        textarea.addEventListener('scroll', () => {
            highlight.scrollTop = textarea.scrollTop;
            highlight.scrollLeft = textarea.scrollLeft;
        });

        textarea.addEventListener('input', () => {
            const tab = this.getActiveTab();
            if (!tab) return;
            tab.content = textarea.value;
            tab.dirty = true;
            this.pushHistory(tab, tab.content);
            this.updateHighlight();
            this.updateTabHeader();
        });

        textarea.addEventListener('keydown', (e) => {
            const tab = this.getActiveTab();
            if (!tab) return;

            // Tab indentation
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                tab.content = textarea.value;
                tab.dirty = true;
                this.pushHistory(tab, tab.content);
                this.updateHighlight();
            }

            // Undo / Redo (Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z)
            if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (e.shiftKey) {
                    this.redo();
                } else {
                    this.undo();
                }
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveActiveFile();
            }
        });
    }

    async newTab(filename = 'untitled.js', content = '') {
        const id = 'tab_' + Math.random().toString(36).substr(2, 6);
        const tab = {
            id,
            path: this.mountPath + filename,
            content,
            history: [content],
            historyIndex: 0,
            dirty: false
        };
        this.tabs.push(tab);
        this.switchTab(id);
        return tab;
    }

    switchTab(id) {
        this.activeTabId = id;
        const tab = this.getActiveTab();
        if (!tab) return;
        const textarea = this.container.querySelector('.ce-textarea');
        textarea.value = tab.content;
        this.updateHighlight();
        this.renderTabs();
    }

    closeTab(id) {
        const idx = this.tabs.findIndex(t => t.id === id);
        if (idx === -1) return;
        this.tabs.splice(idx, 1);
        if (this.activeTabId === id) {
            if (this.tabs.length > 0) {
                this.switchTab(this.tabs[this.tabs.length - 1].id);
            } else {
                this.newTab();
            }
        } else {
            this.renderTabs();
        }
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    renderTabs() {
        const tabsEl = this.container.querySelector('.ce-tabs');
        if (!tabsEl) return;
        tabsEl.innerHTML = this.tabs.map(t => {
            const name = t.path.split('/').pop();
            const active = t.id === this.activeTabId ? 'background:#1e1e1e;border-top:2px solid #007acc;' : 'background:#2d2d2d;color:#888;';
            const dirtyMarker = t.dirty ? ' *' : '';
            return `<div class="ce-tab" data-id="${t.id}" style="padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;border-right:1px solid #333;${active}">
                <span class="ce-tab-title" data-action="switch">${Utils.escapeHtml(name)}${dirtyMarker}</span>
                <span class="ce-tab-close" data-action="close" style="font-size:14px;padding:0 4px;border-radius:3px;">×</span>
            </div>`;
        }).join('');

        tabsEl.querySelectorAll('.ce-tab').forEach(el => {
            const id = el.dataset.id;
            el.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'close') {
                    e.stopPropagation();
                    this.closeTab(id);
                } else {
                    this.switchTab(id);
                }
            });
        });
    }

    updateTabHeader() {
        this.renderTabs();
    }

    pushHistory(tab, content) {
        if (tab.history[tab.historyIndex] === content) return;
        // Truncate redo stack
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        tab.history.push(content);
        if (tab.history.length > 50) {
            tab.history.shift();
        } else {
            tab.historyIndex++;
        }
    }

    undo() {
        const tab = this.getActiveTab();
        if (!tab || tab.historyIndex <= 0) return;
        tab.historyIndex--;
        tab.content = tab.history[tab.historyIndex];
        const textarea = this.container.querySelector('.ce-textarea');
        textarea.value = tab.content;
        this.updateHighlight();
        tab.dirty = true;
    }

    redo() {
        const tab = this.getActiveTab();
        if (!tab || tab.historyIndex >= tab.history.length - 1) return;
        tab.historyIndex++;
        tab.content = tab.history[tab.historyIndex];
        const textarea = this.container.querySelector('.ce-textarea');
        textarea.value = tab.content;
        this.updateHighlight();
        tab.dirty = true;
    }

    updateHighlight() {
        const tab = this.getActiveTab();
        const highlight = this.container.querySelector('.ce-code');
        if (!tab || !highlight) return;
        const code = tab.content || '';
        const ext = tab.path.split('.').pop().toLowerCase();
        highlight.innerHTML = this.tokenize(code, ext);
    }

    tokenize(code, ext) {
        const escaped = Utils.escapeHtml(code);
        if (ext === 'json') {
            return escaped
                .replace(/(&quot;[^&]*&quot;)(\s*:)?/g, (match, p1, p2) => p2 ? `<span style="color:#9cdcfe;">${p1}</span>${p2}` : `<span style="color:#ce9178;">${p1}</span>`)
                .replace(/\b(true|false|null)\b/g, '<span style="color:#569cd6;">$1</span>')
                .replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
        } else if (ext === 'html') {
            return escaped
                .replace(/(&lt;\/?[a-z0-9-]+)([^&]*)(&gt;)/gi, '<span style="color:#808080;">$1</span><span style="color:#9cdcfe;">$2</span><span style="color:#808080;">$3</span>')
                .replace(/(&quot;[^&]*&quot;)/g, '<span style="color:#ce9178;">$1</span>');
        } else if (ext === 'css') {
            return escaped
                .replace(/([a-z-]+\s*)(?=:)/gi, '<span style="color:#9cdcfe;">$1</span>')
                .replace(/(&quot;[^&]*&quot;|'[^']*')/g, '<span style="color:#ce9178;">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955;">$1</span>');
        } else {
            // Default JS / TS tokenizer
            return escaped
                .replace(/\/\/.*/g, '<span style="color:#6a9955;font-style:italic;">$&</span>')
                .replace(/(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g, '<span style="color:#ce9178;">$1</span>')
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch)\b/g, '<span style="color:#c586c0;font-weight:bold;">$1</span>')
                .replace(/\b(true|false|null|undefined)\b/g, '<span style="color:#569cd6;">$1</span>')
                .replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
        }
    }

    async saveActiveFile() {
        const tab = this.getActiveTab();
        if (!tab) return;
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (vfs) {
            await vfs.writeFile(tab.path, tab.content);
            tab.dirty = false;
            this.updateTabHeader();
            this.setStatus(`Saved ${tab.path}`);
        } else {
            this.setStatus('VFS not available');
        }
    }

    async openFile(path) {
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (!vfs) return;
        const content = await vfs.readFile(path);
        if (content !== null) {
            const existing = this.tabs.find(t => t.path === path);
            if (existing) {
                existing.content = content;
                this.switchTab(existing.id);
            } else {
                const tab = await this.newTab(path.split('/').pop(), content);
                tab.path = path;
                tab.dirty = false;
                this.renderTabs();
            }
            this.setStatus(`Opened ${path}`);
        } else {
            this.setStatus(`File not found: ${path}`);
        }
    }

    async promptOpen() {
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (!vfs) return;
        const files = await vfs.listFiles();
        const chosen = prompt('Open file from VFS:\n' + files.join('\n'));
        if (chosen) {
            await this.openFile(chosen);
        }
    }

    runOrValidate() {
        const tab = this.getActiveTab();
        if (!tab) return;
        const ext = tab.path.split('.').pop().toLowerCase();
        if (ext === 'json') {
            try {
                JSON.parse(tab.content);
                this.setStatus('JSON is valid ✓');
                alert('JSON Validation: Valid JSON!');
            } catch (e) {
                this.setStatus(`JSON Error: ${e.message}`);
                alert(`JSON Validation Error:\n${e.message}`);
            }
        } else if (ext === 'js') {
            try {
                // Safe check syntax by Function constructor
                new Function(tab.content);
                this.setStatus('JS Syntax Valid ✓');
                alert('JS Syntax Validation: Valid!');
            } catch (e) {
                this.setStatus(`JS Error: ${e.message}`);
                alert(`JS Syntax Error:\n${e.message}`);
            }
        } else {
            this.setStatus(`Run/Validate not applicable for .${ext}`);
            alert(`File type .${ext} content loaded.`);
        }
    }

    setStatus(msg) {
        if (!this.container) return;
        const statusEl = this.container.querySelector('.ce-status');
        if (statusEl) statusEl.textContent = msg;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSCodeEditorApp = CodeEditorApp;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CodeEditorApp };
}
