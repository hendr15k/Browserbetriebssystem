// js/core/workspace-manager.js
/**
 * WebOS Workspace Manager — Multi-workspace management, roles, permissions, and VFS persistence.
 */
class WorkspaceManager {
    constructor(vfsInstance) {
        this.vfsPath = '/home/user/workspaces.json';
        this.vfs = vfsInstance || (typeof window !== 'undefined' ? window.WebOSVFS : null);
        this.workspaces = new Map(); // workspaceId -> workspace object
        this.activeWorkspaceId = null;
        this.isLoaded = false;
    }

    async init() {
        if (this.isLoaded) return;
        this.isLoaded = true;
        if (!this.vfs && typeof window !== 'undefined') {
            this.vfs = window.WebOSVFS;
        }
        if (this.vfs) {
            try {
                const raw = await this.vfs.readFile(this.vfsPath);
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        for (const w of parsed) {
                            this.workspaces.set(w.id, w);
                        }
                    }
                }
            } catch (e) {
                console.warn('WorkspaceManager: failed to load workspaces from VFS', e);
            }
        }

        // Create default workspace if none exist
        if (this.workspaces.size === 0) {
            await this.createWorkspace('Default Workspace', { theme: 'default', language: 'en', defaultPermissions: 'editor' }, 'system');
        }

        if (!this.activeWorkspaceId && this.workspaces.size > 0) {
            this.activeWorkspaceId = Array.from(this.workspaces.keys())[0];
        }
    }

    async _persist() {
        if (!this.vfs) return;
        try {
            const arr = Array.from(this.workspaces.values());
            await this.vfs.writeFile(this.vfsPath, JSON.stringify(arr, null, 2));
        } catch (e) {
            console.warn('WorkspaceManager: failed to persist workspaces', e);
        }
    }

    async createWorkspace(name, config = {}, ownerId = 'user') {
        await this.init();
        const id = 'ws-' + Math.random().toString(36).substring(2, 9);
        const workspace = {
            id,
            name,
            config: {
                theme: config.theme || 'default',
                language: config.language || 'en',
                defaultPermissions: config.defaultPermissions || 'viewer',
                ...config
            },
            members: {
                [ownerId]: 'owner'
            },
            createdAt: new Date().toISOString()
        };

        this.workspaces.set(id, workspace);
        if (!this.activeWorkspaceId) {
            this.activeWorkspaceId = id;
        }

        await this._persist();

        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('workspace:created', workspace);
        }

        return workspace;
    }

    async switch(workspaceId) {
        await this.init();
        if (!this.workspaces.has(workspaceId)) {
            throw new Error(`Workspace not found: ${workspaceId}`);
        }
        const previousId = this.activeWorkspaceId;
        this.activeWorkspaceId = workspaceId;
        const workspace = this.workspaces.get(workspaceId);

        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('workspace:switched', { workspaceId, workspace, previousId });
        }

        return workspace;
    }

    async deleteWorkspace(workspaceId) {
        await this.init();
        if (this.workspaces.size <= 1) {
            throw new Error('Cannot delete the last remaining workspace');
        }
        const ws = this.workspaces.get(workspaceId);
        if (!ws) return false;

        this.workspaces.delete(workspaceId);
        if (this.activeWorkspaceId === workspaceId) {
            this.activeWorkspaceId = Array.from(this.workspaces.keys())[0];
        }

        await this._persist();

        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('workspace:deleted', { workspaceId });
        }

        return true;
    }

    async listWorkspaces() {
        await this.init();
        return Array.from(this.workspaces.values());
    }

    async addMember(workspaceId, userId, role = 'viewer') {
        await this.init();
        const ws = this.workspaces.get(workspaceId);
        if (!ws) throw new Error('Workspace not found');
        ws.members[userId] = role;
        await this._persist();
        return ws;
    }

    async getMembers(workspaceId) {
        await this.init();
        const ws = this.workspaces.get(workspaceId);
        if (!ws) throw new Error('Workspace not found');
        return { ...ws.members };
    }

    hasPermission(workspaceId, userId, requiredRole = 'viewer') {
        const ws = this.workspaces.get(workspaceId);
        if (!ws) return false;
        const role = ws.members[userId] || ws.config.defaultPermissions || 'viewer';
        const hierarchy = { viewer: 1, editor: 2, admin: 3, owner: 4 };
        const userLevel = hierarchy[role] || 0;
        const requiredLevel = hierarchy[requiredRole] || 1;
        return userLevel >= requiredLevel;
    }

    getActiveWorkspace() {
        return this.workspaces.get(this.activeWorkspaceId) || null;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSWorkspaces = new WorkspaceManager();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkspaceManager };
}
