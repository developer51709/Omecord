// src/calls/video/VideoPipeline.js

import { VideoReceiver } from "./VideoReceiver.js";
import { VideoRouter } from "./VideoRouter.js";
import { VideoSender } from "./VideoSender.js";

export class VideoPipeline {
    constructor(connA, connB) {
        this.router = new VideoRouter();

        this.receiverA = new VideoReceiver(connA, "A");
        this.receiverB = new VideoReceiver(connB, "B");

        this.senderA = new VideoSender(connA);
        this.senderB = new VideoSender(connB);

        this.receiverA.onFrame((frame) => {
            this.router.push("A", frame);
            const routed = this.router.routeTo("A");
            this.senderA.send(routed);
        });

        this.receiverB.onFrame((frame) => {
            this.router.push("B", frame);
            const routed = this.router.routeTo("B");
            this.senderB.send(routed);
        });
    }
}