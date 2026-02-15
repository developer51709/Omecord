// src/calls/prototype/PrototypeAudioMixer.js

/**
 * PrototypeAudioMixer
 *
 * This is a minimal mix-minus audio mixer used only for the prototype.
 * It stores PCM chunks from each source (A and B) and returns a mix
 * that excludes the target source's own audio to prevent feedback.
 *
 * In the full system, this will be replaced with:
 * - proper mixing
 * - gain control
 * - silence detection
 * - jitter buffering
 * - multi-source support
 */
export class PrototypeAudioMixer {
    constructor() {
        this.buffers = {
            A: [],
            B: []
        };
    }

    /**
     * Push PCM audio into the mixer from a given source.
     * @param {"A"|"B"} source
     * @param {Buffer} pcm
     */
    push(source, pcm) {
        if (!this.buffers[source]) return;
        this.buffers[source].push(pcm);
    }

    /**
     * Mix-minus output:
     * Returns all audio from the *other* source,
     * ensuring the target never hears its own audio.
     *
     * @param {"A"|"B"} target
     * @returns {Buffer} mixed PCM
     */
    mixMinus(target) {
        const other = target === "A" ? "B" : "A";

        // Pull all buffered chunks from the other source
        const chunks = this.buffers[other].splice(0);

        if (chunks.length === 0) {
            return Buffer.alloc(0);
        }

        return Buffer.concat(chunks);
    }
}