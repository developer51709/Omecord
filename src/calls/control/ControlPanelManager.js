// src/calls/control/ControlPanelManager.js

import { ControlPanelRenderer } from "./ControlPanelRenderer.js";
import { registerControlPanelHandlers } from "./ControlPanelHandlers.js";

export class ControlPanelManager {
    /**
     * @param {PrototypeSession|VCSession} session
     */
    constructor(session) {
        this.session = session;
        this.client = session.vcA.guild.client;

        this.channel = null;
        this.message = null;
        this.renderer = new ControlPanelRenderer(session);

        this._handlersRegistered = false;
    }

    async resolveTextChannel() {
        // Voice channel chat sidebar (for now: use vcA's guild + a configured text channel or fallback)
        const vc = this.session.vcA;
        const guild = vc.guild;

        // If you later store a mapping VC -> text channel, resolve it here.
        // For now, use the first text channel in the guild as a placeholder.
        const textChannel = guild.channels.cache.find(
            ch => ch.isTextBased && ch.viewable && ch.type !== 1
        );

        if (!textChannel) {
            throw new Error("No suitable text channel found for control panel.");
        }

        this.channel = textChannel;
        return textChannel;
    }

    async createPanel() {
        if (!this.channel) {
            await this.resolveTextChannel();
        }

        const { embed, components } = this.renderer.buildInitialPanel();

        const msg = await this.channel.send({
            embeds: [embed],
            components
        });

        this.message = msg;

        if (!this._handlersRegistered) {
            registerControlPanelHandlers(this.client);
            this._handlersRegistered = true;
        }

        this.session.controlPanelId = msg.id;
    }

    async updatePanel() {
        if (!this.message) return;

        const { embed, components } = this.renderer.buildUpdatedPanel();

        await this.message.edit({
            embeds: [embed],
            components
        });
    }

    async deletePanel() {
        if (!this.message) return;

        try {
            await this.message.delete();
        } catch {
            // message might already be gone
        }

        this.message = null;
    }
}