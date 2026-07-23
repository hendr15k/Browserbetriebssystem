// js/core/voice-input.js
/**
 * WebOS Voice Input Module (Web Speech API Integration)
 */
class VoiceInput {
    constructor() {
        this.active = false;
        this.paused = false;
        this.transcript = '';
        this.interimTranscript = '';
        this.language = 'en-US';
        this.continuous = true;
        this.recognition = null;
        this._initSpeechRecognition();
    }

    _initSpeechRecognition() {
        const SpeechRec = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);
        if (SpeechRec) {
            try {
                this.recognition = new SpeechRec();
                this.recognition.continuous = this.continuous;
                this.recognition.interimResults = true;
                this.recognition.lang = this.language;

                this.recognition.onstart = () => {
                    this.active = true;
                    this.paused = false;
                    this._emit('voice:start', { timestamp: Date.now() });
                };

                this.recognition.onresult = (event) => {
                    let interim = '';
                    let finalStr = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalStr += event.results[i][0].transcript;
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    if (finalStr) {
                        this.transcript += (this.transcript ? ' ' : '') + finalStr;
                    }
                    this.interimTranscript = interim;
                    this._emit('voice:result', { transcript: this.transcript, interim: this.interimTranscript });
                };

                this.recognition.onerror = (event) => {
                    this._emit('voice:error', { error: event.error });
                };

                this.recognition.onend = () => {
                    this.active = false;
                    this._emit('voice:end', { transcript: this.transcript });
                };
            } catch (e) {
                this.recognition = null;
            }
        }
    }

    _emit(eventName, detail) {
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit(eventName, detail);
        }
    }

    start(lang = this.language) {
        this.language = lang;
        if (this.recognition) {
            try {
                this.recognition.lang = this.language;
                this.recognition.start();
                this.active = true;
                return true;
            } catch (e) {
                // already started or blocked
            }
        }
        // Fallback simulation
        this.active = true;
        this._emit('voice:start', { timestamp: Date.now(), simulated: true });
        return false;
    }

    stop() {
        if (this.recognition && this.active) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        this.active = false;
        this.paused = false;
        this._emit('voice:end', { transcript: this.transcript });
    }

    pause() {
        if (this.active) {
            this.paused = true;
            this.stop();
        }
    }

    resume() {
        if (this.paused) {
            this.paused = false;
            this.start(this.language);
        }
    }

    getTranscript() {
        return this.transcript;
    }

    getInterimTranscript() {
        return this.interimTranscript;
    }

    simulateInput(text) {
        this.transcript += (this.transcript ? ' ' : '') + text;
        this._emit('voice:result', { transcript: this.transcript, interim: '' });
    }
}

if (typeof window !== 'undefined') {
    window.WebOSVoiceInput = new VoiceInput();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceInput };
}
