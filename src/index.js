import { ShardingManager } from "discord.js";
import { logger } from "./core/logger.js";
import { config } from "./config/config.js";
import chalk from "chalk";
import { registerShutdownHandlers } from "./core/shutdown.js";

// ─────────────────────────────────────────────
// Global Error Handlers (catch EVERYTHING)
// ─────────────────────────────────────────────

process.on("unhandledRejection", (reason, promise) => {
    logger.error("UNHANDLED PROMISE REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION:", err.stack || err);
});

process.on("warning", (warning) => {
    logger.warn("NODE WARNING:", warning.stack || warning);
});

// ─────────────────────────────────────────────
// Pretty header for startup
// ─────────────────────────────────────────────

console.log(chalk.cyan("───────────────────────────────────────────"));
console.log(chalk.cyan(" Omecord Sharding Manager Starting Up…"));
console.log(chalk.cyan("───────────────────────────────────────────"));

// ─────────────────────────────────────────────
// Validate token
// ─────────────────────────────────────────────

if (!config.token || config.token.length < 10) {
    logger.error(chalk.red("❌ Missing or invalid DISCORD_TOKEN"));
    logger.error("Set DISCORD_TOKEN in your .env file.");
    process.exit(1);
}

// ─────────────────────────────────────────────
// Normalize and validate shard configuration
// ─────────────────────────────────────────────

function normalizeShardConfig() {
    let shardCount = config.sharding.count;
    let shardList = config.sharding.ids;

    // Normalize shard list
    if (!shardList || shardList === "auto") {
        shardList = "auto";
    } else {
        if (!Array.isArray(shardList)) {
            logger.error(chalk.red("❌ SHARD_IDS must be an array or 'auto'"));
            logger.error("Example: SHARD_IDS=0,1,2");
            process.exit(1);
        }

        shardList = shardList.map(id => Number(id));

        if (shardList.some(n => isNaN(n))) {
            logger.error(chalk.red("❌ SHARD_IDS contains invalid numbers"));
            logger.error("Example: SHARD_IDS=0,1,2");
            process.exit(1);
        }
    }

    // Normalize shard count
    if (!shardCount || shardCount === "auto") {
        if (Array.isArray(shardList)) {
            const highest = Math.max(...shardList);
            shardCount = highest + 1;

            logger.warn(
                chalk.yellow(
                    `⚠️ SHARD_COUNT was 'auto' but SHARD_IDS is manual. Auto-adjusting shardCount to ${shardCount}.`
                )
            );
        } else {
            shardCount = "auto";
        }
    } else {
        shardCount = Number(shardCount);

        if (isNaN(shardCount) || shardCount <= 0) {
            logger.error(chalk.red("❌ Invalid SHARD_COUNT value"));
            logger.error("Expected a positive number or 'auto'.");
            process.exit(1);
        }

        if (Array.isArray(shardList)) {
            const highest = Math.max(...shardList);
            if (shardCount <= highest) {
                logger.error(
                    chalk.red(
                        `❌ SHARD_COUNT (${shardCount}) must be greater than highest shard ID (${highest}).`
                    )
                );
                logger.error("Fix your SHARD_COUNT or SHARD_IDS in .env or config.json.");
                process.exit(1);
            }
        }
    }

    return { shardCount, shardList };
}

const { shardCount, shardList } = normalizeShardConfig();

// ─────────────────────────────────────────────
// Startup Summary
// ─────────────────────────────────────────────

console.log(chalk.cyan("Startup Configuration:"));
console.log(chalk.gray("───────────────────────────────────────────"));
console.log(`Token:            ${chalk.green("OK")}`);
console.log(`Shard Count:      ${chalk.yellow(shardCount)}`);
console.log(`Shard List:       ${chalk.yellow(shardList === "auto" ? "auto" : shardList.join(", "))}`);
console.log(chalk.gray("───────────────────────────────────────────"));

// ─────────────────────────────────────────────
// Initialize Sharding Manager
// ─────────────────────────────────────────────

logger.info(chalk.cyan("Initializing Sharding Manager…"));

let manager;

try {
    manager = new ShardingManager("./src/shard.js", {
        token: config.token,
        totalShards: shardCount,
        shardList: shardList
    });
} catch (err) {
    logger.error(chalk.red("❌ Failed to initialize ShardingManager"));
    console.error(err);
    process.exit(1);
}

// Register global shutdown handlers
registerShutdownHandlers(manager);

// ─────────────────────────────────────────────
// Shard Events
// ─────────────────────────────────────────────

manager.on("shardCreate", shard => {
    logger.success(chalk.green(`🟢 Shard ${shard.id} launched successfully`));
});

manager.on("error", err => {
    logger.error(chalk.red("❌ Sharding Manager encountered an error:"));
    console.error(err);
});

// ─────────────────────────────────────────────
// Spawn Shards
// ─────────────────────────────────────────────

manager.spawn().catch(err => {
    logger.error(chalk.red("❌ Failed to spawn shards"));
    console.error(err);
    process.exit(1);
});