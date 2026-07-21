// js/core/plugin-loader.js
/**
 * WebOS Plugin Loader & Extension API
 */
class PluginLoader {
    constructor() {
        this.plugins = new Map();
    }

    register(manifest, definition) {
        let actualManifest = manifest;
        let actualDefinition = definition;
        if (!definition && manifest && manifest.name && !manifest.id) {
            actualManifest = { id: manifest.name, ...manifest };
            actualDefinition = manifest;
        }
        if (!actualManifest || !actualManifest.id) {
            console.error('Invalid plugin manifest', manifest);
            return;
        }
        this.plugins.set(actualManifest.id, { manifest: actualManifest, definition: actualDefinition });
        if (typeof actualDefinition.init === 'function') {
            try {
                actualDefinition.init();
            } catch (e) {
                console.error(`Failed to initialize plugin [${actualManifest.id}]`, e);
            }
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('plugin-registered', actualManifest);
        }
    }

    get(id) {
        return this.plugins.get(id);
    }

    list() {
        return Array.from(this.plugins.values()).map(p => p.manifest);
    }

    initAll() {
        const results = [];
        this.plugins.forEach((plugin, id) => {
            if (typeof plugin.definition.init === 'function') {
                try {
                    const res = plugin.definition.init();
                    results.push({ id, result: res });
                } catch (e) {
                    results.push({ id, error: e });
                }
            }
        });
        return results;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSPlugins = new PluginLoader();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PluginLoader };
}
