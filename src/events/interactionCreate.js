import { logger } from "../core/logger.js";

export default async function interactionCreate(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        logger.error("Command error:", err);
        interaction.reply({ content: "Error executing command", ephemeral: true });
    }
}