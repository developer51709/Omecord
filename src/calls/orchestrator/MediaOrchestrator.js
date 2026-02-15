// src/calls/orchestrator/MediaOrchestrator.js

import { PrototypeSession } from "../prototype/PrototypeSession.js";

/**
 * MediaOrchestrator
 *
 * Central controller for all media sessions.
 * Manages lifecycle, routing modes, audio/video enable flags,
 * and session registry.
 */
export class MediaOrchestrator {
    constructor() {
        // Map<guildId, VCSession | PrototypeSession>
        this.sessions = new Map();

        // Default session class (prototype for now)
        this.SessionClass = PrototypeSession;

        // Supported modes (expandable)
        this.supportedModes = new Set([
            "bridge",     // VC ↔ VC
            "support",    // User ↔ Staff VC
            "monitor",    // Listen-only
            "custom"      // Future routing logic
        ]);
    }

    /**
     * Start a media session between two voice channels.
     *
     * @param {VoiceChannel} vcA
     * @param {VoiceChannel} vcB
     * @param {Object} options
     *   - mode: "bridge" | "support" | "monitor" | "custom"
     *   - testMode: boolean
     *   - fakeConnectionFactory: function
     *   - enableVideo: boolean
     */
    async startSession(vcA, vcB, options = {}) {
        const guildId = vcA.guild.id;

        if (this.sessions.has(guildId)) {
            throw new Error(`A session is already active in guild ${guildId}`);
        }

        const mode = options.mode || "bridge";

        if (!this.supportedModes.has(mode)) {
            throw new Error(`Unsupported session mode: ${mode}`);
        }

        console.log(`[MediaOrchestrator] Starting session in mode: ${mode}`);

        const session = new this.SessionClass(vcA, vcB, {
            mode,
            testMode: options.testMode || false,
            fakeConnectionFactory: options.fakeConnectionFactory || null,
            enableVideo: options.enableVideo || false
        });

        try {
            await session.start();
            this.sessions.set(guildId, session);

            console.log(
                `[MediaOrchestrator] Session started for guild ${guildId} ` +
                `(audio: enabled, video: ${options.enableVideo ? "enabled" : "disabled"})`
            );
        } catch (err) {
            console.error(`[MediaOrchestrator] Failed to start session:`, err);
            throw err;
        }
    }

    /**
     * Stop the active session in a guild.
     *
     * @param {string} guildId
     */
    stopSession(guildId) {
        const session = this.sessions.get(guildId);
        if (!session) {
            console.log(`[MediaOrchestrator] No active session in guild ${guildId}`);
            return false;
        }

        try {
            session.stop();
            this.sessions.delete(guildId);

            console.log(`[MediaOrchestrator] Session stopped for guild ${guildId}`);
            return true;
        } catch (err) {
            console.error(`[MediaOrchestrator] Error stopping session:`, err);
            return false;
        }
    }

    /**
     * Check if a guild has an active session.
     */
    hasSession(guildId) {
        return this.sessions.has(guildId);
    }

    /**
     * Get the active session for a guild.
     */
    getSession(guildId) {
        return this.sessions.get(guildId) || null;
    }

    /**
     * Stop all sessions (useful for shutdown).
     */
    stopAll() {
        for (const [guildId, session] of this.sessions.entries()) {
            try {
                session.stop();
            } catch (err) {
                console.error(
                    `[MediaOrchestrator] Error stopping session for guild ${guildId}`,
                    err
                );
            }
        }

        this.sessions.clear();
        console.log("[MediaOrchestrator] All sessions stopped.");
    }

    /**
     * Swap the session class (prototype → real VCSession)
     */
    useSessionClass(SessionClass) {
        this.SessionClass = SessionClass;
        console.log(`[MediaOrchestrator] Session class updated.`);
    }
}

// Export a singleton instance
export const mediaOrchestrator = new MediaOrchestrator();