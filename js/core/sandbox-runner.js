// js/core/sandbox-runner.js
/**
 * WebOS Sandbox Runner — Iframe-based sandbox for untrusted code execution with postMessage bridge and timeout.
 */
class SandboxRunner {
    constructor() {
        this.sandboxes = new Map();
        this.nextId = 1;
    }

    createSandbox(options = {}) {
        const id = `sandbox_${this.nextId++}`;
        const sandboxAttr = options.sandbox || 'allow-scripts';
        const srcdoc = options.srcdoc || '<script>window.addEventListener("message", (e) => { window.parent.postMessage({ type: "ack", echo: e.data }, "*"); });</script>';
        const originWhitelist = options.originWhitelist || ['*'];
        const runnerInstance = this;

        let iframe = null;
        if (typeof document !== 'undefined') {
            iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', sandboxAttr);
            iframe.setAttribute('srcdoc', srcdoc);
            iframe.style.display = 'none';
            if (options.referrerPolicy) {
                iframe.referrerPolicy = options.referrerPolicy;
            }
            document.body.appendChild(iframe);
        }

        const listeners = new Map();
        const pendingRequests = new Map();

        const messageHandler = (event) => {
            // Check origin if needed
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            const type = data.type;
            const requestId = data.requestId;

            if (requestId && pendingRequests.has(requestId)) {
                const req = pendingRequests.get(requestId);
                clearTimeout(req.timer);
                pendingRequests.delete(requestId);
                if (data.error) {
                    req.reject(new Error(data.error));
                } else {
                    req.resolve(data.payload);
                }
            }

            if (type && listeners.has(type)) {
                for (const cb of listeners.get(type)) {
                    try {
                        cb(data.payload);
                    } catch (e) {
                        console.error(`Error in sandbox listener [${type}]:`, e);
                    }
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('message', messageHandler);
        }

        const instance = {
            id,
            iframe,
            send(type, payload, timeoutMs = 5000) {
                return new Promise((resolve, reject) => {
                    const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
                    const timer = setTimeout(() => {
                        pendingRequests.delete(requestId);
                        reject(new Error(`Sandbox request timeout for type: ${type}`));
                    }, timeoutMs);

                    pendingRequests.set(requestId, { resolve, reject, timer });

                    const message = { type, payload, requestId };
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(message, '*');
                    } else {
                    // Mock fallback for node test environment
                    setTimeout(() => {
                        pendingRequests.delete(requestId);
                        resolve({ echo: payload });
                    }, 10);
                    }
                });
            },
            on(type, callback) {
                if (!listeners.has(type)) {
                    listeners.set(type, []);
                }
                listeners.get(type).push(callback);
            },
            terminate() {
                if (iframe && iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
                if (typeof window !== 'undefined') {
                    window.removeEventListener('message', messageHandler);
                }
                runnerInstance.sandboxes.delete(id);
            }
        };

        this.sandboxes.set(id, instance);
        return instance;
    }

    renderMarkdownPreview(markdownContent) {
        // Demo App requirement: Markdown preview renders HTML in sandbox and posts rendered output
        const html = markdownContent
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return this.createSandbox({
            srcdoc: `<html><body><div id="content">${html}</div><script>
                window.parent.postMessage({ type: 'markdown-rendered', payload: document.getElementById('content').innerHTML }, '*');
            </script></html>`
        });
    }
}

if (typeof window !== 'undefined') {
    window.WebOSSandboxRunner = { SandboxRunner, instance: new SandboxRunner() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandboxRunner };
}
