export async function stage2_mixer(logger, MixerClass) {
    logger.section("Stage 2 — Mixer Test");

    try {
        const mixer = new MixerClass();

        mixer.push("A", Buffer.from([1, 1, 1]));
        mixer.push("B", Buffer.from([2, 2, 2]));

        const outA = mixer.mixMinus("A");
        const outB = mixer.mixMinus("B");

        if (outA[0] !== 2) throw new Error("Mix-minus failed for A");
        if (outB[0] !== 1) throw new Error("Mix-minus failed for B");

        logger.log("Mixer mix-minus logic is correct.");
        logger.log("Stage 2 passed.");
    } catch (err) {
        logger.error("Stage 2 failed", err);
    }
}