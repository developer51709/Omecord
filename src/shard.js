import { startBot } from "./core/startup.js";
import { logger } from "./core/logger.js";
import chalk from "chalk";

const shardId = process.env.SHARD_ID ?? "0";

logger.info(chalk.cyan(`Starting shard worker ${shardId}…`));

(async () => {
    try {
        await startBot();
    } catch (err) {
        logger.error(chalk.red(`❌ Shard ${shardId} crashed during startup`));
        console.error(err);
        process.exit(1);
    }
})();