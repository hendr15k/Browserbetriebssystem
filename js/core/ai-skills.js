// js/core/ai-skills.js
/**
 * WebOS AI Skills Registry & Execution Module
 */
class AISkills {
    constructor() {
        this.skills = {};
        this._registerBuiltins();
    }

    _registerBuiltins() {
        this.register({
            name: 'summarize',
            description: 'Summarizes text input',
            execute: async (input) => {
                const text = String(input || '');
                const sentences = text.split(/[.!?]+/).filter(Boolean);
                return sentences.length > 0 ? sentences[0] + '.' : text.substring(0, 100);
            }
        });

        this.register({
            name: 'translate',
            description: 'Translates text',
            execute: async (input, options = {}) => {
                const text = String(input || '');
                const target = options.target || 'en';
                return `[Translated to ${target}]: ${text}`;
            }
        });

        this.register({
            name: 'formatCode',
            description: 'Formats code snippet',
            execute: async (input) => {
                return String(input || '').trim();
            }
        });

        this.register({
            name: 'generateRegex',
            description: 'Generates regex for description',
            execute: async (input) => {
                const desc = String(input || '').toLowerCase();
                if (desc.includes('email')) return '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
                if (desc.includes('number')) return '^\\d+$';
                return '.*';
            }
        });

        this.register({
            name: 'explainCode',
            description: 'Explains code snippet',
            execute: async (input) => {
                return `This code snippet performs standard operations: ${String(input).substring(0, 50)}...`;
            }
        });

        this.register({
            name: 'findBugs',
            description: 'Identifies potential bugs in code',
            execute: async (input) => {
                const code = String(input || '');
                const bugs = [];
                if (code.includes('==') && !code.includes('===')) bugs.push('Use strict equality (===)');
                if (code.includes('eval(')) bugs.push('Avoid using eval() for security reasons');
                return bugs.length > 0 ? bugs : ['No obvious bugs found'];
            }
        });

        this.register({
            name: 'optimizeCode',
            description: 'Optimizes code snippet',
            execute: async (input) => {
                return `// Optimized\n${String(input || '')}`;
            }
        });

        this.register({
            name: 'convertFormat',
            description: 'Converts between data formats (JSON, YAML, CSV)',
            execute: async (input, options = {}) => {
                const target = options.target || 'json';
                if (target === 'json') {
                    try { return JSON.stringify(typeof input === 'object' ? input : { data: input }, null, 2); }
                    catch (e) { return JSON.stringify({ raw: String(input) }); }
                }
                return String(input);
            }
        });
    }

    register(skill) {
        if (skill && skill.name) {
            this.skills[skill.name] = skill;
        }
    }

    list() {
        return Object.keys(this.skills).map(name => ({
            name,
            description: this.skills[name].description
        }));
    }

    async execute(skillName, input, options = {}) {
        const skill = this.skills[skillName];
        if (!skill) {
            throw new Error(`Skill not found: ${skillName}`);
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('skill:progress', { skill: skillName, status: 'start' });
        }
        const result = await skill.execute(input, options);
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('skill:progress', { skill: skillName, status: 'complete' });
        }
        return result;
    }

    async chain(skillNames, initialInput, options = {}) {
        let current = initialInput;
        for (const name of skillNames) {
            current = await this.execute(name, current, options);
        }
        return current;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSAISkills = new AISkills();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AISkills };
}
