// js/apps/markdown-editor.js
/**
 * WebOS Markdown Editor App — Split view markdown editor with custom parser, syntax highlighting, word count, and exports.
 */
import Utils from '../core/utils.js';

export class MarkdownEditorApp {
    constructor() {
        this.container = null;
        this.content = '# Welcome to Markdown Editor\n\nWrite **bold**, *italic*, [links](https://example.com), and code blocks.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("Hello");\n```\n';
        this.currentFilePath = '/home/user/documents/readme.md';
    }

    async init(container, options = {}) {
        this.container = container;
        if (options.filePath) {
            this.currentFilePath = options.filePath;
            await this.loadFile();
        }
        this.render();
        this.setupEvents();
        this.updatePreview();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'markdown-editor-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1e1e1e;color:#d4d4d4;font-family:sans-serif;font-size:13px;';

        this.container.innerHTML = `
            <div class="mde-toolbar" style="display:flex;gap:6px;padding:8px;background:#252526;border-bottom:1px solid #333;align-items:center;">
                <button class="mde-btn mde-new" title="New">New</button>
                <button class="mde-btn mde-open" title="Open">Open</button>
                <button class="mde-btn mde-save" title="Save">Save</button>
                <button class="mde-btn mde-export-html" title="Export HTML">Export HTML</button>
                <span style="flex-grow:1;"></span>
                <span class="mde-stats" style="font-size:12px;color:#888;">0 words | 0 min read</span>
            </div>
            <div class="mde-body" style="display:flex;flex-grow:1;overflow:hidden;">
                <div class="mde-pane-editor" style="flex:1;display:flex;flex-direction:column;border-right:1px solid #333;position:relative;">
                    <textarea class="mde-textarea" spellcheck="false" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#1e1e1e;color:#d4d4d4;resize:none;border:none;padding:12px;font-family:monospace;font-size:14px;line-height:1.5;outline:none;white-space:pre-wrap;"></textarea>
                </div>
                <div class="mde-pane-preview" style="flex:1;padding:12px;overflow:auto;background:#252526;color:#e0e0e0;line-height:1.6;"></div>
            </div>
        `;
        this.container.querySelector('.mde-textarea').value = this.content;
    }

    setupEvents() {
        if (!this.container) return;
        const textarea = this.container.querySelector('.mde-textarea');

        this.container.querySelector('.mde-new').addEventListener('click', () => {
            this.content = '# New Document\n';
            textarea.value = this.content;
            this.updatePreview();
        });

        this.container.querySelector('.mde-open').addEventListener('click', () => this.promptOpen());
        this.container.querySelector('.mde-save').addEventListener('click', () => this.saveFile());
        this.container.querySelector('.mde-export-html').addEventListener('click', () => this.exportHtml());

        textarea.addEventListener('input', () => {
            this.content = textarea.value;
            this.updatePreview();
        });
    }

    updatePreview() {
        if (!this.container) return;
        const preview = this.container.querySelector('.mde-pane-preview');
        const stats = this.container.querySelector('.mde-stats');

        const html = this.parseMarkdown(this.content);
        if (preview) preview.innerHTML = html;

        // stats
        const words = this.content.trim() ? this.content.trim().split(/\s+/).length : 0;
        const readingTime = Math.ceil(words / 200);
        if (stats) stats.textContent = `${words} words | ${readingTime} min read`;
    }

    parseMarkdown(md) {
        if (!md) return '';
        let lines = md.split('\n');
        let html = '';
        let inCodeBlock = false;
        let codeLang = '';
        let codeBuffer = [];
        let inTable = false;
        let tableRows = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Code block toggle
            if (line.startsWith('```')) {
                if (inCodeBlock) {
                    html += `<pre style="background:#111;padding:10px;border-radius:4px;overflow-x:auto;"><code class="language-${codeLang}">${Utils.escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
                    codeBuffer = [];
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeLang = line.substring(3).trim();
                }
                continue;
            }

            if (inCodeBlock) {
                codeBuffer.push(line);
                continue;
            }

            // Tables
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                tableRows.push(line);
                continue;
            } else if (inTable) {
                html += this.renderTable(tableRows);
                inTable = false;
                tableRows = [];
            }

            // Headings
            if (line.startsWith('# ')) {
                html += `<h1 style="font-size:24px;font-weight:bold;margin:16px 0 8px 0;border-bottom:1px solid #444;padding-bottom:6px;">${this.inlineMarkdown(line.substring(2))}</h1>\n`;
                continue;
            }
            if (line.startsWith('## ')) {
                html += `<h2 style="font-size:20px;font-weight:bold;margin:14px 0 6px 0;">${this.inlineMarkdown(line.substring(3))}</h2>\n`;
                continue;
            }
            if (line.startsWith('### ')) {
                html += `<h3 style="font-size:16px;font-weight:bold;margin:12px 0 4px 0;">${this.inlineMarkdown(line.substring(4))}</h3>\n`;
                continue;
            }

            // Blockquote
            if (line.startsWith('> ')) {
                html += `<blockquote style="border-left:4px solid #007acc;margin:10px 0;padding:4px 12px;color:#aaa;background:#2a2a2a;">${this.inlineMarkdown(line.substring(2))}</blockquote>\n`;
                continue;
            }

            // Unordered list
            if (line.startsWith('- ') || line.startsWith('* ')) {
                html += `<ul style="margin:6px 0;padding-left:20px;"><li style="margin:4px 0;">${this.inlineMarkdown(line.substring(2))}</li></ul>\n`;
                continue;
            }

            // Paragraph
            if (line.trim() === '') {
                html += '<br/>\n';
            } else {
                html += `<p style="margin:8px 0;">${this.inlineMarkdown(line)}</p>\n`;
            }
        }

        if (inCodeBlock) {
            html += `<pre style="background:#111;padding:10px;border-radius:4px;"><code class="language-${codeLang}">${Utils.escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
        }
        if (inTable) {
            html += this.renderTable(tableRows);
        }

        return html;
    }

    renderTable(rows) {
        if (rows.length === 0) return '';
        let tableHtml = '<table style="border-collapse:collapse;margin:10px 0;width:100%;">\n';
        let isHeader = true;

        for (let r = 0; r < rows.length; r++) {
            let row = rows[r].trim();
            if (row.startsWith('|')) row = row.substring(1);
            if (row.endsWith('|')) row = row.substring(0, row.length - 1);
            let cells = row.split('|').map(c => c.trim());

            // Check separator row like |---|---|
            if (cells.every(c => /^[:\-]+$/.test(c))) {
                isHeader = false;
                continue;
            }

            tableHtml += '<tr>\n';
            for (let c = 0; c < cells.length; c++) {
                const tag = isHeader ? 'th' : 'td';
                const style = isHeader ? 'border:1px solid #555;background:#333;padding:6px;font-weight:bold;text-align:left;' : 'border:1px solid #444;padding:6px;';
                tableHtml += `<${tag} style="${style}">${this.inlineMarkdown(cells[c])}</${tag}>\n`;
            }
            tableHtml += '</tr>\n';
            isHeader = false;
        }
        tableHtml += '</table>\n';
        return tableHtml;
    }

    inlineMarkdown(text) {
        if (!text) return '';
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Links
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#3794ff;text-decoration:underline;">$1</a>');
        // Images
        text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;" />');
        return text;
    }

    async promptOpen() {
        const path = prompt('Open Markdown file path:', this.currentFilePath);
        if (!path) return;
        this.currentFilePath = path;
        await this.loadFile();
    }

    async loadFile() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            if (await vfs.exists(this.currentFilePath)) {
                this.content = await vfs.readFile(this.currentFilePath);
                if (this.container) {
                    const textarea = this.container.querySelector('.mde-textarea');
                    if (textarea) textarea.value = this.content;
                    this.updatePreview();
                }
            }
        } catch (e) {
            console.error('Failed to load markdown file', e);
        }
    }

    async saveFile() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            await vfs.writeFile(this.currentFilePath, this.content);
            alert('Saved to ' + this.currentFilePath);
        } catch (e) {
            console.error('Failed to save markdown file', e);
        }
    }

    async exportHtml() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            const htmlPath = this.currentFilePath.replace(/\.[^/.]+$/, '') + '.html';
            const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title></head><body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;background:#f9f9f9;color:#333;">${this.parseMarkdown(this.content)}</body></html>`;
            await vfs.writeFile(htmlPath, fullHtml);
            alert('Exported HTML to ' + htmlPath);
        } catch (e) {
            console.error('Failed to export HTML', e);
        }
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default MarkdownEditorApp;
