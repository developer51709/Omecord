// src/calls/matchmaking/CallMatchmaker.js

import { queueManager } from "./QueueManager.js";
import { mediaOrchestrator } from "../orchestrator/MediaOrchestrator.js";

export class CallMatchmaker {
    constructor() {
        this.running = false;
    }

    start() {
        if (this.running) return;
        this.running = true;

        setInterval(() => this.tick(), 2000); // run every 2 seconds
    }

    tick() {
        const entries = queueManager.oldest();

        if (entries.length < 2) return;

        // Try to find a match
        for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
                const A = entries[i];
                const B = entries[j];

                if (this.isMatch(A, B)) {
                    this.createSession(A, B);
                    return;
                }
            }
        }
    }

    isMatch(A, B) {
        // Basic bridge mode matching
        if (A.mode === "bridge" && B.mode === "bridge") {
            return true;
        }

        // Support mode
        if (A.mode === "support" && B.mode === "support") {
            return A.metadata?.isStaff !== B.metadata?.isStaff;
        }

        return false;
    }

    async createSession(A, B) {
        try {
            const vcA = await this.resolveVC(A);
            const vcB = await this.resolveVC(B);

            await mediaOrchestrator.startSession(vcA, vcB, {
                mode: A.mode,
                enableVideo: true
            });

            queueManager.remove(A.guildId);
            queueManager.remove(B.guildId);

            console.log(`[Matchmaker] Matched ${A.guildId} ↔ ${B.guildId}`);
        } catch (err) {
            console.error("[Matchmaker] Failed to create session:", err);
        }
    }

    async resolveVC(entry) {
        const guild = await global.client.guilds.fetch(entry.guildId);
        return guild.channels.cache.get(entry.channelId);
    }
}

export const callMatchmaker = new CallMatchmaker();