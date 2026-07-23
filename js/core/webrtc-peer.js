// js/core/webrtc-peer.js
class WebRTCPeer {
    constructor(options = {}) {
        this.options = options;
        this.config = options.config || { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        this.state = 'new';
        this.pc = null;
        this.dataChannel = null;
        this.isMock = options.isMock || (typeof RTCPeerConnection === 'undefined');
        this.listeners = {
            stateChange: [],
            message: [],
            error: [],
            iceCandidate: []
        };
        this.remotePeer = options.remotePeer || null;
        this._initPeer();
    }

    _initPeer() {
        if (this.isMock) {
            this.state = 'new';
            return;
        }
        try {
            this.pc = new RTCPeerConnection(this.config);
            this.pc.onconnectionstatechange = () => {
                this._setState(this.pc.connectionState);
            };
            this.pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this._trigger('iceCandidate', event.candidate);
                }
            };
            this.pc.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this._setupDataChannel();
            };
        } catch (e) {
            this._setState('failed');
            this._trigger('error', e);
        }
    }

    _setState(newState) {
        this.state = newState;
        this._trigger('stateChange', newState);
    }

    _setupDataChannel() {
        if (!this.dataChannel) return;
        this.dataChannel.onopen = () => this._setState('connected');
        this.dataChannel.onclose = () => this._setState('disconnected');
        this.dataChannel.onerror = (e) => this._trigger('error', e);
        this.dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this._trigger('message', data);
            } catch (e) {
                this._trigger('message', event.data);
            }
        };
    }

    async createPeer(options = {}) {
        if (this.isMock) {
            this._setState('connecting');
            setTimeout(() => this._setState('connected'), 50);
            return { type: 'offer', sdp: 'mock-sdp-offer' };
        }
        this.dataChannel = this.pc.createDataChannel(options.channelName || 'webos-data', options.dataChannelOptions || {});
        this._setupDataChannel();
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        return offer;
    }

    async offer() {
        return this.createPeer();
    }

    async answer(offer) {
        if (this.isMock) {
            this._setState('connecting');
            setTimeout(() => this._setState('connected'), 50);
            if (this.remotePeer) {
                this.remotePeer._setState('connected');
            }
            return { type: 'answer', sdp: 'mock-sdp-answer' };
        }
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        return answer;
    }

    async handleAnswer(answer) {
        if (this.isMock) return;
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async addIceCandidate(candidate) {
        if (this.isMock) return;
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            this._trigger('error', e);
        }
    }

    send(data) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        if (this.isMock) {
            if (this.remotePeer) {
                setTimeout(() => {
                    this.remotePeer._trigger('message', data);
                }, 10);
            }
            return true;
        }
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(payload);
            return true;
        }
        return false;
    }

    on(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    off(type, callback) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }

    close() {
        if (this.isMock) {
            this._setState('closed');
            return;
        }
        if (this.dataChannel) this.dataChannel.close();
        if (this.pc) this.pc.close();
        this._setState('closed');
    }

    _trigger(type, data) {
        if (this.listeners[type]) {
            this.listeners[type].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error(`WebRTCPeer event error [${type}]:`, e);
                }
            });
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSWebRTCPeer = WebRTCPeer;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebRTCPeer };
}
