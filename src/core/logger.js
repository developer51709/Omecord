import chalk from "chalk";

export const logger = {
    debug: (...msg) =>
        console.debug(chalk.gray("[DEBUG]"), chalk.gray(new Date().toISOString()), ...msg),
    info: (...msg) =>
        console.log(chalk.blue("[INFO]"), chalk.gray(new Date().toISOString()), ...msg),

    warn: (...msg) =>
        console.warn(chalk.yellow("[WARN]"), chalk.gray(new Date().toISOString()), ...msg),

    error: (...msg) =>
        console.error(chalk.red("[ERROR]"), chalk.gray(new Date().toISOString()), ...msg),

    success: (...msg) =>
        console.log(chalk.green("[SUCCESS]"), chalk.gray(new Date().toISOString()), ...msg),

    // Module-specific loggers

    // MediaOrchestrator.js
    orchestrator: (...msg) =>
        console.log(chalk.magenta("[MediaOrchestrator]"), chalk.gray(new Date().toISOString()), ...msg),

    // PrototypeSession.js
    ptsession: (...msg) =>
        console.log(chalk.cyan("[PrototypeSession]"), chalk.gray(new Date().toISOString()), ...msg)
};