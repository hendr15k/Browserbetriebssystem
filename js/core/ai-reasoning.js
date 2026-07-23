// js/core/ai-reasoning.js
/**
 * WebOS AI Multi-Step Reasoning Module (Plan-Execute-Reflect Loop)
 */
class AIReasoning {
    constructor() {
        this.maxSteps = 10;
        this.tools = {};
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('vfs', {
            execute: async (action, path, content) => {
                if (typeof window !== 'undefined' && window.WebOSVFS) {
                    if (action === 'read') return window.WebOSVFS.readFile(path);
                    if (action === 'write') return window.WebOSVFS.writeFile(path, content);
                }
                return `VFS simulated ${action} on ${path}`;
            }
        });
        this.registerTool('state', {
            execute: async (key, val) => {
                if (typeof window !== 'undefined' && window.WebOSState) {
                    if (val !== undefined) window.WebOSState.set(key, val);
                    return window.WebOSState.get(key);
                }
                return val;
            }
        });
        this.registerTool('eventBus', {
            execute: async (event, data) => {
                if (typeof window !== 'undefined' && window.WebOSEventBus) {
                    window.WebOSEventBus.emit(event, data);
                    return true;
                }
                return false;
            }
        });
    }

    registerTool(name, tool) {
        this.tools[name] = tool;
    }

    plan(goal) {
        const steps = [];
        const g = (goal || '').toLowerCase();
        steps.push({ step: 1, action: 'analyze_goal', description: `Analyze goal: ${goal}` });
        if (g.includes('file') || g.includes('read') || g.includes('write')) {
            steps.push({ step: 2, action: 'vfs:read', description: 'Access Virtual File System' });
        }
        if (g.includes('state') || g.includes('store')) {
            steps.push({ step: 2, action: 'state:get', description: 'Query StateStore' });
        }
        steps.push({ step: steps.length + 1, action: 'synthesize_result', description: 'Synthesize final result' });
        return steps;
    }

    async execute(planSteps) {
        const results = [];
        const steps = Array.isArray(planSteps) ? planSteps : [];
        for (let i = 0; i < Math.min(steps.length, this.maxSteps); i++) {
            const step = steps[i];
            let res = { step: step.step, action: step.action, status: 'success', output: `Executed ${step.action}` };
            try {
                if (step.action.includes(':')) {
                    const [toolName, toolAction] = step.action.split(':');
                    if (this.tools[toolName]) {
                        res.output = await this.tools[toolName].execute(toolAction, step.path, step.content);
                    }
                }
            } catch (err) {
                res.status = 'error';
                res.output = err.message;
            }
            results.push(res);
        }
        return results;
    }

    reflect(results) {
        const failures = results.filter(r => r.status === 'error');
        return {
            success: failures.length === 0,
            totalSteps: results.length,
            failures: failures.length,
            critique: failures.length === 0 ? 'All steps executed successfully without errors.' : `${failures.length} step(s) encountered errors.`
        };
    }

    async solve(problem) {
        const thoughtChain = [];
        const planSteps = this.plan(problem);
        thoughtChain.push({ phase: 'plan', steps: planSteps });

        const executionResults = await this.execute(planSteps);
        thoughtChain.push({ phase: 'execute', results: executionResults });

        const reflection = this.reflect(executionResults);
        thoughtChain.push({ phase: 'reflect', reflection });

        return {
            problem,
            thoughtChain,
            success: reflection.success,
            visualization: JSON.stringify(thoughtChain, null, 2)
        };
    }
}

if (typeof window !== 'undefined') {
    window.WebOSAIReasoning = new AIReasoning();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIReasoning };
}
