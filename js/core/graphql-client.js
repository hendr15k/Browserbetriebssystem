// js/core/graphql-client.js
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.map = new Map();
    }

    get(key) {
        if (!this.map.has(key)) return undefined;
        const val = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, val);
        return val;
    }

    set(key, value) {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.maxSize) {
            const firstKey = this.map.keys().next().value;
            this.map.delete(firstKey);
        }
        this.map.set(key, value);
    }

    clear() {
        this.map.clear();
    }
}

class GraphQLClient {
    constructor(options = {}) {
        this.endpoint = options.endpoint || '/graphql';
        this.headers = options.headers || { 'Content-Type': 'application/json' };
        this.cache = new LRUCache(options.maxCacheSize || 100);
        this.mockHandler = options.mockHandler || null;
        this.persistedQueries = new Map();
    }

    registerPersistedQuery(id, document) {
        this.persistedQueries.set(id, document);
    }

    async query(document, variables = {}, options = {}) {
        return this._execute('query', document, variables, options);
    }

    async mutation(document, variables = {}, options = {}) {
        return this._execute('mutation', document, variables, options);
    }

    subscribe(document, variables = {}, callback) {
        const operationId = Math.random().toString(36).substring(7);
        let timer = null;
        if (this.mockHandler) {
            timer = setTimeout(() => {
                const mockRes = this.mockHandler('subscription', document, variables);
                callback(null, mockRes);
            }, 50);
        }
        return {
            unsubscribe: () => {
                if (timer) clearTimeout(timer);
            }
        };
    }

    async _execute(type, documentOrId, variables, options) {
        let document = documentOrId;
        let extensions = undefined;

        if (this.persistedQueries.has(documentOrId)) {
            document = this.persistedQueries.get(documentOrId);
            extensions = { persistedQuery: { version: 1, sha256Hash: documentOrId } };
        }

        const cacheKey = JSON.stringify({ type, document, variables });
        if (type === 'query' && !options.skipCache && this.cache.get(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Validate variables type check (rudimentary)
        const validationError = this._validateVariables(document, variables);
        if (validationError) {
            throw { name: 'ValidationError', message: validationError };
        }

        let responseData;
        if (this.mockHandler) {
            responseData = this.mockHandler(type, document, variables);
        } else {
            try {
                const fetchOptions = {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({ query: document, variables, extensions })
                };
                const res = await fetch(this.endpoint, fetchOptions);
                if (!res.ok) {
                    throw { name: 'NetworkError', message: `HTTP error ${res.status}: ${res.statusText}`, status: res.status };
                }
                responseData = await res.json();
            } catch (e) {
                if (e.name === 'ValidationError' || e.name === 'NetworkError' || e.name === 'GraphQLError') {
                    throw e;
                }
                throw { name: 'NetworkError', message: e.message || 'Network failure', original: e };
            }
        }

        if (responseData && responseData.errors && responseData.errors.length > 0) {
            throw { name: 'GraphQLError', errors: responseData.errors, message: responseData.errors[0].message };
        }

        if (type === 'query') {
            this.cache.set(cacheKey, responseData);
        }

        return responseData;
    }

    _validateVariables(document, variables) {
        // Rudimentary parser/type checker
        if (typeof document !== 'string') return 'Document must be a string';
        if (variables && typeof variables !== 'object') return 'Variables must be an object';
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSGraphQLClient = GraphQLClient;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphQLClient, LRUCache };
}
