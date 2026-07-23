// js/core/a11y.js
/**
 * WebOS Accessibility (a11y) Module
 */
class A11yManager {
    constructor() {
        this.politeRegion = null;
        this.assertiveRegion = null;
        this.activeFocusTrap = null;
        this.previousActiveElement = null;
        this.reducedMotion = false;
        this.initAnnouncer();
        this.initReducedMotion();
    }

    initAnnouncer() {
        if (typeof document === 'undefined') return;
        if (!document.getElementById('a11y-polite')) {
            const polite = document.createElement('div');
            polite.id = 'a11y-polite';
            polite.setAttribute('aria-live', 'polite');
            polite.setAttribute('aria-atomic', 'true');
            polite.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
            document.body.appendChild(polite);
            this.politeRegion = polite;
        } else {
            this.politeRegion = document.getElementById('a11y-polite');
        }

        if (!document.getElementById('a11y-assertive')) {
            const assertive = document.createElement('div');
            assertive.id = 'a11y-assertive';
            assertive.setAttribute('aria-live', 'assertive');
            assertive.setAttribute('aria-atomic', 'true');
            assertive.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
            document.body.appendChild(assertive);
            this.assertiveRegion = assertive;
        } else {
            this.assertiveRegion = document.getElementById('a11y-assertive');
        }
    }

    announce(message, priority = 'polite') {
        if (!message) return;
        const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
        if (!region) return;
        region.textContent = message;
    }

    trapFocus(element) {
        if (!element || typeof document === 'undefined') return;
        this.previousActiveElement = document.activeElement;
        this.activeFocusTrap = element;

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = element.querySelectorAll(focusableSelectors);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        firstElement.focus();

        this._trapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            } else if (e.key === 'Escape') {
                this.releaseFocus();
            }
        };

        element.addEventListener('keydown', this._trapHandler);
    }

    releaseFocus() {
        if (this.activeFocusTrap && this._trapHandler) {
            this.activeFocusTrap.removeEventListener('keydown', this._trapHandler);
            this._trapHandler = null;
            this.activeFocusTrap = null;
        }
        if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
            this.previousActiveElement.focus();
            this.previousActiveElement = null;
        }
    }

    initSkipLink(targetId = 'desktop') {
        if (typeof document === 'undefined') return;
        if (document.getElementById('skip-to-main')) return;

        const skipLink = document.createElement('a');
        skipLink.id = 'skip-to-main';
        skipLink.href = `#${targetId}`;
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = 'position:absolute;top:-40px;left:0;background:#000;color:#fff;padding:8px;z-index:100000;transition:top 0.2s;';
        skipLink.addEventListener('focus', () => { skipLink.style.top = '0'; });
        skipLink.addEventListener('blur', () => { skipLink.style.top = '-40px'; });
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(targetId);
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });

        if (document.body) {
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }

    setupRovingTabIndex(containerSelector, itemSelector = 'button, [tabindex]') {
        if (typeof document === 'undefined') return;
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        items.forEach((item, index) => {
            item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        container.addEventListener('keydown', (e) => {
            const items = Array.from(container.querySelectorAll(itemSelector));
            let currentIndex = items.indexOf(document.activeElement);
            if (currentIndex === -1) return;

            let nextIndex = currentIndex;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % items.length;
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
                e.preventDefault();
            } else if (e.key === 'Home') {
                nextIndex = 0;
                e.preventDefault();
            } else if (e.key === 'End') {
                nextIndex = items.length - 1;
                e.preventDefault();
            }

            if (nextIndex !== currentIndex) {
                items[currentIndex].setAttribute('tabindex', '-1');
                items[nextIndex].setAttribute('tabindex', '0');
                items[nextIndex].focus();
            }
        });
    }

    initGlobalKeyboard() {
        if (typeof document === 'undefined') return;
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                if (e.key.toLowerCase() === 'm') {
                    e.preventDefault();
                    const startBtn = document.getElementById('start-button');
                    if (startBtn) startBtn.focus();
                    this.announce('Menu focused', 'polite');
                } else if (e.key.toLowerCase() === 'f') {
                    e.preventDefault();
                    const fileMenu = document.querySelector('[data-menu="file"], .menu-file');
                    if (fileMenu) fileMenu.focus();
                    this.announce('File menu focused', 'polite');
                }
            } else if (e.key === 'Escape') {
                const startMenu = document.getElementById('start-menu');
                if (startMenu && startMenu.style.display === 'block') {
                    startMenu.style.display = 'none';
                    const startBtn = document.getElementById('start-button');
                    if (startBtn) startBtn.focus();
                    e.preventDefault();
                }
            }
        });
    }

    initReducedMotion() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotion = mediaQuery.matches;
            mediaQuery.addEventListener('change', (e) => {
                this.reducedMotion = e.matches;
                if (window.WebOSEventBus) {
                    window.WebOSEventBus.emit('reduced-motion-changed', { reducedMotion: this.reducedMotion });
                }
            });
        }
    }

    isReducedMotion() {
        return this.reducedMotion;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSA11y = new A11yManager();
    window.addEventListener('DOMContentLoaded', () => {
        window.WebOSA11y.initSkipLink();
        window.WebOSA11y.initGlobalKeyboard();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { A11yManager };
}
