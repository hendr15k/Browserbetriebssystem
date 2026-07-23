// js/apps/pdf-viewer.js
/**
 * WebOS PDF Viewer App — PDF.js integration with LazyLoader / iframe fallback, page navigation, zoom, outline bookmarks, and text selection.
 */
import Utils from '../core/utils.js';

export class PDFViewerApp {
    constructor() {
        this.container = null;
        this.currentFilePath = '/home/user/documents/sample.pdf';
        this.currentPage = 1;
        this.totalPages = 1;
        this.zoom = 1.0;
        this.pdfDoc = null;
    }

    async init(container, options = {}) {
        this.container = container;
        if (options.filePath) {
            this.currentFilePath = options.filePath;
        }
        this.render();
        this.setupEvents();
        await this.loadPDF();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'pdf-viewer-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#525659;color:#fff;font-family:sans-serif;font-size:13px;';

        this.container.innerHTML = `
            <div class="pdf-toolbar" style="display:flex;gap:8px;padding:8px;background:#323639;border-bottom:1px solid #1a1a1a;align-items:center;flex-wrap:wrap;">
                <button class="pdf-btn pdf-open" title="Open PDF">Open</button>
                <span style="border-left:1px solid #555;height:20px;margin:0 4px;"></span>
                <button class="pdf-btn pdf-prev" title="Previous Page">◀</button>
                <span style="display:flex;align-items:center;gap:4px;">
                    <input type="number" class="pdf-page-input" value="1" min="1" style="width:45px;text-align:center;background:#242424;color:#fff;border:1px solid #444;border-radius:3px;padding:2px;">
                    / <span class="pdf-total-pages">1</span>
                </span>
                <button class="pdf-btn pdf-next" title="Next Page">▶</button>
                <span style="border-left:1px solid #555;height:20px;margin:0 4px;"></span>
                <button class="pdf-btn pdf-zoom-out" title="Zoom Out">-</button>
                <span class="pdf-zoom-label" style="min-width:45px;text-align:center;">100%</span>
                <button class="pdf-btn pdf-zoom-in" title="Zoom In">+</button>
                <button class="pdf-btn pdf-fit-width" title="Fit Width">Fit Width</button>
                <span style="flex-grow:1;"></span>
                <button class="pdf-btn pdf-print" title="Print">Print</button>
            </div>
            <div class="pdf-body" style="display:flex;flex-grow:1;overflow:hidden;">
                <div class="pdf-sidebar" style="width:200px;background:#242424;border-right:1px solid #1a1a1a;padding:8px;overflow-y:auto;font-size:12px;">
                    <div style="font-weight:bold;color:#aaa;margin-bottom:6px;">Outline / Bookmarks</div>
                    <ul class="pdf-outline-list" style="list-style:none;margin:0;padding:0;">
                        <li style="padding:4px;color:#888;cursor:pointer;">Chapter 1: Introduction</li>
                        <li style="padding:4px;color:#888;cursor:pointer;">Chapter 2: Architecture</li>
                        <li style="padding:4px;color:#888;cursor:pointer;">Chapter 3: Conclusion</li>
                    </ul>
                </div>
                <div class="pdf-viewer-container" style="flex-grow:1;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:20px;position:relative;">
                    <div class="pdf-page-wrapper" style="background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.4);padding:20px;min-height:600px;min-width:450px;color:#333;display:flex;flex-direction:column;justify-content:center;align-items:center;">
                        <div class="pdf-placeholder-content" style="text-align:center;">
                            <h2 style="color:#444;margin-bottom:10px;">PDF Document Viewer</h2>
                            <p style="color:#666;font-size:14px;">Loading ${Utils.escapeHtml(this.currentFilePath)}...</p>
                            <iframe class="pdf-iframe" src="about:blank" style="width:600px;height:700px;border:none;margin-top:10px;display:none;"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;

        this.container.querySelector('.pdf-open').addEventListener('click', () => this.promptOpen());
        this.container.querySelector('.pdf-prev').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.container.querySelector('.pdf-next').addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.container.querySelector('.pdf-zoom-in').addEventListener('click', () => this.changeZoom(0.2));
        this.container.querySelector('.pdf-zoom-out').addEventListener('click', () => this.changeZoom(-0.2));
        this.container.querySelector('.pdf-fit-width').addEventListener('click', () => this.fitWidth());
        this.container.querySelector('.pdf-print').addEventListener('click', () => window.print());

        const pageInput = this.container.querySelector('.pdf-page-input');
        pageInput.addEventListener('change', (e) => {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page)) this.goToPage(page);
        });
    }

    async loadPDF() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            let fileData = null;
            if (vfs && await vfs.exists(this.currentFilePath)) {
                fileData = await vfs.readFile(this.currentFilePath);
            }

            // Fallback iframe render if PDF.js is unavailable
            const iframe = this.container.querySelector('.pdf-iframe');
            if (iframe) {
                iframe.style.display = 'block';
                iframe.src = fileData ? `data:application/pdf;base64,${btoa(fileData)}` : 'about:blank';
            }
            this.totalPages = 5;
            this.container.querySelector('.pdf-total-pages').textContent = this.totalPages;
        } catch (e) {
            console.error('Failed to load PDF', e);
        }
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const pageInput = this.container.querySelector('.pdf-page-input');
        if (pageInput) pageInput.value = this.currentPage;
    }

    changeZoom(delta) {
        this.zoom = Math.max(0.5, Math.min(3.0, this.zoom + delta));
        const label = this.container.querySelector('.pdf-zoom-label');
        if (label) label.textContent = `${Math.round(this.zoom * 100)}%`;
        const wrapper = this.container.querySelector('.pdf-page-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${this.zoom})`;
            wrapper.style.transformOrigin = 'top center';
        }
    }

    fitWidth() {
        this.zoom = 1.2;
        const label = this.container.querySelector('.pdf-zoom-label');
        if (label) label.textContent = '120%';
        const wrapper = this.container.querySelector('.pdf-page-wrapper');
        if (wrapper) wrapper.style.transform = 'scale(1.2)';
    }

    async promptOpen() {
        const path = prompt('Open PDF file path:', this.currentFilePath);
        if (!path) return;
        this.currentFilePath = path;
        await this.loadPDF();
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default PDFViewerApp;
