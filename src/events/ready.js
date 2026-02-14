import { Events } from "discord.js";
import chalk from "chalk";
import { logger } from "../core/logger.js";

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        const shardId = client.shardId ?? "0";

        logger.success(
            chalk.green(
                `🟢 Shard ${shardId} ready — Logged in as ${client.user.tag}`
            )
        );
    }
};