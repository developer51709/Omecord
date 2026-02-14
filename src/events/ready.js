import { logger } from "../core/logger.js";

export default function ready() {
    logger.success(`Logged in as ${this.user.tag} (Shard ${this.shardId})`);
}