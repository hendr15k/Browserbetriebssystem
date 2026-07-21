// js/core/sound-manager.js
/**
 * WebOS Sound Effects Manager (Web Audio API)
 */
class SoundManager {
    constructor() {
        this.enabled = true;
    }

    playTone(frequency = 440, duration = 100, type = 'sine') {
        if (!this.enabled || typeof window === 'undefined') return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration / 1000);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration / 1000);
        } catch (e) {
            // Audio context not allowed or supported
        }
    }

    click() { this.playTone(600, 50, 'triangle'); }
    startup() { this.playTone(523.25, 200, 'sine'); setTimeout(() => this.playTone(659.25, 300, 'sine'), 200); }
    error() { this.playTone(150, 200, 'sawtooth'); }
}

if (typeof window !== 'undefined') {
    window.WebOSSound = new SoundManager();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager };
}
