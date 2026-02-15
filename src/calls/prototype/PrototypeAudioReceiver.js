// src/calls/prototype/PrototypeAudioReceiver.js

import { EndBehaviorType } from "@discordjs/voice";

export class PrototypeAudioReceiver {
    constructor(connection, label) {
        this.connection = connection;
        this.label = label;
        this.callbacks = [];

        // When a user starts speaking, subscribe to their PCM stream
        connection.receiver.speaking.on("start", (userId) => {
            const stream = connection.receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 100
                }
            });

            // Emit raw PCM chunks to all listeners
            stream.on("data", (chunk) => {
                for (const cb of this.callbacks) {
                    cb(chunk);
                }
            });
        });
    }

    /**
     * Register a callback to receive PCM audio chunks.
     * @param {Function} cb - Function that receives raw PCM Buffer
     */
    onAudio(cb) {
        this.callbacks.push(cb);
    }
}