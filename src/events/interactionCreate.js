import { Events } from "discord.js";
import { logger } from "../core/logger.js";
import chalk from "chalk";

export default {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(
                chalk.yellow(`⚠️ Unknown command: ${interaction.commandName}`)
            );
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            logger.error(
                chalk.red(`❌ Error executing command: ${interaction.commandName}`)
            );
            console.error(err);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "An error occurred while executing this command.",
                    ephemeral: true
                });
            }
        }
    }
};