import { ShardingManager } from "discord.js";
import { logger } from "./core/logger.js";
import config from "./config/config.json" assert { type: "json" };

const manager = new ShardingManager("./src/shard.js", {
    token: config.token,
    totalShards: "auto"
});

manager.on("shardCreate", shard =>
    logger.info(`Launched shard ${shard.id}`)
);

manager.spawn();