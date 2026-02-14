import { OmecordClient } from "./client.js";
import { loadEvents, loadCommands } from "./loader.js";
import { logger } from "./logger.js";
import { printBanner } from "./banner.js";
import config from "../config/config.json" assert { type: "json" };

export async function startBot() {
    printBanner();
    logger.info(`Starting Omecord on shard ${process.env.SHARD_ID ?? "0"}`);

    const client = new OmecordClient({
        intents: [
            "Guilds",
            "GuildVoiceStates",
            "GuildMessages",
            "MessageContent"
        ],
        shards: "auto",
        shardCount: "auto"
    });

    await loadEvents(client);
    await loadCommands(client);

    client.login(config.token)
        .then(() => logger.success(`Shard ready: ${client.user.tag}`))
        .catch(err => logger.error("Login failed:", err));
}