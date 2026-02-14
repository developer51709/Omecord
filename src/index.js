import { ShardingManager } from "discord.js";
import { logger } from "./core/logger.js";
import { config } from "./config/config.js";

const manager = new ShardingManager("./src/shard.js", {
    token: config.token,
    totalShards: config.sharding.count || "auto",
    shardList: config.sharding.ids || "auto"
});

manager.on("shardCreate", shard =>
    logger.info(`Launched shard ${shard.id}`)
);

manager.spawn();