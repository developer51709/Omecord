import { Client, Collection } from "discord.js";
import { logger } from "./logger.js";
import { config } from "../config/config.js";
import chalk from "chalk";

export class OmecordClient extends Client {
    constructor(options) {
        super(options);

        this.commands = new Collection();
        this.version = "0.1.0";
        this.config = config;
        this.shardId = process.env.SHARD_ID ?? null;

        this.validateOptions(options);

        logger.info(
            chalk.green(`Client initialized (Shard ${this.shardId ?? "0"})`)
        );
    }

    validateOptions(options) {
        if (!Array.isArray(options.intents)) {
            throw new TypeError("ClientInvalidOption: intents must be an array of GatewayIntentBits");
        }

        if (options.shards !== undefined &&
            options.shards !== "auto" &&
            typeof options.shards !== "number" &&
            !Array.isArray(options.shards)) {
            throw new TypeError("ClientInvalidOption: shards must be a number, array of numbers, or 'auto'");
        }

        if (options.shardCount !== undefined &&
            options.shardCount !== "auto" &&
            typeof options.shardCount !== "number") {
            throw new TypeError("ClientInvalidOption: shardCount must be a number or 'auto'");
        }
    }

    async safeLogin() {
        try {
            if (!this.config.token) {
                throw new Error("Missing DISCORD_TOKEN");
            }

            await super.login(this.config.token);

            logger.success(
                chalk.green(`Shard ${this.shardId ?? "0"} logged in as ${this.user.tag}`)
            );
        } catch (err) {
            logger.error(chalk.red(`❌ Login failed for shard ${this.shardId ?? "0"}`));
            console.error(err);
            process.exit(1);
        }
    }
}