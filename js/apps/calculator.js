// js/apps/calculator.js
/**
 * WebOS Calculator App — Standard & Scientific mode calculator with history, memory keys, bracket precedence, and keyboard support.
 */
import Utils from '../core/utils.js';

export class CalculatorApp {
    constructor() {
        this.container = null;
        this.expression = '0';
        this.history = [];
        this.memory = 0;
        this.isScientific = false;
    }

    async init(container, options = {}) {
        this.container = container;
        this.render();
        this.setupEvents();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'calculator-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#202020;color:#fff;font-family:sans-serif;font-size:14px;';

        this.container.innerHTML = `
            <div class="calc-header" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#2d2d2d;border-bottom:1px solid #333;">
                <h3 style="margin:0;font-size:15px;color:#4cc2ff;">WebOS Calculator</h3>
                <button class="calc-btn calc-mode" style="background:#383838;color:#fff;border:1px solid #555;padding:4px 8px;border-radius:4px;cursor:pointer;">Scientific Mode</button>
            </div>
            <div class="calc-display" style="padding:16px;background:#181818;border-bottom:1px solid #333;text-align:right;">
                <div class="calc-history-view" style="font-size:12px;color:#888;min-height:18px;overflow:hidden;text-overflow:ellipsis;"></div>
                <div class="calc-expr-view" style="font-size:28px;font-weight:bold;color:#fff;margin-top:4px;overflow-x:auto;">0</div>
            </div>
            <div class="calc-body" style="display:flex;flex-grow:1;overflow:hidden;">
                <div class="calc-keypad" style="flex-grow:1;display:grid;grid-template-columns:repeat(4, 1fr);gap:4px;padding:8px;background:#202020;">
                    <button class="calc-kbtn" data-action="memory-clear">MC</button>
                    <button class="calc-kbtn" data-action="memory-read">MR</button>
                    <button class="calc-kbtn" data-action="memory-plus">M+</button>
                    <button class="calc-kbtn" data-action="memory-minus">M-</button>

                    <button class="calc-kbtn" data-action="clear">C</button>
                    <button class="calc-kbtn" data-action="bracket-left">(</button>
                    <button class="calc-kbtn" data-action="bracket-right">)</button>
                    <button class="calc-kbtn op" data-val="/">÷</button>

                    <button class="calc-kbtn num" data-val="7">7</button>
                    <button class="calc-kbtn num" data-val="8">8</button>
                    <button class="calc-kbtn num" data-val="9">9</button>
                    <button class="calc-kbtn op" data-val="*">×</button>

                    <button class="calc-kbtn num" data-val="4">4</button>
                    <button class="calc-kbtn num" data-val="5">5</button>
                    <button class="calc-kbtn num" data-val="6">6</button>
                    <button class="calc-kbtn op" data-val="-">-</button>

                    <button class="calc-kbtn num" data-val="1">1</button>
                    <button class="calc-kbtn num" data-val="2">2</button>
                    <button class="calc-kbtn num" data-val="3">3</button>
                    <button class="calc-kbtn op" data-val="+">+</button>

                    <button class="calc-kbtn num" data-val="0" style="grid-column: span 2;">0</button>
                    <button class="calc-kbtn num" data-val=".">.</button>
                    <button class="calc-kbtn equals" data-action="equals" style="background:#007acc;color:#fff;">=</button>
                </div>
                <div class="calc-scientific-panel" style="width:160px;background:#282828;border-left:1px solid #333;display:none;grid-template-columns:repeat(2, 1fr);gap:4px;padding:8px;">
                    <button class="calc-sbtn" data-val="sqrt">√</button>
                    <button class="calc-sbtn" data-val="pow">^</button>
                    <button class="calc-sbtn" data-val="sin">sin</button>
                    <button class="calc-sbtn" data-val="cos">cos</button>
                    <button class="calc-sbtn" data-val="tan">tan</button>
                    <button class="calc-sbtn" data-val="log">log</button>
                    <button class="calc-sbtn" data-val="ln">ln</button>
                    <button class="calc-sbtn" data-val="exp">exp</button>
                </div>
                <div class="calc-history-panel" style="width:180px;background:#181818;border-left:1px solid #333;padding:8px;overflow-y:auto;font-size:12px;">
                    <div style="font-weight:bold;color:#888;margin-bottom:6px;">History</div>
                    <ul class="calc-history-list" style="list-style:none;margin:0;padding:0;color:#aaa;"></ul>
                </div>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;

        this.container.querySelector('.calc-mode').addEventListener('click', () => {
            this.isScientific = !this.isScientific;
            const sciPanel = this.container.querySelector('.calc-scientific-panel');
            sciPanel.style.display = this.isScientific ? 'grid' : 'none';
            this.container.querySelector('.calc-mode').textContent = this.isScientific ? 'Standard Mode' : 'Scientific Mode';
        });

        this.container.querySelector('.calc-body').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const val = btn.dataset.val;
            const action = btn.dataset.action;

            if (val !== undefined) {
                this.appendInput(val);
            } else if (action === 'clear') {
                this.expression = '0';
                this.updateDisplay();
            } else if (action === 'equals') {
                this.calculateResult();
            } else if (action === 'bracket-left') {
                this.appendInput('(');
            } else if (action === 'bracket-right') {
                this.appendInput(')');
            } else if (action === 'memory-clear') {
                this.memory = 0;
            } else if (action === 'memory-read') {
                this.appendInput(String(this.memory));
            } else if (action === 'memory-plus') {
                this.memory += Number(this.evaluateExpression(this.expression) || 0);
            } else if (action === 'memory-minus') {
                this.memory -= Number(this.evaluateExpression(this.expression) || 0);
            }
        });

        // Keyboard listener
        window.addEventListener('keydown', (e) => {
            if (!this.container || !this.container.isConnected) return;
            if (/^[0-9.+\-*/()^]$/.test(e.key)) {
                this.appendInput(e.key);
            } else if (e.key === 'Enter' || e.key === '=') {
                this.calculateResult();
            } else if (e.key === 'Backspace') {
                if (this.expression.length > 1) {
                    this.expression = this.expression.slice(0, -1);
                } else {
                    this.expression = '0';
                }
                this.updateDisplay();
            }
        });
    }

    appendInput(val) {
        if (this.expression === '0' && !['+', '-', '*', '/', '^', '.'].includes(val)) {
            this.expression = val;
        } else {
            this.expression += val;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.container) return;
        const exprView = this.container.querySelector('.calc-expr-view');
        if (exprView) exprView.textContent = this.expression;
    }

    calculateResult() {
        try {
            const result = this.evaluateExpression(this.expression);
            const entry = `${this.expression} = ${result}`;
            this.history.unshift(entry);
            if (this.history.length > 10) this.history.pop();

            this.updateHistoryUI();
            this.expression = String(result);
            this.updateDisplay();
        } catch (e) {
            this.expression = 'Error';
            this.updateDisplay();
            setTimeout(() => {
                this.expression = '0';
                this.updateDisplay();
            }, 1500);
        }
    }

    evaluateExpression(expr) {
        // Replace friendly symbols
        let sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
        // Handle scientific functions like sqrt, sin, cos, tan, log, ln, exp, pow
        sanitized = sanitized.replace(/sqrt\(([^)]+)\)/g, (_, p) => Math.sqrt(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/sin\(([^)]+)\)/g, (_, p) => Math.sin(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/cos\(([^)]+)\)/g, (_, p) => Math.cos(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/tan\(([^)]+)\)/g, (_, p) => Math.tan(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/log\(([^)]+)\)/g, (_, p) => Math.log10(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/ln\(([^)]+)\)/g, (_, p) => Math.log(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/exp\(([^)]+)\)/g, (_, p) => Math.exp(this.evaluateExpression(p)));
        sanitized = sanitized.replace(/([0-9.]+)\^([0-9.]+)/g, (_, base, exp) => Math.pow(Number(base), Number(exp)));

        // Safe eval via Function
        const fn = new Function(`return ${sanitized};`);
        return fn();
    }

    updateHistoryUI() {
        if (!this.container) return;
        const list = this.container.querySelector('.calc-history-list');
        if (!list) return;
        list.innerHTML = this.history.map(item => `<li style="padding:4px 0;border-bottom:1px solid #222;">${Utils.escapeHtml(item)}</li>`).join('');
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default CalculatorApp;
