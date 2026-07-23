// js/apps/image-editor.js
/**
 * WebOS Image Editor App — Canvas 2D image editor with multi-step Undo/Redo, drawing tools, filters, and PNG/JPEG export.
 */
import Utils from '../core/utils.js';

export class ImageEditorApp {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.currentTool = 'brush'; // brush, eraser, line, rect, circle, fill, eyedropper, text
        this.brushColor = '#000000';
        this.brushSize = 5;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.history = []; // array of ImageData
        this.historyIndex = -1;
        this.maxHistory = 30;
    }

    async init(container, options = {}) {
        this.container = container;
        this.render();
        this.setupCanvas();
        this.setupEvents();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'image-editor-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#2d2d2d;color:#fff;font-family:sans-serif;font-size:13px;';

        this.container.innerHTML = `
            <div class="ie-toolbar" style="display:flex;gap:6px;padding:8px;background:#333;border-bottom:1px solid #444;align-items:center;flex-wrap:wrap;">
                <button class="ie-btn ie-tool active" data-tool="brush" title="Brush">Brush</button>
                <button class="ie-btn ie-tool" data-tool="eraser" title="Eraser">Eraser</button>
                <button class="ie-btn ie-tool" data-tool="line" title="Line">Line</button>
                <button class="ie-btn ie-tool" data-tool="rect" title="Rectangle">Rect</button>
                <button class="ie-btn ie-tool" data-tool="circle" title="Circle">Circle</button>
                <button class="ie-btn ie-tool" data-tool="fill" title="Bucket Fill">Fill</button>
                <button class="ie-btn ie-tool" data-tool="eyedropper" title="Eyedropper">Picker</button>
                <button class="ie-btn ie-tool" data-tool="text" title="Text">Text</button>
                <span style="border-left:1px solid #555;height:20px;margin:0 4px;"></span>
                <input type="color" class="ie-color" title="Brush Color" value="#000000" style="width:28px;height:24px;border:none;cursor:pointer;background:transparent;">
                <label style="display:flex;align-items:center;gap:4px;">Size: <input type="range" class="ie-size" min="1" max="50" value="5" style="width:80px;"></label>
                <span style="border-left:1px solid #555;height:20px;margin:0 4px;"></span>
                <button class="ie-btn ie-undo" title="Undo">Undo</button>
                <button class="ie-btn ie-redo" title="Redo">Redo</button>
                <span style="border-left:1px solid #555;height:20px;margin:0 4px;"></span>
                <select class="ie-filter" style="padding:4px;background:#444;color:#fff;border:1px solid #555;border-radius:3px;">
                    <option value="">Apply Filter...</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="sepia">Sepia</option>
                    <option value="blur">Blur</option>
                    <option value="sharpen">Sharpen</option>
                    <option value="brightness">Brightness +</option>
                    <option value="contrast">Contrast +</option>
                    <option value="invert">Invert</option>
                </select>
                <button class="ie-btn ie-save" title="Save PNG">Save PNG</button>
            </div>
            <div class="ie-canvas-container" style="flex-grow:1;display:flex;align-items:center;justify-content:center;overflow:auto;background:#1e1e1e;position:relative;">
                <canvas class="ie-canvas" width="800" height="600" style="background:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.5);cursor:crosshair;"></canvas>
            </div>
        `;
    }

    setupCanvas() {
        if (!this.container) return;
        this.canvas = this.container.querySelector('.ie-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;
        // fill white background initially
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.pushHistory();
    }

    setupEvents() {
        if (!this.container) return;

        // Tool selection
        this.container.querySelectorAll('.ie-tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.ie-tool').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });

        const colorInput = this.container.querySelector('.ie-color');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                this.brushColor = e.target.value;
            });
        }

        const sizeInput = this.container.querySelector('.ie-size');
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.brushSize = Number(e.target.value);
            });
        }

        const undoBtn = this.container.querySelector('.ie-undo');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        const redoBtn = this.container.querySelector('.ie-redo');
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        const saveBtn = this.container.querySelector('.ie-save');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveImage());

        const filterSelect = this.container.querySelector('.ie-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const filter = e.target.value;
                if (filter) {
                    this.applyFilter(filter);
                    e.target.value = '';
                }
            });
        }

        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
            this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        }
    }

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top)
        };
    }

    onMouseDown(e) {
        const coords = this.getCanvasCoords(e);
        this.isDrawing = true;
        this.startX = coords.x;
        this.startY = coords.y;

        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.brushColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        } else if (this.currentTool === 'fill') {
            this.floodFill(this.startX, this.startY, this.brushColor);
            this.isDrawing = false;
            this.pushHistory();
        } else if (this.currentTool === 'eyedropper') {
            const p = this.ctx.getImageData(this.startX, this.startY, 1, 1).data;
            const hex = '#' + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('');
            this.brushColor = hex;
            const colorInput = this.container.querySelector('.ie-color');
            if (colorInput) colorInput.value = hex;
            this.isDrawing = false;
        } else if (this.currentTool === 'text') {
            const text = prompt('Enter text to draw:');
            if (text) {
                this.ctx.font = `${Math.max(12, this.brushSize * 3)}px sans-serif`;
                this.ctx.fillStyle = this.brushColor;
                this.ctx.fillText(text, this.startX, this.startY);
                this.pushHistory();
            }
            this.isDrawing = false;
        }
    }

    onMouseMove(e) {
        if (!this.isDrawing) return;
        const coords = this.getCanvasCoords(e);

        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.ctx.lineTo(coords.x, coords.y);
            this.ctx.stroke();
        } else if (['line', 'rect', 'circle'].includes(this.currentTool)) {
            // preview shapes by restoring last history snapshot then drawing preview
            this.restoreLastSnapshot();
            this.drawShape(this.currentTool, this.startX, this.startY, coords.x, coords.y);
        }
    }

    onMouseUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (['line', 'rect', 'circle'].includes(this.currentTool)) {
            const coords = this.getCanvasCoords(e);
            this.drawShape(this.currentTool, this.startX, this.startY, coords.x, coords.y);
        }
        this.pushHistory();
    }

    drawShape(tool, x1, y1, x2, y2) {
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();

        if (tool === 'line') {
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        } else if (tool === 'rect') {
            this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            this.ctx.arc(x1, y1, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    floodFill(startX, startY, fillColor) {
        const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imgData.data;
        const targetIdx = (startY * this.width + startX) * 4;
        const targetR = data[targetIdx];
        const targetG = data[targetIdx + 1];
        const targetB = data[targetIdx + 2];
        const targetA = data[targetIdx + 3];

        const rHex = parseInt(fillColor.substring(1, 3), 16);
        const gHex = parseInt(fillColor.substring(3, 5), 16);
        const bHex = parseInt(fillColor.substring(5, 7), 16);

        if (targetR === rHex && targetG === gHex && targetB === bHex) return;

        const queue = [[startX, startY]];
        const visited = new Uint8Array(this.width * this.height);

        while (queue.length > 0) {
            const [x, y] = queue.pop();
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
            const idx = y * this.width + x;
            if (visited[idx]) continue;
            visited[idx] = 1;

            const pxIdx = (y * this.width + x) * 4;
            if (
                data[pxIdx] === targetR &&
                data[pxIdx + 1] === targetG &&
                data[pxIdx + 2] === targetB &&
                data[pxIdx + 3] === targetA
            ) {
                data[pxIdx] = rHex;
                data[pxIdx + 1] = gHex;
                data[pxIdx + 2] = bHex;
                data[pxIdx + 3] = 255;

                queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
        this.ctx.putImageData(imgData, 0, 0);
    }

    pushHistory() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        const snapshot = this.ctx.getImageData(0, 0, this.width, this.height);
        this.history.push(snapshot);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    restoreLastSnapshot() {
        if (this.historyIndex >= 0 && this.history[this.historyIndex]) {
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
        }
    }

    applyFilter(filterType) {
        const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i + 1], b = data[i + 2];
            if (filterType === 'grayscale') {
                const avg = 0.3 * r + 0.59 * g + 0.11 * b;
                data[i] = data[i + 1] = data[i + 2] = avg;
            } else if (filterType === 'sepia') {
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            } else if (filterType === 'invert') {
                data[i] = 255 - r;
                data[i + 1] = 255 - g;
                data[i + 2] = 255 - b;
            } else if (filterType === 'brightness') {
                data[i] = Math.min(255, r + 40);
                data[i + 1] = Math.min(255, g + 40);
                data[i + 2] = Math.min(255, b + 40);
            } else if (filterType === 'contrast') {
                const factor = 1.3;
                data[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128));
                data[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128));
                data[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128));
            }
        }
        this.ctx.putImageData(imgData, 0, 0);

        if (filterType === 'blur' || filterType === 'sharpen') {
            // simple box blur simulation via CSS or convolution
            this.ctx.filter = filterType === 'blur' ? 'blur(4px)' : 'contrast(150%)';
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.filter = 'none';
        }

        this.pushHistory();
    }

    async saveImage() {
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs) {
                await vfs.writeFile('/home/user/pictures/drawing.png', dataUrl);
                alert('Saved drawing to /home/user/pictures/drawing.png');
            }
        } catch (e) {
            console.error('Failed to save image', e);
        }
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default ImageEditorApp;
