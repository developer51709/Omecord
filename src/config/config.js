import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "../core/logger.js";

// Load .env file
dotenv.config();

// Load config.json
const configPath = path.resolve("src/config/config.json");
let fileConfig = {};

if (fs.existsSync(configPath)) {
    try {
        fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
        logger.error("Failed to parse config.json:", err);
        process.exit(1);
    }
} else {
    logger.warn("config.json not found — relying on environment variables only");
}

// Merge .env + config.json
const mergedConfig = {
    token: process.env.DISCORD_TOKEN || fileConfig.token,
    mainServerId: process.env.MAIN_SERVER_ID || fileConfig.mainServerId,
    prefix: process.env.PREFIX || fileConfig.prefix || "!",

    support: {
        channels: process.env.SUPPORT_CHANNEL_IDS
            ? process.env.SUPPORT_CHANNEL_IDS.split(",").map(id => id.trim())
            : fileConfig.supportChannels || [],

        staffRole: process.env.SUPPORT_STAFF_ROLE_ID || fileConfig.supportStaffRole
    },

    nsfwFilter: {
        enabled: process.env.NSFW_FILTER_ENABLED
            ? process.env.NSFW_FILTER_ENABLED === "true"
            : fileConfig.nsfwFilter?.enabled ?? true,

        sensitivity: process.env.NSFW_FILTER_SENSITIVITY
            ? parseFloat(process.env.NSFW_FILTER_SENSITIVITY)
            : fileConfig.nsfwFilter?.sensitivity ?? 0.8
    },

    sharding: {
        count: process.env.SHARD_COUNT || fileConfig.shardCount || "auto",
        ids: process.env.SHARD_IDS
            ? process.env.SHARD_IDS.split(",").map(id => parseInt(id.trim()))
            : fileConfig.shardIds || null
    },

    logging: {
        level: process.env.LOG_LEVEL || fileConfig.logLevel || "info",
        color: process.env.LOG_COLOR
            ? process.env.LOG_COLOR === "true"
            : fileConfig.logColor ?? true
    },

    database: {
        url: process.env.DATABASE_URL || fileConfig.databaseUrl || null
    },

    video: {
        routerEndpoint: process.env.VIDEO_ROUTER_ENDPOINT || fileConfig.videoRouterEndpoint || null,
        routerKey: process.env.VIDEO_ROUTER_KEY || fileConfig.videoRouterKey || null
    },

    reports: {
        storagePath: process.env.REPORT_STORAGE_PATH || fileConfig.reportStoragePath || "./reports",
        retentionDays: process.env.REPORT_RETENTION_DAYS
            ? parseInt(process.env.REPORT_RETENTION_DAYS)
            : fileConfig.reportRetentionDays ?? 30
    }
};

// Required fields
const required = {
    token: "DISCORD_TOKEN",
    mainServerId: "MAIN_SERVER_ID"
};

// Validate required fields
for (const [key, envName] of Object.entries(required)) {
    if (!mergedConfig[key]) {
        logger.error(`Missing required configuration: ${envName}`);
        process.exit(1);
    }
}

logger.info("Configuration loaded successfully");

export const config = mergedConfig;