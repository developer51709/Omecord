// src/core/shutdown.js

import { logger } from "./logger.js";
import chalk from "chalk";

/**
 * Registers global shutdown handlers for the ShardingManager.
 * Ensures all shards clean up voice connections before exiting.
 */
export function registerShutdownHandlers(manager) {
    let shuttingDown = false;

    async function shutdown(reason = "Unknown") {
        if (shuttingDown) return;
        shuttingDown = true;

        logger.warn(chalk.yellow(`⚠️ Shutdown initiated (${reason}) — cleaning up voice connections…`));

        try {
            // Tell all shards to destroy their voice connections
            await manager.broadcastEval(async () => {
                const { getVoiceConnections } = await import("@discordjs/voice");

                for (const conn of getVoiceConnections().values()) {
                    try {
                        conn.destroy();
                    } catch {}
                }

                // If the shard has a session manager, stop all sessions
                if (global.sessionManager) {
                    for (const session of global.sessionManager.sessions.values()) {
                        try {
                            session.stop();
                        } catch {}
                    }
                }

                // Destroy the Discord client if available
                if (global.client) {
                    try {
                        await global.client.destroy();
                    } catch {}
                }
            });

            logger.success(chalk.green("All shards cleaned up successfully"));
        } catch (err) {
            logger.error("Error during shutdown cleanup:", err);
        }

        process.exit(0);
    }

    // OS / process signals
    process.on("SIGINT", () => shutdown("SIGINT (Ctrl+C)"));
    process.on("SIGTERM", () => shutdown("SIGTERM (system stop)"));

    // Global async error handlers
    process.on("unhandledRejection", (reason) => {
        logger.error("UNHANDLED PROMISE REJECTION:", reason);
        shutdown("unhandledRejection");
    });

    process.on("uncaughtException", (err) => {
        logger.error("UNCAUGHT EXCEPTION:", err.stack || err);
        shutdown("uncaughtException");
    });

    process.on("warning", (warning) => {
        logger.warn("NODE WARNING:", warning.stack || warning);
    });

    logger.info("Shutdown handlers registered");
}