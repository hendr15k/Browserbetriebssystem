// js/core/virtual-list.js
/**
 * WebOS Virtual List — High performance virtual scrolling for large datasets.
 */
class VirtualList {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.itemHeight = options.itemHeight || 30;
        this.overscan = options.overscan !== undefined ? options.overscan : 5;
        this.renderItem = options.renderItem || ((item, index) => {
            const div = document.createElement('div');
            div.textContent = typeof item === 'object' ? (item.name || JSON.stringify(item)) : String(item);
            return div;
        });

        this.items = [];
        this.scrollTop = 0;
        this.viewportHeight = this.container ? (this.container.clientHeight || 300) : 300;

        this.setupDOM();
        this.bindEvents();
    }

    setupDOM() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflowY = 'auto';

        this.phantom = document.createElement('div');
        this.phantom.className = 'virtual-phantom';
        this.phantom.style.width = '100%';
        this.container.appendChild(this.phantom);

        this.content = document.createElement('div');
        this.content.className = 'virtual-content';
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.width = '100%';
        this.container.appendChild(this.content);
    }

    bindEvents() {
        if (!this.container) return;
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        });
    }

    setItems(items) {
        this.items = items || [];
        if (this.phantom) {
            this.phantom.style.height = `${this.items.length * this.itemHeight}px`;
        }
        this.render();
    }

    scrollTo(index) {
        if (!this.container) return;
        const targetTop = Math.max(0, index * this.itemHeight);
        this.container.scrollTop = targetTop;
        this.scrollTop = targetTop;
        this.render();
    }

    getVisibleRange() {
        const height = this.container ? (this.container.clientHeight || this.viewportHeight) : 300;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const visibleCount = Math.ceil(height / this.itemHeight);

        const start = Math.max(0, startIndex - this.overscan);
        const end = Math.min(this.items.length, startIndex + visibleCount + this.overscan);

        return { start, end };
    }

    render() {
        if (!this.content || !this.container) return;
        const { start, end } = this.getVisibleRange();

        this.content.style.transform = `translateY(${start * this.itemHeight}px)`;
        this.content.innerHTML = '';

        const fragment = document.createDocumentFragment();
        for (let i = start; i < end; i++) {
            if (i >= this.items.length) break;
            const el = this.renderItem(this.items[i], i);
            if (el) {
                if (el.style) {
                    el.style.height = `${this.itemHeight}px`;
                    el.style.boxSizing = 'border-box';
                }
                fragment.appendChild(el);
            }
        }
        this.content.appendChild(fragment);
    }
}

if (typeof window !== 'undefined') {
    window.WebOSVirtualList = VirtualList;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VirtualList };
}
