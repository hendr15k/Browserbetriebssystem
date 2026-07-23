// js/apps/pomodoro.js
/**
 * WebOS Pomodoro App — Pomodoro (25m), Short Break (5m), Long Break (15m) with cycle counter, SoundManager notification, and VFS statistics.
 */
import Utils from '../core/utils.js';

export class PomodoroApp {
    constructor() {
        this.container = null;
        this.modes = {
            pomodoro: { name: 'Pomodoro', duration: 25 * 60 },
            shortBreak: { name: 'Short Break', duration: 5 * 60 },
            longBreak: { name: 'Long Break', duration: 15 * 60 }
        };
        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes.pomodoro.duration;
        this.timerId = null;
        this.isRunning = false;
        this.cycles = 0;
        this.statsPath = '/home/user/pomodoro_stats.json';
        this.stats = { totalPomodoros: 0, dates: {} };
    }

    async init(container, options = {}) {
        this.container = container;
        await this.loadStats();
        this.render();
        this.setupEvents();
        this.updateDisplay();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'pomodoro-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#b83232;color:#fff;font-family:sans-serif;align-items:center;justify-content:center;transition:background 0.3s;';

        this.container.innerHTML = `
            <div class="pomo-card" style="background:rgba(0,0,0,0.25);padding:30px 40px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);text-align:center;width:380px;">
                <div class="pomo-tabs" style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;">
                    <button class="pomo-tab active" data-mode="pomodoro" style="background:rgba(0,0,0,0.3);border:none;color:#fff;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:bold;">Pomodoro</button>
                    <button class="pomo-tab" data-mode="shortBreak" style="background:transparent;border:none;color:#fff;padding:6px 12px;border-radius:4px;cursor:pointer;">Short Break</button>
                    <button class="pomo-tab" data-mode="longBreak" style="background:transparent;border:none;color:#fff;padding:6px 12px;border-radius:4px;cursor:pointer;">Long Break</button>
                </div>
                <div class="pomo-timer" style="font-size:72px;font-weight:bold;font-family:monospace;margin:20px 0;letter-spacing:2px;">25:00</div>
                <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;">
                    <button class="pomo-btn pomo-start" style="background:#fff;color:#b83232;border:none;padding:10px 30px;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;">START</button>
                    <button class="pomo-btn pomo-reset" style="background:transparent;border:2px solid #fff;color:#fff;padding:10px 20px;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;">RESET</button>
                </div>
                <div style="font-size:13px;opacity:0.8;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;">
                    <span>Completed Cycles: <strong class="pomo-cycles">0</strong></span>
                    <span>Total Pomodoros: <strong class="pomo-total">0</strong></span>
                </div>
            </div>
        `;
    }

    setupEvents() {
        if (!this.container) return;

        this.container.querySelectorAll('.pomo-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setMode(tab.dataset.mode);
            });
        });

        this.container.querySelector('.pomo-start').addEventListener('click', () => this.toggleTimer());
        this.container.querySelector('.pomo-reset').addEventListener('click', () => this.resetTimer());
    }

    setMode(modeKey) {
        if (!this.modes[modeKey]) return;
        this.stopTimer();
        this.currentMode = modeKey;
        this.timeLeft = this.modes[modeKey].duration;

        // Background color theme per mode
        if (this.container) {
            this.container.style.background = modeKey === 'pomodoro' ? '#b83232' : modeKey === 'shortBreak' ? '#2d8a56' : '#2d628a';
            const startBtn = this.container.querySelector('.pomo-start');
            if (startBtn) startBtn.style.color = modeKey === 'pomodoro' ? '#b83232' : modeKey === 'shortBreak' ? '#2d8a56' : '#2d628a';

            this.container.querySelectorAll('.pomo-tab').forEach(t => {
                t.style.background = t.dataset.mode === modeKey ? 'rgba(0,0,0,0.3)' : 'transparent';
                t.style.fontWeight = t.dataset.mode === modeKey ? 'bold' : 'normal';
            });
        }
        this.updateDisplay();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        if (this.container) this.container.querySelector('.pomo-start').textContent = 'PAUSE';

        this.timerId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.onTimerComplete();
            }
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = null;
        if (this.container) this.container.querySelector('.pomo-start').textContent = 'START';
    }

    resetTimer() {
        this.stopTimer();
        this.timeLeft = this.modes[this.currentMode].duration;
        this.updateDisplay();
    }

    onTimerComplete() {
        this.stopTimer();
        this.playNotificationSound();

        if (this.currentMode === 'pomodoro') {
            this.cycles++;
            this.stats.totalPomodoros++;
            const today = new Date().toISOString().split('T')[0];
            this.stats.dates[today] = (this.stats.dates[today] || 0) + 1;
            this.saveStats();

            // Auto rotate after 4 pomodoros
            if (this.cycles % 4 === 0) {
                this.setMode('longBreak');
            } else {
                this.setMode('shortBreak');
            }
        } else {
            this.setMode('pomodoro');
        }
    }

    updateDisplay() {
        if (!this.container) return;
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const timeStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        const timerView = this.container.querySelector('.pomo-timer');
        if (timerView) timerView.textContent = timeStr;

        const cyclesView = this.container.querySelector('.pomo-cycles');
        if (cyclesView) cyclesView.textContent = this.cycles;

        const totalView = this.container.querySelector('.pomo-total');
        if (totalView) totalView.textContent = this.stats.totalPomodoros;
    }

    playNotificationSound() {
        try {
            const SoundManager = window.SoundManager || null;
            if (SoundManager && typeof SoundManager.playTone === 'function') {
                SoundManager.playTone(587.33, 0.3);
            }
        } catch (e) {
            console.warn('Sound notification failed', e);
        }
    }

    async loadStats() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs && await vfs.exists(this.statsPath)) {
                const data = await vfs.readFile(this.statsPath);
                this.stats = JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load pomodoro stats', e);
        }
    }

    async saveStats() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs) {
                await vfs.writeFile(this.statsPath, JSON.stringify(this.stats, null, 2));
            }
        } catch (e) {
            console.warn('Failed to save pomodoro stats', e);
        }
    }

    destroy() {
        this.stopTimer();
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default PomodoroApp;
