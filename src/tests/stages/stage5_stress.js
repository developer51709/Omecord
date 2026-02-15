export async function stage5_stress(logger, MixerClass) {
    logger.section("Stage 5 — Stress Test");

    try {
        const mixer = new MixerClass();

        for (let i = 0; i < 5000; i++) {
            mixer.push("A", Buffer.alloc(1920));
            mixer.push("B", Buffer.alloc(1920));
        }

        const out = mixer.mixMinus("A");

        logger.log(`Stress test output size: ${out.length} bytes`);

        if (out.length === 0) throw new Error("Mixer failed under stress.");

        logger.log("Stage 5 passed.");
    } catch (err) {
        logger.error("Stage 5 failed", err);
    }
}