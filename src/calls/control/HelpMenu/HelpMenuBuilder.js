// src/calls/control/HelpMenu/HelpMenuBuilder.js

import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { HelpTopics } from "./HelpTopics.js";

export const HELP_SELECT_ID = "omecord_help_select";
export const HELP_CLOSE_ID = "omecord_help_close";

export function buildHelpMenu(session) {
    const options = Object.entries(HelpTopics).map(([key, topic]) => ({
        label: topic.label,
        description: topic.description,
        value: key
    }));

    const select = new StringSelectMenuBuilder()
        .setCustomId(HELP_SELECT_ID)
        .setPlaceholder("Select a help topic…")
        .addOptions(options);

    const closeButton = new ButtonBuilder()
        .setCustomId(HELP_CLOSE_ID)
        .setLabel("Close")
        .setStyle(ButtonStyle.Secondary);

    const row1 = new ActionRowBuilder().addComponents(select);
    const row2 = new ActionRowBuilder().addComponents(closeButton);

    const embed = {
        title: "❓ Omecord Help",
        description: "Select a topic below for troubleshooting tips and guidance.",
        color: 0x57f287
    };

    return {
        embeds: [embed],
        components: [row1, row2]
    };
}