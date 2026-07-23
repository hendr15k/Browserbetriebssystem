// js/apps/kanban.js
/**
 * WebOS Kanban Board App — 3 columns (Todo, In-Progress, Done), card CRUD, Drag-and-Drop, filters, and VFS persistence.
 */
import Utils from '../core/utils.js';

export class KanbanApp {
    constructor() {
        this.container = null;
        this.boardPath = '/home/user/kanban.json';
        this.cards = [
            { id: 'c1', title: 'Implement Sprint 13', description: 'Create 8 production-ready apps', status: 'todo', priority: 'High', tag: 'Dev', dueDate: '2026-07-25' },
            { id: 'c2', title: 'Review Code Structure', description: 'Ensure all tests pass and ESM standard is met', status: 'in-progress', priority: 'Medium', tag: 'QA', dueDate: '2026-07-22' },
            { id: 'c3', title: 'Write Documentation', description: 'Summarize architecture decisions', status: 'done', priority: 'Low', tag: 'Docs', dueDate: '2026-07-20' }
        ];
        this.filterTag = '';
        this.filterPriority = '';
    }

    async init(container, options = {}) {
        this.container = container;
        await this.loadBoard();
        this.render();
        this.setupEvents();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'kanban-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1e1e1e;color:#fff;font-family:sans-serif;font-size:13px;';

        const filteredCards = this.cards.filter(c => {
            if (this.filterTag && c.tag !== this.filterTag) return false;
            if (this.filterPriority && c.priority !== this.filterPriority) return false;
            return true;
        });

        const columns = [
            { id: 'todo', title: 'To Do', color: '#e74c3c' },
            { id: 'in-progress', title: 'In Progress', color: '#f39c12' },
            { id: 'done', title: 'Done', color: '#2ecc71' }
        ];

        this.container.innerHTML = `
            <div class="kb-toolbar" style="display:flex;gap:8px;padding:8px 12px;background:#252526;border-bottom:1px solid #333;align-items:center;">
                <button class="kb-btn kb-add-card" style="background:#007acc;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:bold;">+ Add Card</button>
                <span style="border-left:1px solid #444;height:20px;margin:0 4px;"></span>
                <label style="display:flex;align-items:center;gap:4px;">Filter Tag: 
                    <select class="kb-filter-tag" style="background:#333;color:#fff;border:1px solid #444;padding:4px;border-radius:3px;">
                        <option value="">All Tags</option>
                        <option value="Dev" ${this.filterTag === 'Dev' ? 'selected' : ''}>Dev</option>
                        <option value="QA" ${this.filterTag === 'QA' ? 'selected' : ''}>QA</option>
                        <option value="Docs" ${this.filterTag === 'Docs' ? 'selected' : ''}>Docs</option>
                    </select>
                </label>
                <label style="display:flex;align-items:center;gap:4px;">Priority: 
                    <select class="kb-filter-priority" style="background:#333;color:#fff;border:1px solid #444;padding:4px;border-radius:3px;">
                        <option value="">All Priorities</option>
                        <option value="High" ${this.filterPriority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Medium" ${this.filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${this.filterPriority === 'Low' ? 'selected' : ''}>Low</option>
                    </select>
                </label>
                <span style="flex-grow:1;"></span>
                <button class="kb-btn kb-save" style="background:#333;color:#fff;border:1px solid #444;padding:6px 12px;border-radius:4px;cursor:pointer;">Save Board</button>
            </div>
            <div class="kb-board" style="display:flex;gap:16px;padding:16px;flex-grow:1;overflow-x:auto;background:#181818;">
                ${columns.map(col => `
                    <div class="kb-column" data-status="${col.id}" style="flex:1;min-width:280px;background:#222;border-radius:6px;display:flex;flex-direction:column;border-top:4px solid ${col.color};overflow:hidden;">
                        <div style="padding:10px 12px;font-weight:bold;background:#2a2a2a;border-bottom:1px solid #333;display:flex;justify-content:space-between;">
                            <span>${col.title}</span>
                            <span style="background:#333;padding:2px 6px;border-radius:10px;font-size:11px;color:#aaa;">${filteredCards.filter(c => c.status === col.id).length}</span>
                        </div>
                        <div class="kb-column-cards" style="flex-grow:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;" data-status="${col.id}">
                            ${filteredCards.filter(c => c.status === col.id).map(card => `
                                <div class="kb-card" draggable="true" data-id="${card.id}" style="background:#2d2d2d;border-radius:4px;padding:10px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border-left:4px solid ${card.priority === 'High' ? '#e74c3c' : card.priority === 'Medium' ? '#f39c12' : '#3498db'};cursor:grab;">
                                    <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:4px;">
                                        <span>${Utils.escapeHtml(card.title)}</span>
                                        <button class="kb-delete-card" data-id="${card.id}" style="background:transparent;border:none;color:#888;cursor:pointer;font-size:14px;">✕</button>
                                    </div>
                                    <div style="font-size:12px;color:#aaa;margin-bottom:8px;">${Utils.escapeHtml(card.description)}</div>
                                    <div style="display:flex;justify-content:space-between;font-size:11px;color:#777;">
                                        <span style="background:#383838;padding:2px 6px;border-radius:3px;color:#ddd;">${Utils.escapeHtml(card.tag)}</span>
                                        <span>Due: ${Utils.escapeHtml(card.dueDate)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;

        this.container.querySelector('.kb-add-card').addEventListener('click', () => this.promptAddCard());
        this.container.querySelector('.kb-save').addEventListener('click', () => this.saveBoard());

        this.container.querySelector('.kb-filter-tag').addEventListener('change', (e) => {
            this.filterTag = e.target.value;
            this.render();
            this.setupEvents();
        });

        this.container.querySelector('.kb-filter-priority').addEventListener('change', (e) => {
            this.filterPriority = e.target.value;
            this.render();
            this.setupEvents();
        });

        this.container.querySelectorAll('.kb-card').forEach(cardEl => {
            cardEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', cardEl.dataset.id);
            });
        });

        this.container.querySelectorAll('.kb-column-cards').forEach(colEl => {
            colEl.addEventListener('dragover', (e) => e.preventDefault());
            colEl.addEventListener('drop', (e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData('text/plain');
                const newStatus = colEl.dataset.status;
                const card = this.cards.find(c => c.id === cardId);
                if (card) {
                    card.status = newStatus;
                    this.render();
                    this.setupEvents();
                    this.saveBoard();
                }
            });
        });

        this.container.querySelectorAll('.kb-delete-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardId = btn.dataset.id;
                this.cards = this.cards.filter(c => c.id !== cardId);
                this.render();
                this.setupEvents();
                this.saveBoard();
            });
        });
    }

    promptAddCard() {
        const title = prompt('Card Title:');
        if (!title) return;
        const description = prompt('Description:') || '';
        const tag = prompt('Tag (Dev, QA, Docs):') || 'Dev';
        const priority = prompt('Priority (High, Medium, Low):') || 'Medium';
        const dueDate = prompt('Due Date (YYYY-MM-DD):') || '2026-07-30';

        const newCard = {
            id: 'c_' + Utils.uuid().slice(0, 8),
            title,
            description,
            status: 'todo',
            priority,
            tag,
            dueDate
        };
        this.cards.push(newCard);
        this.render();
        this.setupEvents();
        this.saveBoard();
    }

    async loadBoard() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs && await vfs.exists(this.boardPath)) {
                const data = await vfs.readFile(this.boardPath);
                this.cards = JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load kanban board from VFS', e);
        }
    }

    async saveBoard() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs) {
                await vfs.writeFile(this.boardPath, JSON.stringify(this.cards, null, 2));
            }
        } catch (e) {
            console.warn('Failed to save kanban board', e);
        }
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default KanbanApp;
