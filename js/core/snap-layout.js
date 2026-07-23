(function(global) {
  'use strict';

  const MIN_SIZE = 300;
  const THRESHOLD = 30;

  class SnapLayout {
    constructor(options = {}) {
      this.eventBus = options.eventBus || (global.WebOS && global.WebOS.eventBus);
      this.enabled = true;
      this.currentZone = null;
      this.minWidth = MIN_SIZE;
      this.minHeight = MIN_SIZE;
      this.threshold = THRESHOLD;
    }

    _emit(type, payload) {
      if (this.eventBus && typeof this.eventBus.emit === 'function') {
        try { this.eventBus.emit(type, payload); } catch (e) {}
      }
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    toggle() { this.enabled = !this.enabled; return this.enabled; }

    _screenSize() {
      if (typeof screen !== 'undefined' && screen.availWidth) {
        return { width: screen.availWidth, height: screen.availHeight };
      }
      if (typeof window !== 'undefined') {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      return { width: 1920, height: 1080 };
    }

    getSnapZones(container) {
      const size = container || this._screenSize();
      const w = size.width, h = size.height;
      return [
        { id: 'left',         x: 0,             y: 0,             width: w / 2,           height: h },
        { id: 'right',        x: w / 2,         y: 0,             width: w / 2,           height: h },
        { id: 'top',          x: 0,             y: 0,             width: w,               height: h / 2 },
        { id: 'bottom',       x: 0,             y: h / 2,         width: w,               height: h / 2 },
        { id: 'top-left',     x: 0,             y: 0,             width: w / 2,           height: h / 2 },
        { id: 'top-right',    x: w / 2,         y: 0,             width: w / 2,           height: h / 2 },
        { id: 'bottom-left',  x: 0,             y: h / 2,         width: w / 2,           height: h / 2 },
        { id: 'bottom-right', x: w / 2,         y: h / 2,         width: w / 2,           height: h / 2 },
        { id: 'maximize',     x: 0,             y: 0,             width: w,               height: h }
      ];
    }

    detectZone(x, y, container) {
      if (!this.enabled) return null;
      if (typeof x !== 'number' || typeof y !== 'number') return null;
      const size = container || this._screenSize();
      const zones = this.getSnapZones(size);
      const w = size.width, h = size.height;
      const cornerSize = Math.min(w, h) / 4;

      const nearLeft = x < cornerSize;
      const nearRight = x > w - cornerSize;
      const nearTop = y < cornerSize;
      const nearBottom = y > h - cornerSize;

      if (nearTop && nearLeft) return zones.find(z => z.id === 'top-left');
      if (nearTop && nearRight) return zones.find(z => z.id === 'top-right');
      if (nearBottom && nearLeft) return zones.find(z => z.id === 'bottom-left');
      if (nearBottom && nearRight) return zones.find(z => z.id === 'bottom-right');
      if (nearTop) return zones.find(z => z.id === 'top');
      if (nearBottom) return zones.find(z => z.id === 'bottom');
      if (x < w / 2) return zones.find(z => z.id === 'left');
      if (x > w / 2) return zones.find(z => z.id === 'right');
      return null;
    }

    canSnap(windowSize) {
      if (!windowSize) return true;
      const w = windowSize.width || 0;
      const h = windowSize.height || 0;
      return w >= this.minWidth && h >= this.minHeight;
    }

    snap(zone, windowSize) {
      if (!zone) return null;
      if (!this.canSnap(windowSize)) return null;
      this.currentZone = zone;
      this._emit('snap:layout', { zone, windowSize });
      return {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      };
    }

    getMultiMonitorLayout() {
      if (typeof screen === 'undefined') return null;
      const monitors = [];
      try {
        if (navigator.userAgent.includes('Windows')) {
          monitors.push({
            id: 0,
            x: 0, y: 0,
            width: screen.availWidth,
            height: screen.availHeight,
            primary: true
          });
        }
      } catch (e) {}
      return monitors.length > 0 ? monitors : null;
    }
  }

  const api = { SnapLayout };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnapLayout };
  }
  global.WebOSSnapLayout = api;
  if (global.WebOS) global.WebOS.SnapLayout = SnapLayout;
  if (global.window) global.window.WebOSSnapLayout = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));