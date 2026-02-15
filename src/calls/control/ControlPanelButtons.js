// src/calls/control/ControlPanelButtons.js

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export const CONTROL_IDS = {
    SKIP: "omecord_skip",
    PAUSE: "omecord_pause",
    REPORT: "omecord_report",
    END: "omecord_end",
    HELP: "omecord_help"
};

export function buildControlButtonsRow(session) {
    const paused = !!session.paused;

    const skipButton = new ButtonBuilder()
        .setCustomId(CONTROL_IDS.SKIP)
        .setLabel("Skip")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(paused);

    const pauseButton = new ButtonBuilder()
        .setCustomId(CONTROL_IDS.PAUSE)
        .setLabel(paused ? "Resume" : "Pause")
        .setStyle(ButtonStyle.Secondary);

    const reportButton = new ButtonBuilder()
        .setCustomId(CONTROL_IDS.REPORT)
        .setLabel("Report")
        .setStyle(ButtonStyle.Danger);

    const endButton = new ButtonBuilder()
        .setCustomId(CONTROL_IDS.END)
        .setLabel("End Session")
        .setStyle(ButtonStyle.Danger);

    const helpButton = new ButtonBuilder()
        .setCustomId(CONTROL_IDS.HELP)
        .setLabel("Help")
        .setStyle(ButtonStyle.Success);

    return new ActionRowBuilder().addComponents(
        skipButton,
        pauseButton,
        reportButton,
        endButton,
        helpButton
    );
}