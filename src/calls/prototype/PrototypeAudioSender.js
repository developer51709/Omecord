// src/calls/prototype/PrototypeAudioSender.js

import {
    createAudioPlayer,
    createAudioResource
} from "@discordjs/voice";

import { PassThrough } from "stream";

/**
 * PrototypeAudioSender
 *
 * Sends raw PCM audio back into a Discord voice channel.
 * This is a minimal implementation intended only for the prototype.
 *
 * In the full system, this will be replaced with:
 * - Opus encoding
 * - Jitter buffering
 * - Backpressure-aware streaming
 * - Per-VC bitrate control
 * - Silence padding
 */
export class PrototypeAudioSender {
    constructor(connection) {
        this.connection = connection;

        // Create a Discord audio player
        this.player = createAudioPlayer();
        connection.subscribe(this.player);

        // PassThrough stream acts as a writable PCM pipe
        this.stream = new PassThrough();

        // Create an audio resource from the stream
        this.resource = createAudioResource(this.stream, {
            inputType: "raw" // raw PCM
        });

        // Start playback
        this.player.play(this.resource);
    }

    /**
     * Send PCM audio to the voice channel.
     * @param {Buffer} pcm
     */
    send(pcm) {
        if (!pcm || pcm.length === 0) return;

        // Write PCM data into the PassThrough stream
        this.stream.write(pcm);
    }
}