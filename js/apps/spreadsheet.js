// js/apps/spreadsheet.js
/**
 * WebOS Spreadsheet App — 2D Cell Engine with formulas, CSV/JSON I/O, formatting, and clipboard support.
 */
import Utils from '../core/utils.js';

export class SpreadsheetApp {
    constructor() {
        this.container = null;
        this.rows = 100;
        this.cols = 26; // A-Z
        this.data = {}; // key "A1" -> { value: '', formula: '', style: { bold: false, italic: false, color: '#000', align: 'left' } }
        this.selectedCell = null; // 'A1'
        this.selectionRange = null; // { start: 'A1', end: 'A1' }
        this.clipboard = null;
        this.currentFilePath = '/home/user/documents/sheet1.csv';
    }

    async init(container, options = {}) {
        this.container = container;
        if (options.filePath) {
            this.currentFilePath = options.filePath;
        }
        this.render();
        this.setupEvents();
        await this.loadSheet();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'spreadsheet-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#fff;color:#333;font-family:sans-serif;font-size:13px;';

        this.container.innerHTML = `
            <div class="ss-toolbar" style="display:flex;gap:6px;padding:8px;background:#f3f3f3;border-bottom:1px solid #ccc;align-items:center;flex-wrap:wrap;">
                <button class="ss-btn ss-new" title="New Sheet">New</button>
                <button class="ss-btn ss-open" title="Open CSV">Open</button>
                <button class="ss-btn ss-save" title="Save CSV">Save</button>
                <button class="ss-btn ss-export" title="Export JSON">Export JSON</button>
                <span style="border-left:1px solid #ccc;height:20px;margin:0 4px;"></span>
                <button class="ss-btn ss-bold" title="Bold"><b>B</b></button>
                <button class="ss-btn ss-italic" title="Italic"><i>I</i></button>
                <input type="color" class="ss-color" title="Text Color" value="#000000" style="width:28px;height:24px;border:none;cursor:pointer;background:transparent;">
                <select class="ss-align" title="Alignment">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
                <span style="border-left:1px solid #ccc;height:20px;margin:0 4px;"></span>
                <button class="ss-btn ss-cut" title="Cut">Cut</button>
                <button class="ss-btn ss-copy" title="Copy">Copy</button>
                <button class="ss-btn ss-paste" title="Paste">Paste</button>
                <span style="flex-grow:1;"></span>
                <span class="ss-status" style="font-size:12px;color:#666;">Ready</span>
            </div>
            <div class="ss-formula-bar" style="display:flex;align-items:center;padding:6px;background:#fafafa;border-bottom:1px solid #ddd;gap:6px;">
                <span class="ss-cell-indicator" style="font-weight:bold;min-width:35px;text-align:center;">A1</span>
                <input type="text" class="ss-formula-input" style="flex-grow:1;padding:4px 8px;border:1px solid #ccc;border-radius:3px;font-family:monospace;" placeholder="Enter value or formula (e.g. =SUM(A1:A5))">
            </div>
            <div class="ss-grid-container" style="flex-grow:1;overflow:auto;position:relative;">
                <table class="ss-table" style="border-collapse:collapse;table-layout:fixed;width:100%;">
                    <thead>
                        <tr class="ss-header-row" style="background:#f0f0f0;position:sticky;top:0;z-index:2;">
                            <th style="width:40px;border:1px solid #ccc;background:#e5e5e5;"></th>
                            ${Array.from({length: this.cols}, (_, i) => `<th style="width:80px;border:1px solid #ccc;padding:4px;text-align:center;font-weight:600;">${String.fromCharCode(65 + i)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="ss-tbody">
                        ${Array.from({length: this.rows}, (_, r) => `
                            <tr>
                                <td style="width:40px;border:1px solid #ccc;background:#e5e5e5;text-align:center;font-weight:600;font-size:11px;color:#555;">${r + 1}</td>
                                ${Array.from({length: this.cols}, (_, c) => {
                                    const cellId = `${String.fromCharCode(65 + c)}${r + 1}`;
                                    return `<td data-cell="${cellId}" style="border:1px solid #ddd;padding:2px 4px;height:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;outline:none;" contenteditable="true"></td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;

        const tableBody = this.container.querySelector('.ss-tbody');
        const formulaInput = this.container.querySelector('.ss-formula-input');
        const cellIndicator = this.container.querySelector('.ss-cell-indicator');

        this.container.querySelector('.ss-new').addEventListener('click', () => this.newSheet());
        this.container.querySelector('.ss-open').addEventListener('click', () => this.promptOpen());
        this.container.querySelector('.ss-save').addEventListener('click', () => this.saveSheet());
        this.container.querySelector('.ss-export').addEventListener('click', () => this.exportJson());

        this.container.querySelector('.ss-bold').addEventListener('click', () => this.toggleStyle('bold'));
        this.container.querySelector('.ss-italic').addEventListener('click', () => this.toggleStyle('italic'));
        this.container.querySelector('.ss-color').addEventListener('change', (e) => this.setStyle('color', e.target.value));
        this.container.querySelector('.ss-align').addEventListener('change', (e) => this.setStyle('align', e.target.value));

        this.container.querySelector('.ss-cut').addEventListener('click', () => this.cutSelection());
        this.container.querySelector('.ss-copy').addEventListener('click', () => this.copySelection());
        this.container.querySelector('.ss-paste').addEventListener('click', () => this.pasteSelection());

        tableBody.addEventListener('focusin', (e) => {
            const td = e.target.closest('td[data-cell]');
            if (!td) return;
            const cellId = td.dataset.cell;
            this.selectCell(cellId);
        });

        tableBody.addEventListener('input', (e) => {
            const td = e.target.closest('td[data-cell]');
            if (!td) return;
            const cellId = td.dataset.cell;
            const rawVal = td.textContent;
            this.setCellValue(cellId, rawVal);
            if (this.selectedCell === cellId) {
                formulaInput.value = rawVal;
            }
            this.recalculateAll();
        });

        formulaInput.addEventListener('input', (e) => {
            if (!this.selectedCell) return;
            const val = e.target.value;
            this.setCellValue(this.selectedCell, val);
            const td = this.container.querySelector(`td[data-cell="${this.selectedCell}"]`);
            if (td) {
                td.textContent = this.evaluateCell(this.selectedCell);
            }
            this.recalculateAll();
        });
    }

    selectCell(cellId) {
        this.selectedCell = cellId;
        const cellIndicator = this.container.querySelector('.ss-cell-indicator');
        const formulaInput = this.container.querySelector('.ss-formula-input');
        if (cellIndicator) cellIndicator.textContent = cellId;
        const cellObj = this.data[cellId];
        if (formulaInput) {
            formulaInput.value = cellObj ? (cellObj.formula || cellObj.value || '') : '';
        }
    }

    setCellValue(cellId, rawVal) {
        if (!this.data[cellId]) {
            this.data[cellId] = { value: '', formula: '', style: { bold: false, italic: false, color: '#000000', align: 'left' } };
        }
        if (rawVal.startsWith('=')) {
            this.data[cellId].formula = rawVal;
            this.data[cellId].value = rawVal;
        } else {
            this.data[cellId].formula = '';
            this.data[cellId].value = rawVal;
        }
    }

    evaluateCell(cellId) {
        const cell = this.data[cellId];
        if (!cell) return '';
        if (cell.formula) {
            try {
                return this.parseFormula(cell.formula);
            } catch (err) {
                return '#ERROR!';
            }
        }
        return cell.value;
    }

    parseFormula(formula) {
        // e.g. =SUM(A1:A5), =AVERAGE(A1:B2), =IF(A1>5,"Yes","No"), =UPPER(A1), =CONCAT(A1,B1)
        const content = formula.substring(1).trim();
        const match = content.match(/^([A-Z]+)\((.*)\)$/i);
        if (!match) {
            // simple expression or reference
            return this.resolveToken(content);
        }

        const fn = match[1].toUpperCase();
        const argsStr = match[2];
        const args = this.parseArgs(argsStr);

        switch (fn) {
            case 'SUM':
                return this.calcRange(args[0], (vals) => vals.reduce((a, b) => a + Number(b || 0), 0));
            case 'AVG':
            case 'AVERAGE':
                return this.calcRange(args[0], (vals) => vals.length ? vals.reduce((a, b) => a + Number(b || 0), 0) / vals.length : 0);
            case 'MIN':
                return this.calcRange(args[0], (vals) => vals.length ? Math.min(...vals.map(v => Number(v || 0))) : 0);
            case 'MAX':
                return this.calcRange(args[0], (vals) => vals.length ? Math.max(...vals.map(v => Number(v || 0))) : 0);
            case 'COUNT':
                return this.calcRange(args[0], (vals) => vals.filter(v => v !== '' && !isNaN(v)).length);
            case 'IF':
                // IF(condition, trueVal, falseVal) e.g. IF(A1>5, 10, 0) or IF(A1="test", "A", "B")
                return this.evalIf(args[0], args[1], args[2]);
            case 'CONCAT':
                return args.map(arg => this.resolveToken(arg)).join('');
            case 'UPPER':
                return String(this.resolveToken(args[0])).toUpperCase();
            case 'LOWER':
                return String(this.resolveToken(args[0])).toLowerCase();
            case 'LEN':
                return String(this.resolveToken(args[0])).length;
            default:
                return '#NAME?';
        }
    }

    parseArgs(argsStr) {
        // split by comma, respecting quotes
        const args = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === ',' && !inQuotes) {
                args.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current) args.push(current.trim());
        return args;
    }

    resolveToken(token) {
        token = token.trim();
        if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
            return token.slice(1, -1);
        }
        if (!isNaN(token)) {
            return Number(token);
        }
        // Check if cell reference like A1
        if (/^[A-Z]+\d+$/.test(token)) {
            const cell = this.data[token];
            const val = cell ? (cell.formula ? this.evaluateCell(token) : cell.value) : '';
            return isNaN(val) ? val : Number(val);
        }
        return token;
    }

    calcRange(rangeStr, fn) {
        const parts = rangeStr.split(':');
        if (parts.length !== 2) {
            // single token
            return fn([this.resolveToken(rangeStr)]);
        }
        const start = parts[0].trim();
        const end = parts[1].trim();
        const vals = [];
        const startCol = start.match(/^[A-Z]+/)[0];
        const startRow = parseInt(start.match(/\d+$/)[0], 10);
        const endCol = end.match(/^[A-Z]+/)[0];
        const endRow = parseInt(end.match(/\d+$/)[0], 10);

        const colStartIdx = startCol.charCodeAt(0);
        const colEndIdx = endCol.charCodeAt(0);

        for (let c = colStartIdx; c <= colEndIdx; c++) {
            for (let r = startRow; r <= endRow; r++) {
                const cellId = `${String.fromCharCode(c)}${r}`;
                const cell = this.data[cellId];
                const val = cell ? (cell.formula ? this.evaluateCell(cellId) : cell.value) : '';
                vals.push(val);
            }
        }
        return fn(vals);
    }

    evalIf(condStr, trueVal, falseVal) {
        // e.g. A1>5 or A1="hello"
        const match = condStr.match(/^([A-Z]+\d+)\s*([><=!]+)\s*(.+)$/);
        if (!match) return '#ERROR!';
        const cellRef = match[1];
        const op = match[2];
        const target = this.resolveToken(match[3]);
        const val = this.resolveToken(cellRef);

        let conditionMet = false;
        switch (op) {
            case '>': conditionMet = val > target; break;
            case '<': conditionMet = val < target; break;
            case '>=': conditionMet = val >= target; break;
            case '<=': conditionMet = val <= target; break;
            case '=': case '==': conditionMet = val == target; break;
            case '!=': conditionMet = val != target; break;
        }

        const chosen = conditionMet ? trueVal : falseVal;
        return this.resolveToken(chosen);
    }

    recalculateAll() {
        if (!this.container) return;
        for (const cellId in this.data) {
            if (this.data[cellId].formula) {
                const td = this.container.querySelector(`td[data-cell="${cellId}"]`);
                if (td && document.activeElement !== td) {
                    td.textContent = this.evaluateCell(cellId);
                }
            }
        }
    }

    toggleStyle(prop) {
        if (!this.selectedCell) return;
        if (!this.data[this.selectedCell]) {
            this.setCellValue(this.selectedCell, '');
        }
        this.data[this.selectedCell].style[prop] = !this.data[this.selectedCell].style[prop];
        this.applyStyleToDOM(this.selectedCell);
    }

    setStyle(prop, val) {
        if (!this.selectedCell) return;
        if (!this.data[this.selectedCell]) {
            this.setCellValue(this.selectedCell, '');
        }
        this.data[this.selectedCell].style[prop] = val;
        this.applyStyleToDOM(this.selectedCell);
    }

    applyStyleToDOM(cellId) {
        const td = this.container.querySelector(`td[data-cell="${cellId}"]`);
        if (!td) return;
        const style = this.data[cellId].style;
        td.style.fontWeight = style.bold ? 'bold' : 'normal';
        td.style.fontStyle = style.italic ? 'italic' : 'normal';
        td.style.color = style.color || '#000';
        td.style.textAlign = style.align || 'left';
    }

    cutSelection() {
        this.copySelection();
        if (this.selectedCell) {
            this.setCellValue(this.selectedCell, '');
            const td = this.container.querySelector(`td[data-cell="${this.selectedCell}"]`);
            if (td) td.textContent = '';
        }
    }

    copySelection() {
        if (!this.selectedCell) return;
        this.clipboard = JSON.parse(JSON.stringify(this.data[this.selectedCell] || { value: '' }));
    }

    pasteSelection() {
        if (!this.selectedCell || !this.clipboard) return;
        this.data[this.selectedCell] = JSON.parse(JSON.stringify(this.clipboard));
        const td = this.container.querySelector(`td[data-cell="${this.selectedCell}"]`);
        if (td) {
            td.textContent = this.evaluateCell(this.selectedCell);
            this.applyStyleToDOM(this.selectedCell);
        }
        const formulaInput = this.container.querySelector('.ss-formula-input');
        if (formulaInput) {
            formulaInput.value = this.data[this.selectedCell].formula || this.data[this.selectedCell].value;
        }
    }

    newSheet() {
        this.data = {};
        this.selectedCell = null;
        if (!this.container) return;
        const tds = this.container.querySelectorAll('td[data-cell]');
        tds.forEach(td => {
            td.textContent = '';
            td.style.fontWeight = 'normal';
            td.style.fontStyle = 'normal';
            td.style.color = '#000';
            td.style.textAlign = 'left';
        });
        const formulaInput = this.container.querySelector('.ss-formula-input');
        if (formulaInput) formulaInput.value = '';
    }

    async promptOpen() {
        const path = prompt('Open CSV file path:', this.currentFilePath);
        if (!path) return;
        this.currentFilePath = path;
        await this.loadSheet();
    }

    async loadSheet() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            if (await vfs.exists(this.currentFilePath)) {
                const csv = await vfs.readFile(this.currentFilePath);
                this.parseCSV(csv);
            }
        } catch (e) {
            console.error('Failed to load spreadsheet', e);
        }
    }

    parseCSV(csv) {
        this.newSheet();
        const lines = csv.split('\n');
        lines.forEach((line, r) => {
            if (r >= this.rows) return;
            const cols = line.split(',');
            cols.forEach((val, c) => {
                if (c >= this.cols) return;
                const cellId = `${String.fromCharCode(65 + c)}${r + 1}`;
                const trimmed = val.trim();
                if (trimmed) {
                    this.setCellValue(cellId, trimmed);
                    const td = this.container.querySelector(`td[data-cell="${cellId}"]`);
                    if (td) td.textContent = this.evaluateCell(cellId);
                }
            });
        });
    }

    async saveSheet() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            let csv = '';
            for (let r = 0; r < this.rows; r++) {
                const rowVals = [];
                let hasVal = false;
                for (let c = 0; c < this.cols; c++) {
                    const cellId = `${String.fromCharCode(65 + c)}${r + 1}`;
                    const cell = this.data[cellId];
                    const val = cell ? (cell.formula || cell.value || '') : '';
                    rowVals.push(val);
                    if (val) hasVal = true;
                }
                if (hasVal || r < 20) {
                    csv += rowVals.join(',') + '\n';
                }
            }
            await vfs.writeFile(this.currentFilePath, csv);
            const status = this.container.querySelector('.ss-status');
            if (status) {
                status.textContent = 'Saved to ' + this.currentFilePath;
                setTimeout(() => status.textContent = 'Ready', 3000);
            }
        } catch (e) {
            console.error('Failed to save spreadsheet', e);
        }
    }

    async exportJson() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (!vfs) return;
            const jsonPath = this.currentFilePath.replace(/\.[^/.]+$/, '') + '.json';
            const jsonStr = JSON.stringify(this.data, null, 2);
            await vfs.writeFile(jsonPath, jsonStr);
            alert('Exported JSON to ' + jsonPath);
        } catch (e) {
            console.error('Failed to export JSON', e);
        }
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
    }
}

export default SpreadsheetApp;
