// js/core/comments-engine.js
/**
 * WebOS Comments Engine — Threaded comments, reactions, mentions, Markdown, and VFS persistence.
 */
class CommentsEngine {
    constructor(vfsInstance) {
        this.vfsPath = '/home/user/comments.json';
        this.vfs = vfsInstance || (typeof window !== 'undefined' ? window.WebOSVFS : null);
        this.comments = new Map(); // commentId -> comment object
        this.targetIndex = new Map(); // targetId -> Set of commentIds (top-level)
        this.isLoaded = false;
    }

    async init() {
        if (this.isLoaded) return;
        if (!this.vfs && typeof window !== 'undefined') {
            this.vfs = window.WebOSVFS;
        }
        if (this.vfs && typeof this.vfs.readFile === 'function') {
            try {
                const raw = await this.vfs.readFile(this.vfsPath);
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        for (const c of parsed) {
                            this.comments.set(c.id, c);
                            if (!c.parentId) {
                                if (!this.targetIndex.has(c.targetId)) {
                                    this.targetIndex.set(c.targetId, new Set());
                                }
                                this.targetIndex.get(c.targetId).add(c.id);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('CommentsEngine: failed to load comments from VFS', e);
            }
        }
        this.isLoaded = true;
    }

    async _persist() {
        if (!this.vfs) return;
        try {
            const arr = Array.from(this.comments.values());
            await this.vfs.writeFile(this.vfsPath, JSON.stringify(arr, null, 2));
        } catch (e) {
            console.warn('CommentsEngine: failed to persist comments', e);
        }
    }

    _parseMarkdownAndMentions(body) {
        // Rudimentary markdown: **bold**, *italic*, `code`, and @mentions
        let html = body
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/@([a-zA-Z0-9_-]+)/g, '<span class="mention" data-user="$1">@$1</span>');
        return html;
    }

    async addComment(targetId, body, author, parentId = null) {
        await this.init();
        const id = 'comment-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const comment = {
            id,
            targetId,
            body,
            formattedBody: this._parseMarkdownAndMentions(body),
            author,
            parentId,
            createdAt: now,
            updatedAt: now,
            editHistory: [],
            reactions: {}, // emoji -> array of userIds
            replies: []
        };

        this.comments.set(id, comment);

        if (parentId) {
            const parent = this.comments.get(parentId);
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(id);
            }
        } else {
            if (!this.targetIndex.has(targetId)) {
                this.targetIndex.set(targetId, new Set());
            }
            this.targetIndex.get(targetId).add(id);
        }

        await this._persist();

        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('comment:added', comment);
        }

        return comment;
    }

    async reply(parentId, body, author) {
        const parent = this.comments.get(parentId);
        if (!parent) throw new Error('Parent comment not found');
        return this.addComment(parent.targetId, body, author, parentId);
    }

    async edit(commentId, body) {
        await this.init();
        const comment = this.comments.get(commentId);
        if (!comment) throw new Error('Comment not found');

        comment.editHistory.push({ body: comment.body, updatedAt: comment.updatedAt });
        comment.body = body;
        comment.formattedBody = this._parseMarkdownAndMentions(body);
        comment.updatedAt = new Date().toISOString();

        await this._persist();
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('comment:edited', comment);
        }
        return comment;
    }

    async delete(commentId) {
        await this.init();
        const comment = this.comments.get(commentId);
        if (!comment) return false;

        if (comment.parentId) {
            const parent = this.comments.get(comment.parentId);
            if (parent && parent.replies) {
                parent.replies = parent.replies.filter(id => id !== commentId);
            }
        } else {
            const set = this.targetIndex.get(comment.targetId);
            if (set) set.delete(commentId);
        }

        this.comments.delete(commentId);
        await this._persist();
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('comment:deleted', { commentId });
        }
        return true;
    }

    async addReaction(commentId, emoji, userId) {
        await this.init();
        const comment = this.comments.get(commentId);
        if (!comment) throw new Error('Comment not found');
        if (!comment.reactions[emoji]) {
            comment.reactions[emoji] = [];
        }
        if (!comment.reactions[emoji].includes(userId)) {
            comment.reactions[emoji].push(userId);
            await this._persist();
        }
        return comment;
    }

    async getComments(targetId) {
        await this.init();
        const set = this.targetIndex.get(targetId);
        if (!set) return [];
        const result = [];
        for (const id of set) {
            const comment = this.comments.get(id);
            if (comment) {
                result.push(this._populateThread(comment));
            }
        }
        return result;
    }

    _populateThread(comment) {
        const copy = { ...comment };
        copy.replies = (comment.replies || []).map(rid => {
            const r = this.comments.get(rid);
            return r ? this._populateThread(r) : null;
        }).filter(Boolean);
        return copy;
    }

    async getThread(commentId) {
        await this.init();
        const comment = this.comments.get(commentId);
        return comment ? this._populateThread(comment) : null;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSComments = new CommentsEngine();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommentsEngine };
}
