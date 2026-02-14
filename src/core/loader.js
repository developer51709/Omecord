import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

export async function loadEvents(client) {
    const eventsPath = path.resolve("src/events");
    const files = fs.readdirSync(eventsPath);

    for (const file of files) {
        const event = await import(`../events/${file}`);
        const eventName = file.split(".")[0];

        client.on(eventName, event.default);
        logger.info(`Loaded event: ${eventName}`);
    }
}

export async function loadCommands(client) {
    const commandsPath = path.resolve("src/commands");
    const files = fs.readdirSync(commandsPath);

    for (const file of files) {
        const command = await import(`../commands/${file}`);
        const cmd = command.default;

        client.commands.set(cmd.data.name, cmd);
        logger.info(`Loaded command: ${cmd.data.name}`);
    }
}