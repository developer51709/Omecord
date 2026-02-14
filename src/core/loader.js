import fs from "fs";
import path from "path";
import chalk from "chalk";
import { logger } from "./logger.js";

// ─────────────────────────────────────────────
// Load Events (Discord.js v14 format)
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
// Load Commands (Slash + Prefix Support)
// ─────────────────────────────────────────────

export async function loadCommands(client) {
    const commandsPath = path.resolve("src/commands");
    const files = fs.readdirSync(commandsPath);

    for (const file of files) {
        const commandModule = await import(`../commands/${file}`);
        const command = commandModule.default;

        if (!command) {
            logger.warn(
                chalk.yellow(`⚠️ Skipping empty command file: ${file}`)
            );
            continue;
        }

        const hasSlash = command.data && command.execute;
        const hasPrefix = command.prefix && command.executePrefix;

        // Reject files that have neither slash nor prefix handlers
        if (!hasSlash && !hasPrefix) {
            logger.warn(
                chalk.yellow(
                    `⚠️ Skipping invalid command file (no valid handlers): ${file}`
                )
            );
            continue;
        }

        // Register slash command
        if (hasSlash) {
            client.commands.set(command.data.name, command);
            logger.info(chalk.green(`Loaded slash command: ${command.data.name}`));
        }

        // Register prefix command
        if (hasPrefix) {
            client.commands.set(command.prefix.toLowerCase(), command);
            logger.info(chalk.green(`Loaded prefix command: ${command.prefix}`));
        }
    }
}