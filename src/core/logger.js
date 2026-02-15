import chalk from "chalk";
import { config } from "../config/config.js";

// Log level from config.json or .env
const logLevel = config.logging.level ?? "info";

// Enable/disable color
const logColor = config.logging.color ?? true;

// Log level hierarchy
const logLevels = {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3
};

// If color is disabled, replace chalk with identity functions
const color = logColor
    ? chalk
    : new Proxy({}, { get: () => (txt => txt) });

// Helper: should this message be logged?
function shouldLog(level) {
    return logLevels[level] >= logLevels[logLevel];
}

// Helper: timestamp
function ts() {
    return new Date().toISOString();
}

export const logger = {
    debug: (...msg) => {
        if (!shouldLog("debug")) return;
        console.debug(color.gray("[DEBUG]"), color.gray(ts()), ...msg);
    },

    info: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.blue("[INFO]"), color.gray(ts()), ...msg);
    },

    warn: (...msg) => {
        if (!shouldLog("warn")) return;
        console.warn(color.yellow("[WARN]"), color.gray(ts()), ...msg);
    },

    error: (...msg) => {
        if (!shouldLog("error")) return;
        console.error(color.red("[ERROR]"), color.gray(ts()), ...msg);
    },

    success: (...msg) => {
        if (!shouldLog("success")) return;
        console.log(color.green("[SUCCESS]"), color.gray(ts()), ...msg);
    },

    // Module-specific loggers
    orchestrator: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.magenta("[MediaOrchestrator]"), color.gray(ts()), ...msg);
    },

    ptsession: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.cyan("[PrototypeSession]"), color.gray(ts()), ...msg);
    }
};