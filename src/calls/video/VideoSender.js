// src/calls/video/VideoSender.js

export class VideoSender {
    constructor(connection) {
        this.connection = connection;

        // Fake video output stream for testing
        this.output = [];
    }

    send(frames) {
        if (!frames || frames.length === 0) return;
        this.output.push(...frames);
    }
}