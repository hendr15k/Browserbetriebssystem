// js/core/csp.js
/**
 * WebOS CSP Helper — Content Security Policy generator, nonce/hash generator and violation parser.
 */
class CSPManager {
    constructor() {
        this.violationListeners = [];
    }

    buildPolicy(directives, reportOnly = false) {
        const parts = [];
        for (const [key, val] of Object.entries(directives)) {
            if (Array.isArray(val)) {
                parts.push(`${key} ${val.join(' ')}`);
            } else if (val === true) {
                parts.push(key);
            } else if (typeof val === 'string' && val.length > 0) {
                parts.push(`${key} ${val}`);
            }
        }
        const policyString = parts.join('; ');
        return {
            headerName: reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
            policy: policyString
        };
    }

    generateNonce() {
        const array = new Uint8Array(16);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        let binary = '';
        for (let i = 0; i < array.byteLength; i++) {
            binary += String.fromCharCode(array[i]);
        }
        return btoa(binary);
    }

    async generateHash(content, algorithm = 'sha256') {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        let hashBuffer;
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const alg = algorithm.toUpperCase().replace('-', '');
                hashBuffer = await crypto.subtle.digest(alg, data);
            } catch (e) {
                hashBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
            }
        } else {
            hashBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
        }
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode.apply(null, hashArray));
        return `${algorithm}-${base64}`;
    }

    parseViolationReport(reportJson) {
        try {
            const report = typeof reportJson === 'string' ? JSON.parse(reportJson) : reportJson;
            const violation = report['csp-report'] || report;
            const violationData = {
                documentUri: violation['document-uri'] || violation['documentURL'],
                violatedDirective: violation['violated-directive'] || violation['effectiveDirective'],
                blockedUri: violation['blocked-uri'] || violation['blockedURL'],
                originalPolicy: violation['original-policy'] || violation['originalPolicy'],
                sourceFile: violation['source-file'] || violation['sourceFile'],
                lineNumber: violation['line-number'] || violation['lineNumber']
            };
            this._notifyViolation(violationData);
            return violationData;
        } catch (e) {
            console.error('CSPManager: failed to parse violation report', e);
            return null;
        }
    }

    onViolation(callback) {
        this.violationListeners.push(callback);
        return () => {
            this.violationListeners = this.violationListeners.filter(cb => cb !== callback);
        };
    }

    _notifyViolation(data) {
        for (const cb of this.violationListeners) {
            try {
                cb(data);
            } catch (e) {
                console.error('Error in CSP violation listener:', e);
            }
        }
    }

    getPresetPolicy(presetName, nonce = '') {
        const nonceVal = nonce ? `'nonce-${nonce}'` : '';
        const presets = {
            strict: {
                'default-src': ["'self'"],
                'script-src': ["'self'", nonceVal, "'strict-dynamic'"].filter(Boolean),
                'style-src': ["'self'", nonceVal].filter(Boolean),
                'img-src': ["'self'", 'data:', 'blob:'],
                'connect-src': ["'self'"],
                'font-src': ["'self'"],
                'object-src': ["'none'"],
                'base-uri': ["'self'"],
                'form-action': ["'self'"],
                'frame-ancestors': ["'none'"],
                'upgrade-insecure-requests': true
            },
            moderate: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", 'data:', 'https:'],
                'connect-src': ["'self'", 'https:'],
                'object-src': ["'none'"]
            },
            permissive: {
                'default-src': ["*"],
                'script-src': ["*"],
                'style-src': ["*"],
                'img-src': ["*"],
                'connect-src': ["*"]
            }
        };
        return presets[presetName] || presets.moderate;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSCSP = { CSPManager, instance: new CSPManager() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CSPManager };
}
