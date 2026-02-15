// src/calls/prototype/PrototypeSession.js

import {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource
} from "@discordjs/voice";

import { Readable } from "stream";

import { PrototypeAudioReceiver } from "./PrototypeAudioReceiver.js";
import { PrototypeAudioMixer } from "./PrototypeAudioMixer.js";
import { PrototypeAudioSender } from "./PrototypeAudioSender.js";

import { VideoPipeline } from "../video/VideoPipeline.js";
import { ControlPanelManager } from "../control/ControlPanelManager.js";
import { logger } from "../../core/logger.js";

export class PrototypeSession {
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

    /**
     * Waits for the next voiceStateUpdate event for the bot in a guild.
     */
    _waitForVoiceState(guild) {
        return new Promise(resolve => {
            const client = guild.client;

            const handler = (oldState, newState) => {
                if (newState.id === guild.members.me.id) {
                    client.off("voiceStateUpdate", handler);
                    resolve(newState);
                }
            };

            client.on("voiceStateUpdate", handler);

            // Safety timeout
            setTimeout(() => {
                client.off("voiceStateUpdate", handler);
                resolve(guild.members.me.voice);
            }, 2000);
        });
    }

    /**
     * Ensures the bot is not self-muted after joining.
     */
    async _enforceUnmute(conn, guild, label) {
        logger.debug(`[${this.sessionId}][${label}] Waiting for initial voice state update in guild ${guild.id}`);

        let state = await this._waitForVoiceState(guild);

        logger.debug(
            `[${this.sessionId}][${label}] Initial voice state: ` +
            `selfMute=${state.selfMute}, selfDeaf=${state.selfDeaf}`
        );

        if (state.selfMute) {
            logger.warn(`[${this.sessionId}][${label}] Bot is self-muted in guild ${guild.id}. Attempting unmute.`);
            try {
                conn.setSelfMute(false);
            } catch (err) {
                logger.error(`[${this.sessionId}][${label}] Failed to unmute bot: ${err}`);
            }
        }

        logger.debug(`[${this.sessionId}][${label}] Waiting for second voice state update in guild ${guild.id}`);

        let state2 = await this._waitForVoiceState(guild);

        logger.debug(
            `[${this.sessionId}][${label}] Second voice state: ` +
            `selfMute=${state2.selfMute}, selfDeaf=${state2.selfDeaf}`
        );

        if (state2.selfMute) {
            logger.warn(`[${this.sessionId}][${label}] Bot STILL self-muted in guild ${guild.id}. Forcing unmute again.`);
            try {
                conn.setSelfMute(false);
            } catch {}
        }

        logger.debug(
            `[${this.sessionId}][${label}] Final mute state: ${guild.members.me.voice.selfMute}`
        );
    }

    /**
     * Creates and attaches a silent audio player so Discord treats the bot as active.
     * Uses a Readable stream to avoid "chunk must be string or Buffer" errors.
     */
    _attachSilentPlayer(conn, label) {
        logger.debug(`[${this.sessionId}][${label}] Attaching silent audio player`);

        const silentPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        // 20ms silence frame (Opus)
        const SILENCE = Buffer.from([0xF8, 0xFF, 0xFE]);

        // Safe Readable stream wrapper
        const silenceStream = new Readable({
            read() {
                this.push(SILENCE);
                this.push(null);
            }
        });

        const silentResource = createAudioResource(silenceStream);

        silentPlayer.play(silentResource);

        silentPlayer.on("error", err => {
            logger.error(
                `[${this.sessionId}][${label}] Silent player error:\n` +
                `${err?.stack || err}`
            );
        });

        try {
            conn.subscribe(silentPlayer);
            logger.debug(`[${this.sessionId}][${label}] Silent player subscribed`);
        } catch (err) {
            logger.error(
                `[${this.sessionId}][${label}] Failed to subscribe silent player:\n` +
                `${err?.stack || err}`
            );
        }
    }

    _connectReal() {
        logger.debug(`Connecting to voice channels for session ${this.sessionId}`);

        const connA = joinVoiceChannel({
            channelId: this.vcA.id,
            guildId: this.vcA.guild.id,
            adapterCreator: this.vcA.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
            group: this.sessionId
        });

        const connB = joinVoiceChannel({
            channelId: this.vcB.id,
            guildId: this.vcB.guild.id,
            adapterCreator: this.vcB.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
            group: this.sessionId
        });

        // Attach silent players
        this._attachSilentPlayer(connA, "A");
        this._attachSilentPlayer(connB, "B");

        // Run unmute enforcement asynchronously
        this._enforceUnmute(connA, this.vcA.guild, "A");
        this._enforceUnmute(connB, this.vcB.guild, "B");

        return { connA, connB };
    }

    _connectFake() {
        if (!this.fakeConnectionFactory) {
            throw new Error("Test mode enabled but no fakeConnectionFactory provided.");
        }

        logger.ptsession("Using fake voice connections (test mode)");
        return this.fakeConnectionFactory();
    }

    async start() {
        logger.ptsession(`Starting session ${this.sessionId}`);

        const { connA, connB } = this.testMode
            ? this._connectFake()
            : this._connectReal();

        this.connA = connA;
        this.connB = connB;

        logger.debug(`[${this.sessionId}] Initializing audio pipeline`);

        this.receiverA = new PrototypeAudioReceiver(connA, "A");
        this.receiverB = new PrototypeAudioReceiver(connB, "B");

        this.senderA = new PrototypeAudioSender(connA);
        this.senderB = new PrototypeAudioSender(connB);

        this._wireAudioPipelines();

        if (this.enableVideo) {
            logger.debug(`[${this.sessionId}] Starting video pipeline`);
            try {
                this._startVideoPipeline();
            } catch (err) {
                logger.error(
                    `[${this.sessionId}] Video pipeline crashed:\n` +
                    `${err?.stack || err}`
                );
            }
        }

        // CONTROL PANEL
        try {
            await this.controlPanelManager.createPanel();
        } catch (err) {
            logger.error(
                `[${this.sessionId}] Control panel failed to create:\n` +
                `${err?.stack || err}`
            );
        }

        logger.ptsession(
            `Session ${this.sessionId} started ` +
            `(${this.vcA.guild.id} ↔ ${this.vcB.guild.id}) ` +
            `(mode: ${this.mode}, video: ${this.enableVideo ? "on" : "off"}, testMode: ${this.testMode})`
        );
    }

    _wireAudioPipelines() {
        logger.debug(`[${this.sessionId}] Wiring audio pipelines`);

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
        try {
            logger.debug(`[${this.sessionId}] Initializing video pipeline`);
            this.videoPipeline = new VideoPipeline(this.connA, this.connB);
            logger.debug(`[${this.sessionId}] Video pipeline started successfully`);
        } catch (err) {
            logger.error(
                `[${this.sessionId}] Video pipeline failed to start:\n` +
                `${err?.stack || err}`
            );
        }
    }

    pausePipelines() {
        this.paused = true;
        logger.ptsession(`Session ${this.sessionId} paused`);
    }

    resumePipelines() {
        this.paused = false;
        logger.ptsession(`Session ${this.sessionId} resumed`);
    }

    stop() {
        logger.ptsession(`Stopping session ${this.sessionId}`);

        this.controlPanelManager.deletePanel();

        if (!this.testMode) {
            try {
                getVoiceConnection(this.vcA.guild.id)?.destroy();
            } catch {}
            try {
                getVoiceConnection(this.vcB.guild.id)?.destroy();
            } catch {}
        }

        logger.ptsession(`Session ${this.sessionId} stopped`);
    }
}