// src/calls/control/HelpMenu/HelpInteractionHandler.js

import { HELP_SELECT_ID, HELP_CLOSE_ID } from "./HelpMenuBuilder.js";
import { HelpTopics } from "./HelpTopics.js";

const registered = new Set();

export function registerHelpMenuHandlers(client) {
    if (registered.has(client)) return;
    registered.add(client);

    client.on("interactionCreate", async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === HELP_SELECT_ID) {
            const key = interaction.values[0];
            const topic = HelpTopics[key];

            if (!topic) {
                return interaction.reply({
                    content: "Unknown help topic.",
                    ephemeral: true
                });
            }

            const embed = {
                title: `❓ ${topic.label}`,
                description: topic.content,
                color: 0x57f287
            };

            await interaction.update({
                embeds: [embed],
                components: interaction.message.components
            });
        }

        if (interaction.isButton() && interaction.customId === HELP_CLOSE_ID) {
            await interaction.message.delete().catch(() => {});
        }
    });
}