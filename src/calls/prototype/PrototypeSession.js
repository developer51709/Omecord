// src/calls/prototype/PrototypeSession.js

import {
    joinVoiceChannel,
    getVoiceConnection
} from "@discordjs/voice";

import { PrototypeAudioReceiver } from "./PrototypeAudioReceiver.js";
import { PrototypeAudioMixer } from "./PrototypeAudioMixer.js";
import { PrototypeAudioSender } from "./PrototypeAudioSender.js";

export class PrototypeSession {
    constructor(vcA, vcB, options = {}) {
        this.vcA = vcA;
        this.vcB = vcB;

        this.testMode = options.testMode || false;
        this.fakeConnectionFactory = options.fakeConnectionFactory || null;

        this.receiverA = null;
        this.receiverB = null;

        this.senderA = null;
        this.senderB = null;

        this.mixer = new PrototypeAudioMixer();
    }

    _connectReal() {
        const connA = joinVoiceChannel({
            channelId: this.vcA.id,
            guildId: this.vcA.guild.id,
            adapterCreator: this.vcA.guild.voiceAdapterCreator
        });

        const connB = joinVoiceChannel({
            channelId: this.vcB.id,
            guildId: this.vcB.guild.id,
            adapterCreator: this.vcB.guild.voiceAdapterCreator
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

        // Create receivers
        this.receiverA = new PrototypeAudioReceiver(connA, "A");
        this.receiverB = new PrototypeAudioReceiver(connB, "B");

        // Create senders
        this.senderA = new PrototypeAudioSender(connA);
        this.senderB = new PrototypeAudioSender(connB);

        // Mix-minus routing
        this.receiverA.onAudio((pcm) => {
            this.mixer.push("A", pcm);
            const mixed = this.mixer.mixMinus("A");
            this.senderA.send(mixed);
        });

        this.receiverB.onAudio((pcm) => {
            this.mixer.push("B", pcm);
            const mixed = this.mixer.mixMinus("B");
            this.senderB.send(mixed);
        });

        console.log(`Prototype call session started in ${this.testMode ? "TEST" : "REAL"} mode.`);
    }

    stop() {
        if (!this.testMode) {
            getVoiceConnection(this.vcA.guild.id)?.destroy();
            getVoiceConnection(this.vcB.guild.id)?.destroy();
        }

        console.log("Prototype call session stopped.");
    }
}