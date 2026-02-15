// src/calls/control/ControlPanelRenderer.js

import { buildControlButtonsRow } from "./ControlPanelButtons.js";

export class ControlPanelRenderer {
    /**
     * @param {PrototypeSession|VCSession} session
     */
    constructor(session) {
        this.session = session;
    }

    baseEmbed() {
        const mode = this.session.mode || "bridge";
        const videoStatus = this.session.enableVideo ? "Automatic (on when available)" : "Disabled";
        const status = this.session.paused ? "Paused" : "Active";

        return {
            title: "🔗 Omecord Call Session",
            description: "Omegle-style server connection is active.",
            color: 0x5865f2,
            fields: [
                {
                    name: "Mode",
                    value: mode,
                    inline: true
                },
                {
                    name: "Video",
                    value: videoStatus,
                    inline: true
                },
                {
                    name: "Status",
                    value: status,
                    inline: true
                },
                {
                    name: "Servers",
                    value: `${this.session.vcA.guild.name} ↔ ${this.session.vcB.guild.name}`,
                    inline: false
                }
            ],
            footer: {
                text: `Session ID: ${this.session.sessionId || "N/A"}`
            },
            timestamp: new Date().toISOString()
        };
    }

    buildInitialPanel() {
        const embed = this.baseEmbed();
        const components = [buildControlButtonsRow(this.session)];

        return { embed, components };
    }

    buildUpdatedPanel() {
        const embed = this.baseEmbed();
        const components = [buildControlButtonsRow(this.session)];

        return { embed, components };
    }
}