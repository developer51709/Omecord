import chalk from "chalk";

export const logger = {
    info: (...msg) =>
        console.log(chalk.blue("[INFO]"), chalk.gray(new Date().toISOString()), ...msg),

    warn: (...msg) =>
        console.warn(chalk.yellow("[WARN]"), chalk.gray(new Date().toISOString()), ...msg),

    error: (...msg) =>
        console.error(chalk.red("[ERROR]"), chalk.gray(new Date().toISOString()), ...msg),

    success: (...msg) =>
        console.log(chalk.green("[SUCCESS]"), chalk.gray(new Date().toISOString()), ...msg)
};