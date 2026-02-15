// src/calls/control/utils/ControlSessionState.js

export class ControlSessionState {
    constructor() {
        this.paused = false;
        this.lastSkipAt = 0;
        this.skipCooldownMs = 5000;
    }

    canSkip() {
        const now = Date.now();
        return now - this.lastSkipAt >= this.skipCooldownMs;
    }

    markSkip() {
        this.lastSkipAt = Date.now();
    }
}