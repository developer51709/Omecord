import { OmecordClient } from "./client.js";
import { loadEvents, loadCommands } from "./loader.js";
import { logger } from "./logger.js";
import { printBanner } from "./banner.js";
import { config } from "../config/config.js";
import chalk from "chalk";
import fs from "fs";
import { GatewayIntentBits } from "discord.js";

function ensureDirectories() {
    const dirs = [config.reports.storagePath];
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.success(`Created directory: ${dir}`);
        }
    }
}

function buildShardOptions() {
    const opts = {};

    if (Array.isArray(config.sharding.ids)) {
        opts.shards = config.sharding.ids.map(n => Number(n));
    }

    if (config.sharding.count !== "auto" && config.sharding.count != null) {
        opts.shardCount = Number(config.sharding.count);
    }

    return opts;
}

export async function startBot() {
    const shardId = process.env.SHARD_ID ?? "0";

    printBanner();
    logger.info(chalk.cyan(`Starting Omecord (Shard ${shardId})…`));

    ensureDirectories();

    const intents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ];

    const client = new OmecordClient({
        intents,
        ...buildShardOptions()
    });

    await loadEvents(client);
    await loadCommands(client);
    await client.safeLogin();
}