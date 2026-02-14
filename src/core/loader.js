import fs from "fs";
import path from "path";
import { logger } from "./logger.js";
import chalk from "chalk";

// ─────────────────────────────────────────────
// Load Events (modern Discord.js v14 format)
// ─────────────────────────────────────────────

export async function loadEvents(client) {
    const eventsPath = path.resolve("src/events");
    const files = fs.readdirSync(eventsPath);

    for (const file of files) {
        const eventModule = await import(`../events/${file}`);
        const event = eventModule.default;

        if (!event || !event.name || !event.execute) {
            logger.warn(
                chalk.yellow(`⚠️ Skipping invalid event file: ${file}`)
            );
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }

        logger.info(chalk.green(`Loaded event: ${event.name}`));
    }
}

// ─────────────────────────────────────────────
// Load Commands (Slash commands, modern format)
// ─────────────────────────────────────────────

export async function loadCommands(client) {
    const commandsPath = path.resolve("src/commands");
    const files = fs.readdirSync(commandsPath);

    for (const file of files) {
        const commandModule = await import(`../commands/${file}`);
        const command = commandModule.default;

        if (!command || !command.data || !command.execute) {
            logger.warn(
                chalk.yellow(`⚠️ Skipping invalid command file: ${file}`)
            );
            continue;
        }

        client.commands.set(command.data.name, command);

        logger.info(chalk.green(`Loaded command: ${command.data.name}`));
    }
}