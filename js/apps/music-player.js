// js/apps/music-player.js
/**
 * WebOS Music Player App — HTML5 Audio wrapper, playlist management in VFS, Visualizer analyser canvas, 5-band EQ, loop/shuffle, and LRC lyrics viewer.
 */
import Utils from '../core/utils.js';

export class MusicPlayerApp {
    constructor() {
        this.container = null;
        this.audio = new Audio();
        this.playlistPath = '/home/user/music/playlist.json';
        this.playlist = [
            { title: 'Synthwave Odyssey', artist: 'WebOS Audio', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', lyrics: '[00:00] Synthwave Odyssey start\n[00:10] Flying through neon skies\n[00:30] Digital dreams never die' },
            { title: 'Chilled Lofi Beats', artist: 'Lo-Fi Master', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', lyrics: '[00:00] Chilled Lofi beats intro\n[00:15] Relax and study hard\n[00:40] Coffee cups and rain' },
            { title: 'Cyberpunk Chase', artist: 'NetRunner', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', lyrics: '[00:00] Cyberpunk chase action\n[00:20] Alleys in the dark\n[00:50] System breach successful' }
        ];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isLoop = false;
        this.isShuffle = false;
        this.audioCtx = null;
        this.analyser = null;
        this.sourceNode = null;
        this.eqFilters = [];
        this.animationFrameId = null;
    }

    async init(container, options = {}) {
        this.container = container;
        await this.loadPlaylist();
        this.render();
        this.setupAudio();
        this.setupEvents();
    }

    render() {
        if (!this.container) return;
        this.container.className = 'music-player-app os-app-container';
        this.container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#181818;color:#fff;font-family:sans-serif;font-size:13px;';

        this.container.innerHTML = `
            <div class="mp-header" style="padding:12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:16px;color:#1ed760;">WebOS Music Player</h3>
                <span class="mp-current-track-name" style="color:#aaa;">${this.playlist[this.currentIndex]?.title || 'No Track'}</span>
            </div>
            <div class="mp-body" style="display:flex;flex-grow:1;overflow:hidden;">
                <div class="mp-sidebar" style="width:250px;border-right:1px solid #333;display:flex;flex-direction:column;background:#121212;">
                    <div style="padding:8px;font-weight:bold;border-bottom:1px solid #222;font-size:12px;color:#888;">PLAYLIST</div>
                    <ul class="mp-playlist-list" style="list-style:none;margin:0;padding:0;overflow-y:auto;flex-grow:1;">
                        ${this.playlist.map((track, i) => `
                            <li data-index="${i}" style="padding:8px 12px;border-bottom:1px solid #222;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${i === this.currentIndex ? '#282828' : 'transparent'};">
                                <div><div style="font-weight:500;">${Utils.escapeHtml(track.title)}</div><div style="font-size:11px;color:#888;">${Utils.escapeHtml(track.artist)}</div></div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="mp-main" style="flex-grow:1;display:flex;flex-direction:column;padding:16px;gap:12px;overflow-y:auto;">
                    <div style="display:flex;gap:16px;height:180px;">
                        <canvas class="mp-visualizer" width="300" height="180" style="background:#111;border-radius:6px;flex-grow:1;"></canvas>
                        <div class="mp-lyrics-box" style="width:250px;background:#111;border-radius:6px;padding:12px;overflow-y:auto;font-family:monospace;font-size:12px;color:#aaa;">
                            <div style="font-weight:bold;color:#1ed760;margin-bottom:6px;">Lyrics</div>
                            <div class="mp-lyrics-content">No lyrics available</div>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">
                            <span class="mp-time-current">0:00</span>
                            <span class="mp-time-total">0:00</span>
                        </div>
                        <input type="range" class="mp-seek" min="0" max="100" value="0" style="width:100%;cursor:pointer;">
                    </div>
                    <div style="display:flex;justify-content:center;gap:16px;align-items:center;margin-top:6px;">
                        <button class="mp-btn mp-shuffle" title="Shuffle" style="background:transparent;border:none;color:#aaa;cursor:pointer;font-size:16px;">🔀</button>
                        <button class="mp-btn mp-prev" title="Previous" style="background:#282828;color:#fff;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;">⏮</button>
                        <button class="mp-btn mp-play" title="Play/Pause" style="background:#1ed760;color:#000;border:none;width:48px;height:48px;border-radius:50%;cursor:pointer;font-weight:bold;font-size:18px;">▶</button>
                        <button class="mp-btn mp-next" title="Next" style="background:#282828;color:#fff;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;">⏭</button>
                        <button class="mp-btn mp-loop" title="Loop" style="background:transparent;border:none;color:#aaa;cursor:pointer;font-size:16px;">🔁</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;background:#222;padding:8px 12px;border-radius:6px;">
                        <label style="display:flex;align-items:center;gap:8px;">Volume: <input type="range" class="mp-volume" min="0" max="1" step="0.01" value="0.8" style="width:100px;"></label>
                        <div style="display:flex;gap:12px;align-items:center;">
                            <span style="font-size:12px;color:#888;">5-Band EQ:</span>
                            <label style="font-size:11px;">60Hz <input type="range" class="mp-eq" data-band="0" min="-20" max="20" value="0" style="width:50px;"></label>
                            <label style="font-size:11px;">250Hz <input type="range" class="mp-eq" data-band="1" min="-20" max="20" value="0" style="width:50px;"></label>
                            <label style="font-size:11px;">1kHz <input type="range" class="mp-eq" data-band="2" min="-20" max="20" value="0" style="width:50px;"></label>
                            <label style="font-size:11px;">4kHz <input type="range" class="mp-eq" data-band="3" min="-20" max="20" value="0" style="width:50px;"></label>
                            <label style="font-size:11px;">16kHz <input type="range" class="mp-eq" data-band="4" min="-20" max="20" value="0" style="width:50px;"></label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupAudio() {
        this.audio.crossOrigin = 'anonymous';
        this.loadTrack(this.currentIndex);
    }

    setupEvents() {
        if (!this.container) return;

        this.container.querySelector('.mp-play').addEventListener('click', () => this.togglePlay());
        this.container.querySelector('.mp-next').addEventListener('click', () => this.nextTrack());
        this.container.querySelector('.mp-prev').addEventListener('click', () => this.prevTrack());
        this.container.querySelector('.mp-loop').addEventListener('click', (e) => {
            this.isLoop = !this.isLoop;
            e.target.style.color = this.isLoop ? '#1ed760' : '#aaa';
            this.audio.loop = this.isLoop;
        });
        this.container.querySelector('.mp-shuffle').addEventListener('click', (e) => {
            this.isShuffle = !this.isShuffle;
            e.target.style.color = this.isShuffle ? '#1ed760' : '#aaa';
        });

        this.container.querySelector('.mp-volume').addEventListener('input', (e) => {
            this.audio.volume = Number(e.target.value);
        });

        const seek = this.container.querySelector('.mp-seek');
        seek.addEventListener('input', (e) => {
            if (this.audio.duration) {
                this.audio.currentTime = (Number(e.target.value) / 100) * this.audio.duration;
            }
        });

        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const pct = (this.audio.currentTime / this.audio.duration) * 100;
                seek.value = pct;
                this.container.querySelector('.mp-time-current').textContent = this.formatTime(this.audio.currentTime);
                this.container.querySelector('.mp-time-total').textContent = this.formatTime(this.audio.duration);
                this.updateLyrics(this.audio.currentTime);
            }
        });

        this.audio.addEventListener('ended', () => {
            if (this.isLoop) {
                this.audio.play();
            } else {
                this.nextTrack();
            }
        });

        // Playlist click
        this.container.querySelector('.mp-playlist-list').addEventListener('click', (e) => {
            const li = e.target.closest('li[data-index]');
            if (!li) return;
            this.currentIndex = Number(li.dataset.index);
            this.loadTrack(this.currentIndex, true);
        });

        // EQ sliders
        this.container.querySelectorAll('.mp-eq').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const bandIdx = Number(e.target.dataset.band);
                const gain = Number(e.target.value);
                if (this.eqFilters[bandIdx]) {
                    this.eqFilters[bandIdx].gain.value = gain;
                }
            });
        });
    }

    async initAudioContext() {
        if (this.audioCtx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.audioCtx = new AudioContext();
            this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;

            // 5-band EQ filters
            const frequencies = [60, 250, 1000, 4000, 16000];
            let lastNode = this.sourceNode;
            this.eqFilters = frequencies.map(freq => {
                const filter = this.audioCtx.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                lastNode.connect(filter);
                lastNode = filter;
                return filter;
            });

            lastNode.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
            this.startVisualizer();
        } catch (e) {
            console.warn('Web Audio API not fully supported or blocked', e);
        }
    }

    startVisualizer() {
        const canvas = this.container.querySelector('.mp-visualizer');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationFrameId = requestAnimationFrame(draw);
            this.analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = `rgb(${barHeight + 50}, 215, 96)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    }

    loadTrack(index, autoPlay = false) {
        if (index < 0 || index >= this.playlist.length) return;
        this.currentIndex = index;
        const track = this.playlist[this.currentIndex];
        this.audio.src = track.src;
        
        if (this.container) {
            this.container.querySelector('.mp-current-track-name').textContent = track.title;
            const lyricsContent = this.container.querySelector('.mp-lyrics-content');
            if (lyricsContent) lyricsContent.textContent = track.lyrics || 'No lyrics available';
            
            // Highlight active playlist item
            this.container.querySelectorAll('.mp-playlist-list li').forEach((li, i) => {
                li.style.background = i === this.currentIndex ? '#282828' : 'transparent';
            });
        }

        if (autoPlay) {
            this.initAudioContext();
            this.audio.play().catch(e => console.warn('Autoplay prevented', e));
            this.isPlaying = true;
            this.updatePlayButton();
        }
    }

    togglePlay() {
        this.initAudioContext();
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play().catch(e => console.warn('Play failed', e));
            this.isPlaying = true;
        }
        this.updatePlayButton();
    }

    updatePlayButton() {
        if (!this.container) return;
        const btn = this.container.querySelector('.mp-play');
        if (btn) btn.textContent = this.isPlaying ? '⏸' : '▶';
    }

    nextTrack() {
        let nextIdx = this.currentIndex + 1;
        if (this.isShuffle) {
            nextIdx = Math.floor(Math.random() * this.playlist.length);
        }
        if (nextIdx >= this.playlist.length) nextIdx = 0;
        this.loadTrack(nextIdx, true);
    }

    prevTrack() {
        let prevIdx = this.currentIndex - 1;
        if (prevIdx < 0) prevIdx = this.playlist.length - 1;
        this.loadTrack(prevIdx, true);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    updateLyrics(currentTime) {
        const track = this.playlist[this.currentIndex];
        if (!track || !track.lyrics || !this.container) return;
        const lines = track.lyrics.split('\n');
        let activeLyric = '';
        for (const line of lines) {
            const match = line.match(/^\[(\d{2}):(\d{2})\](.*)$/);
            if (match) {
                const timeSec = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
                if (currentTime >= timeSec) {
                    activeLyric = match[3].trim();
                }
            }
        }
        const lyricsBox = this.container.querySelector('.mp-lyrics-content');
        if (lyricsBox && activeLyric) {
            lyricsBox.textContent = activeLyric;
        }
    }

    async loadPlaylist() {
        try {
            const vfs = window.VFS || (await import('../core/vfs.js')).VirtualFileSystem.getInstance?.();
            if (vfs && await vfs.exists(this.playlistPath)) {
                const data = await vfs.readFile(this.playlistPath);
                this.playlist = JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load playlist from VFS, using default', e);
        }
    }

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.audio.pause();
        if (this.container) this.container.innerHTML = '';
        this.container = null;
    }
}

export default MusicPlayerApp;
