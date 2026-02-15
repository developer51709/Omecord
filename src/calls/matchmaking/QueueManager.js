// src/calls/matchmaking/QueueManager.js

export class QueueManager {
    constructor() {
        this.queue = new Map(); // Map<guildId, QueueEntry>
    }

    add(entry) {
        this.queue.set(entry.guildId, entry);
    }

    remove(guildId) {
        this.queue.delete(guildId);
    }

    get(guildId) {
        return this.queue.get(guildId);
    }

    has(guildId) {
        return this.queue.has(guildId);
    }

    list() {
        return Array.from(this.queue.values());
    }

    oldest() {
        return this.list().sort((a, b) => a.timestamp - b.timestamp);
    }
}

export const queueManager = new QueueManager();