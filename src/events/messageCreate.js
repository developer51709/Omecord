import { Events } from "discord.js";
import { logger } from "../core/logger.js";
import chalk from "chalk";
import { config } from "../config/config.js";

export default {
    name: Events.MessageCreate,
    async execute(client, message) {
        // Ignore bots
        if (message.author.bot) return;

        const prefix = config.prefix || "!";

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) {
            logger.warn(chalk.yellow(`⚠️ Unknown prefix command: ${commandName}`));
            return;
        }

        if (!command.executePrefix) {
            logger.warn(chalk.yellow(`⚠️ Command ${commandName} has no executePrefix handler`));
            return;
        }

        try {
            await command.executePrefix(message, args);
        } catch (err) {
            logger.error(chalk.red(`❌ Error executing prefix command: ${commandName}`));
            console.error(err);

            await message.reply("An error occurred while executing that command.");
        }
    }
};