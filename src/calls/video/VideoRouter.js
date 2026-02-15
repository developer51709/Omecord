// src/calls/video/VideoRouter.js

export class VideoRouter {
    constructor() {
        this.buffers = {
            A: [],
            B: []
        };
    }

    push(source, frame) {
        this.buffers[source].push(frame);
    }

    routeTo(target) {
        const other = target === "A" ? "B" : "A";
        const frames = this.buffers[other].splice(0);
        return frames;
    }
}