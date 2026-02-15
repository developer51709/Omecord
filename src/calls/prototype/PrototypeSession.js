// src/calls/prototype/PrototypeSession.js

import {
    joinVoiceChannel,
    getVoiceConnection,
    EndBehaviorType,
    createAudioPlayer,
    createAudioResource
} from "@discordjs/voice";

import { PassThrough } from "stream";
import { PrototypeAudioReceiver } from "./PrototypeAudioReceiver.js";
import { PrototypeAudioMixer } from "./PrototypeAudioMixer.js";
import { PrototypeAudioSender } from "./PrototypeAudioSender.js";

export class PrototypeSession {
    constructor(vcA, vcB) {
        this.vcA = vcA;
        this.vcB = vcB;

        this.receiverA = null;
        this.receiverB = null;

        this.senderA = null;
        this.senderB = null;

        this.mixer = new PrototypeAudioMixer();
    }

    async start() {
        // Connect to both voice channels
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

        console.log("Prototype call session started.");
    }

    stop() {
        getVoiceConnection(this.vcA.guild.id)?.destroy();
        getVoiceConnection(this.vcB.guild.id)?.destroy();
        console.log("Prototype call session stopped.");
    }
}