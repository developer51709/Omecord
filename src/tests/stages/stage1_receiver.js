import { PassThrough } from "stream";

export async function stage1_receiver(logger, ReceiverClass) {
    logger.section("Stage 1 — Receiver Test");

    try {
        let received = 0;

        // Fake connection
        const fakeConn = {
            receiver: {
                speaking: {
                    on(event, cb) {
                        if (event === "start") {
                            setTimeout(() => cb("fakeUser"), 50);
                        }
                    }
                },
                subscribe() {
                    const stream = new PassThrough();
                    setTimeout(() => {
                        stream.write(Buffer.alloc(1920));
                        stream.write(Buffer.alloc(1920));
                    }, 100);
                    return stream;
                }
            }
        };

        const receiver = new ReceiverClass(fakeConn, "A");

        receiver.onAudio(() => {
            received++;
        });

        await new Promise(res => setTimeout(res, 300));

        logger.log(`Receiver captured ${received} PCM chunks.`);

        if (received === 0) throw new Error("Receiver did not capture audio.");

        logger.log("Stage 1 passed.");
    } catch (err) {
        logger.error("Stage 1 failed", err);
    }
}