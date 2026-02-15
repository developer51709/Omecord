import { PassThrough } from "stream";

export async function stage3_sender(logger, SenderClass) {
    logger.section("Stage 3 — Sender Test");

    try {
        const fakeConn = {
            subscribe() {},
        };

        const sender = new SenderClass(fakeConn);

        let written = 0;

        sender.stream.on("data", () => {
            written++;
        });

        sender.send(Buffer.alloc(1920));
        sender.send(Buffer.alloc(1920));

        await new Promise(res => setTimeout(res, 100));

        logger.log(`Sender wrote ${written} PCM chunks.`);

        if (written < 2) throw new Error("Sender did not output PCM.");

        logger.log("Stage 3 passed.");
    } catch (err) {
        logger.error("Stage 3 failed", err);
    }
}