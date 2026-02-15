// src/calls/video/VideoReceiver.js

export class VideoReceiver {
    constructor(connection, label) {
        this.connection = connection;
        this.label = label;
        this.callbacks = [];

        // Placeholder: Discord video API not yet exposed
        // We simulate video frames in test mode
        if (connection.fakeVideo) {
            connection.fakeVideo.onFrame((frame) => {
                this.callbacks.forEach(cb => cb(frame));
            });
        }
    }

    onFrame(cb) {
        this.callbacks.push(cb);
    }
}