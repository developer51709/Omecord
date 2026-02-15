// src/tests/stages/stage4_pipeline.js

import { PassThrough } from "stream";

export async function stage4_pipeline(logger, SessionClass) {
    logger.section("Stage 4 — Full Pipeline Test");

    try {
        const vcA = { id: "A", guild: { id: "guildA" } };
        const vcB = { id: "B", guild: { id: "guildB" } };

        // Fake voice connection generator
        function fakeConnectionFactory() {
            const make = () => ({
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
                        setInterval(() => {
                            stream.write(Buffer.alloc(1920)); // fake PCM
                        }, 20);
                        return stream;
                    }
                },
                subscribe() {}
            });

            return {
                connA: make(),
                connB: make()
            };
        }

        const session = new SessionClass(vcA, vcB, {
            testMode: true,
            fakeConnectionFactory
        });

        await session.start();

        logger.log("Pipeline started successfully in test mode.");

        await new Promise(res => setTimeout(res, 500));

        logger.log("Stage 4 passed.");
    } catch (err) {
        logger.error("Stage 4 failed", err);
    }
}