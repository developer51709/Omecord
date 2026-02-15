// src/calls/prototype/PrototypeSession.js

import {
    joinVoiceChannel,
    getVoiceConnection
} from "@discordjs/voice";

import { PrototypeAudioReceiver } from "./PrototypeAudioReceiver.js";
import { PrototypeAudioMixer } from "./PrototypeAudioMixer.js";
import { PrototypeAudioSender } from "./PrototypeAudioSender.js";

import { VideoPipeline } from "../video/VideoPipeline.js"; // stub/prototype
import { ControlPanelManager } from "../control/ControlPanelManager.js";
import { logger } from "../../core/logger.js"

export class PrototypeSession {
    /**
     * @param {VoiceChannel} vcA
     * @param {VoiceChannel} vcB
     * @param {Object} options
     *   - mode: "bridge" | "support" | "monitor" | "custom"
     *   - testMode: boolean
     *   - fakeConnectionFactory: function
     *   - enableVideo: boolean
     */
    constructor(vcA, vcB, options = {}) {
        this.vcA = vcA;
        this.vcB = vcB;

        this.mode = options.mode || "bridge";
        this.testMode = options.testMode || false;
        this.fakeConnectionFactory = options.fakeConnectionFactory || null;
        this.enableVideo = options.enableVideo || false;

        this.connA = null;
        this.connB = null;

        this.receiverA = null;
        this.receiverB = null;

        this.senderA = null;
        this.senderB = null;

        this.mixer = new PrototypeAudioMixer();

        this.videoPipeline = null;

        this.paused = false;

        this.sessionId = `${vcA.guild.id}-${vcB.guild.id}-${Date.now()}`;

        this.controlPanelManager = new ControlPanelManager(this);
    }

    _connectReal() {
        const connA = joinVoiceChannel({
            channelId: this.vcA.id,
            guildId: this.vcA.guild.id,
            adapterCreator: this.vcA.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        const connB = joinVoiceChannel({
            channelId: this.vcB.id,
            guildId: this.vcB.guild.id,
            adapterCreator: this.vcB.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        return { connA, connB };
    }

    _connectFake() {
        if (!this.fakeConnectionFactory) {
            throw new Error("Test mode enabled but no fakeConnectionFactory provided.");
        }

        return this.fakeConnectionFactory();
    }

    async start() {
        const { connA, connB } = this.testMode
            ? this._connectFake()
            : this._connectReal();

        this.connA = connA;
        this.connB = connB;

        // AUDIO PIPELINE

        this.receiverA = new PrototypeAudioReceiver(connA, "A");
        this.receiverB = new PrototypeAudioReceiver(connB, "B");

        this.senderA = new PrototypeAudioSender(connA);
        this.senderB = new PrototypeAudioSender(connB);

        this._wireAudioPipelines();

        // VIDEO PIPELINE (auto, no toggle)
        if (this.enableVideo) {
            this._startVideoPipeline();
        }

        // CONTROL PANEL
        await this.controlPanelManager.createPanel();

        logger.ptsession(
            `Started session ${this.sessionId} ` +
            `(${this.vcA.guild.id} ↔ ${this.vcB.guild.id}) ` +
            `(mode: ${this.mode}, video: ${this.enableVideo ? "on" : "off"}, testMode: ${this.testMode})`
        );
    }

    _wireAudioPipelines() {
        this.receiverA.onAudio((pcm) => {
            if (this.paused) return;

            this.mixer.push("A", pcm);
            const mixed = this.mixer.mixMinus("A");
            if (mixed) this.senderB.send(mixed);
        });

        this.receiverB.onAudio((pcm) => {
            if (this.paused) return;

            this.mixer.push("B", pcm);
            const mixed = this.mixer.mixMinus("B");
            if (mixed) this.senderA.send(mixed);
        });
    }

    _startVideoPipeline() {
        // Prototype: assumes connA/connB may expose fakeVideo for tests
        this.videoPipeline = new VideoPipeline(this.connA, this.connB);
    }

    pausePipelines() {
        this.paused = true;
        // If you later add explicit pause logic to sender/receiver/mixer, call it here.
    }

    resumePipelines() {
        this.paused = false;
        // If you later add explicit resume logic, call it here.
    }

    stop() {
        // CONTROL PANEL CLEANUP
        this.controlPanelManager.deletePanel();

        // AUDIO/VIDEO CLEANUP
        if (!this.testMode) {
            try {
                getVoiceConnection(this.vcA.guild.id)?.destroy();
            } catch {}
            try {
                getVoiceConnection(this.vcB.guild.id)?.destroy();
            } catch {}
        }

        logger.ptsession(`Stopped session ${this.sessionId}`);
    }
}