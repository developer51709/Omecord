// src/tests/prototypeTest.js

import { TestLogger } from "./TestLogger.js";

import { PrototypeAudioReceiver } from "../calls/prototype/PrototypeAudioReceiver.js";
import { PrototypeAudioMixer } from "../calls/prototype/PrototypeAudioMixer.js";
import { PrototypeAudioSender } from "../calls/prototype/PrototypeAudioSender.js";
import { PrototypeSession } from "../calls/prototype/PrototypeSession.js";

import { stage1_receiver } from "./stages/stage1_receiver.js";
import { stage2_mixer } from "./stages/stage2_mixer.js";
import { stage3_sender } from "./stages/stage3_sender.js";
import { stage4_pipeline } from "./stages/stage4_pipeline.js";
import { stage5_stress } from "./stages/stage5_stress.js";

async function run() {
    const logger = new TestLogger();

    logger.section("Starting Prototype Test Suite");

    await stage1_receiver(logger, PrototypeAudioReceiver);
    await stage2_mixer(logger, PrototypeAudioMixer);
    await stage3_sender(logger, PrototypeAudioSender);
    await stage4_pipeline(logger, PrototypeSession);
    await stage5_stress(logger, PrototypeAudioMixer);

    logger.section("All tests complete.");
}

run();