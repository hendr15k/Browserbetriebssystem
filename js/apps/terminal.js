// js/apps/terminal.js
/**
 * WebOS Terminal App — Full REPL with VFS integration, ANSI colors, command history, autocomplete.
 */
import Utils from '../core/utils.js';

export class TerminalApp {
    constructor() {
        this.container = null;
        this.cwd = '/home/user';
        this.history = [];
        this.historyIndex = -1;
        this.username = 'user';
        this.hostname = 'webos';
        this.commands = ['ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'touch', 'clear', 'help', 'date', 'whoami', 'uname', 'tree', 'grep', 'wc'];
    }

    async init(container) {
        this.container = container;
        this.render();
        this.setupEvents();
        this.printWelcome();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'terminal-app os-app-container';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';
        this.container.style.background = '#0c0c0c';
        this.container.style.color = '#cccccc';
        this.container.style.fontFamily = 'monospace';
        this.container.style.padding = '8px';
        this.container.style.overflow = 'hidden';

        this.container.innerHTML = `
            <div class="term-output" style="flex-grow:1;overflow-y:auto;white-space:pre-wrap;word-break:break-all;font-size:13px;line-height:1.4;margin-bottom:6px;"></div>
            <div class="term-input-line" style="display:flex;align-items:center;gap:6px;font-size:13px;">
                <span class="term-prompt" style="color:#4ec9b0;white-space:nowrap;">user@webos:~$</span>
                <input type="text" class="term-input" style="flex-grow:1;background:transparent;border:none;color:#fff;outline:none;font-family:monospace;font-size:13px;" autofocus />
            </div>
        `;
    }

    printWelcome() {
        this.print('WebOS Terminal [Version 1.0.0]', 'color:#007acc;');
        this.print('Type "help" for available commands.\n', 'color:#888;');
    }

    print(text, style = '') {
        if (!this.container) return;
        const output = this.container.querySelector('.term-output');
        const div = document.createElement('div');
        if (style) div.style.cssText = style;
        div.textContent = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    setupEvents() {
        if (!this.container) return;
        const input = this.container.querySelector('.term-input');

        this.container.addEventListener('click', () => {
            input.focus();
        });

        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const cmdLine = input.value.trim();
                input.value = '';
                if (cmdLine) {
                    this.history.push(cmdLine);
                    this.historyIndex = this.history.length;
                    this.print(`${this.username}@${this.hostname}:${this.cwd}$ ${cmdLine}`, 'color:#4ec9b0;');
                    await this.executeCommand(cmdLine);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    input.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                await this.handleAutocomplete(input);
            }
        });
    }

    async handleAutocomplete(input) {
        const val = input.value;
        const parts = val.split(' ');
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;
        if (!vfs) return;

        if (parts.length === 1) {
            // Autocomplete command
            const match = this.commands.find(c => c.startsWith(parts[0]));
            if (match) {
                input.value = match + ' ';
            }
        } else {
            // Autocomplete file path
            const query = parts[parts.length - 1];
            const files = await vfs.listFiles();
            const match = files.find(f => f.startsWith(query) || f.startsWith(this.resolvePath(query)));
            if (match) {
                parts[parts.length - 1] = match.startsWith(this.cwd) ? match.slice(this.cwd.length + 1) : match;
                input.value = parts.join(' ');
            }
        }
    }

    resolvePath(p) {
        if (!p) return this.cwd;
        if (p.startsWith('/')) return p;
        if (p === '.') return this.cwd;
        if (p === '..') {
            const segments = this.cwd.split('/').filter(Boolean);
            segments.pop();
            return '/' + segments.join('/');
        }
        return (this.cwd === '/' ? '' : this.cwd) + '/' + p;
    }

    async executeCommand(line) {
        const args = this.parseArgs(line);
        const cmd = args[0];
        const vfs = typeof window !== 'undefined' ? window.WebOSVFS : null;

        switch (cmd) {
            case 'help':
                this.print('Available commands: ' + this.commands.join(', '));
                break;
            case 'clear':
                this.container.querySelector('.term-output').innerHTML = '';
                break;
            case 'whoami':
                this.print(this.username);
                break;
            case 'uname':
                this.print('WebOS Kernel 1.0.0-vanilla x86_64');
                break;
            case 'date':
                this.print(new Date().toString());
                break;
            case 'pwd':
                this.print(this.cwd);
                break;
            case 'ls': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                const target = this.resolvePath(args[1] || '');
                const list = await vfs.listDir(target);
                if (list.length === 0) {
                    this.print('(empty)');
                } else {
                    this.print(list.map(p => p.split('/').pop()).join('  '));
                }
                break;
            }
            case 'cd': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                const target = this.resolvePath(args[1] || '/home/user');
                const exists = await vfs.exists(target) || target === '/' || target === '/home/user';
                if (exists) {
                    this.cwd = target;
                    const promptEl = this.container.querySelector('.term-prompt');
                    if (promptEl) promptEl.textContent = `${this.username}@${this.hostname}:${this.cwd}$`;
                } else {
                    this.print(`cd: no such directory: ${args[1]}`);
                }
                break;
            }
            case 'cat': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1]) { this.print('cat: missing file argument'); break; }
                const target = this.resolvePath(args[1]);
                const content = await vfs.readFile(target);
                if (content !== null) {
                    this.print(content);
                } else {
                    this.print(`cat: ${args[1]}: No such file`);
                }
                break;
            }
            case 'echo':
                this.print(args.slice(1).join(' '));
                break;
            case 'touch': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1]) { this.print('touch: missing file argument'); break; }
                const target = this.resolvePath(args[1]);
                await vfs.writeFile(target, '');
                break;
            }
            case 'mkdir': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1]) { this.print('mkdir: missing directory argument'); break; }
                const target = this.resolvePath(args[1]);
                await vfs.mkdir(target);
                break;
            }
            case 'rm': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1]) { this.print('rm: missing file argument'); break; }
                const target = this.resolvePath(args[1]);
                await vfs.deleteFile(target);
                break;
            }
            case 'tree': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                const files = await vfs.listFiles();
                this.print(files.join('\n'));
                break;
            }
            case 'grep': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1] || !args[2]) { this.print('grep: usage: grep <pattern> <file>'); break; }
                const pattern = args[1];
                const target = this.resolvePath(args[2]);
                const content = await vfs.readFile(target);
                if (content !== null) {
                    const lines = content.split('\n');
                    const matches = lines.filter(l => l.includes(pattern));
                    this.print(matches.join('\n'));
                } else {
                    this.print(`grep: ${args[2]}: No such file`);
                }
                break;
            }
            case 'wc': {
                if (!vfs) { this.print('VFS unavailable'); break; }
                if (!args[1]) { this.print('wc: missing file argument'); break; }
                const target = this.resolvePath(args[1]);
                const content = await vfs.readFile(target);
                if (content !== null) {
                    const lines = content.split('\n').length;
                    const words = content.split(/\s+/).filter(Boolean).length;
                    const bytes = new Blob([content]).size;
                    this.print(`  ${lines}  ${words}  ${bytes} ${args[1]}`);
                } else {
                    this.print(`wc: ${args[1]}: No such file`);
                }
                break;
            }
            default:
                this.print(`zsh: command not found: ${cmd}`, 'color:#f14c4c;');
                break;
        }
    }

    parseArgs(str) {
        const args = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    args.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current) args.push(current);
        return args;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSTerminalApp = TerminalApp;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TerminalApp };
}
