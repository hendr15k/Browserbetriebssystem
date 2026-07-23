// js/core/http-client.js
class HttpResponse {
    constructor(response, data) {
        this.status = response.status;
        this.statusText = response.statusText;
        this.headers = response.headers;
        this.ok = response.ok;
        this.url = response.url;
        this.data = data;
    }
    json() { return this.data; }
    text() { return typeof this.data === 'string' ? this.data : JSON.stringify(this.data); }
}

class HttpClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '';
        this.defaultHeaders = options.headers || { 'Content-Type': 'application/json' };
        this.defaultTimeout = options.timeout || 10000;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.cache = new Map();
        this.mockAdapter = options.mockAdapter || null;
    }

    addRequestInterceptor(fn) {
        this.requestInterceptors.push(fn);
    }

    addResponseInterceptor(fn) {
        this.responseInterceptors.push(fn);
    }

    async get(url, options = {}) {
        return this.request('GET', url, null, options);
    }

    async post(url, body, options = {}) {
        return this.request('POST', url, body, options);
    }

    async put(url, body, options = {}) {
        return this.request('PUT', url, body, options);
    }

    async delete(url, options = {}) {
        return this.request('DELETE', url, null, options);
    }

    async patch(url, body, options = {}) {
        return this.request('PATCH', url, body, options);
    }

    async upload(url, file, options = {}) {
        const formData = new FormData();
        const fieldName = options.fieldName || 'file';
        formData.append(fieldName, file, file.name);

        const xhrOptions = {
            ...options,
            body: formData,
            headers: { ...(options.headers || {}) }
        };
        delete xhrOptions.headers['Content-Type']; // let browser set multipart boundary

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.baseUrl + url, true);
            
            const headers = { ...this.defaultHeaders, ...xhrOptions.headers };
            delete headers['Content-Type'];
            for (const [k, v] of Object.entries(headers)) {
                xhr.setRequestHeader(k, v);
            }

            if (options.onUploadProgress) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded * 100) / e.total);
                        options.onUploadProgress({ loaded: e.loaded, total: e.total, percent });
                    }
                };
            }

            xhr.onload = () => {
                const res = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    ok: xhr.status >= 200 && xhr.status < 300,
                    url: xhr.responseURL,
                    headers: {}
                };
                let data = xhr.responseText;
                try { data = JSON.parse(data); } catch (e) {}
                resolve(new HttpResponse(res, data));
            };

            xhr.onerror = () => reject(new Error('Network Error during upload'));
            xhr.send(formData);
        });
    }

    async request(method, url, body, options = {}) {
        let fullUrl = this.baseUrl + url;
        let config = {
            method,
            headers: { ...this.defaultHeaders, ...(options.headers || {}) },
            timeout: options.timeout || this.defaultTimeout,
            retries: options.retries !== undefined ? options.retries : 3,
            retryDelay: options.retryDelay || 1000,
            cache: options.cache || false,
            cacheTtl: options.cacheTtl || 60000,
            staleWhileRevalidate: options.staleWhileRevalidate || false,
            ...options
        };

        if (body !== undefined && body !== null && method !== 'GET') {
            if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
                config.body = JSON.stringify(body);
            } else {
                config.body = body;
            }
        }

        // Request Interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config) || config;
        }

        // Cache check
        const cacheKey = `${method}:${fullUrl}`;
        if (method === 'GET' && config.cache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < config.cacheTtl) {
                return cached.response;
            } else if (config.staleWhileRevalidate) {
                // Return stale immediately, fetch in background
                this._fetchWithRetry(method, fullUrl, config).then(res => {
                    this.cache.set(cacheKey, { response: res, timestamp: Date.now() });
                }).catch(() => {});
                return cached.response;
            }
        }

        let response;
        try {
            response = await this._fetchWithRetry(method, fullUrl, config);
        } catch (e) {
            throw e;
        }

        // Response Interceptors
        for (const interceptor of this.responseInterceptors) {
            response = await interceptor(response) || response;
        }

        if (method === 'GET' && config.cache) {
            this.cache.set(cacheKey, { response, timestamp: Date.now() });
        }

        return response;
    }

    async _fetchWithRetry(method, url, config) {
        let attempts = 0;
        const maxRetries = config.retries;
        let delay = config.retryDelay;

        while (true) {
            try {
                if (this.mockAdapter) {
                    const mockRes = await this.mockAdapter(method, url, config);
                    return new HttpResponse(mockRes, mockRes.data);
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);

                const fetchOptions = {
                    method: config.method,
                    headers: config.headers,
                    body: config.body,
                    signal: controller.signal
                };

                const res = await fetch(url, fetchOptions);
                clearTimeout(timeoutId);

                let data;
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    data = await res.json();
                } else {
                    data = await res.text();
                }

                const response = new HttpResponse(res, data);
                if (!response.ok && attempts < maxRetries && res.status >= 500) {
                    throw new Error(`Server error ${res.status}`);
                }
                return response;
            } catch (e) {
                attempts++;
                if (attempts > maxRetries) {
                    throw e;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // exponential backoff
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSHttpClient = { HttpClient, HttpResponse };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HttpClient, HttpResponse };
}
