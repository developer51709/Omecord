import fs from "fs";
import path from "path";
import chalk from "chalk";
import { config } from "../config/config.js";

// ===============================
//  FILE LOGGING TOGGLE
// ===============================
const WRITE_TO_FILE = false;   // ← set to false to disable file logging

// ===============================
//  LOG FILE PATHS
// ===============================
const LOG_DIR = path.resolve("logs");

const LOG_FILES = {
    debug: path.join(LOG_DIR, "debug.log"),
    info: path.join(LOG_DIR, "info.log"),
    warn: path.join(LOG_DIR, "warn.log"),
    error: path.join(LOG_DIR, "error.log"),
    success: path.join(LOG_DIR, "success.log"),
    orchestrator: path.join(LOG_DIR, "orchestrator.log"),
    ptsession: path.join(LOG_DIR, "ptsession.log")
};

// Ensure log directory exists
if (WRITE_TO_FILE && !fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ===============================
//  CONFIG SETTINGS
// ===============================
const logLevel = config.logging.level ?? "info";
const logColor = config.logging.color ?? true;

const logLevels = {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3
};

// ===============================
//  COLOR HANDLING
// ===============================
const color = logColor
    ? chalk
    : new Proxy({}, { get: () => (txt => txt) });

// ===============================
//  HELPERS
// ===============================
function shouldLog(level) {
    return logLevels[level] >= logLevels[logLevel];
}

function ts() {
    return new Date().toISOString();
}

function writeToFile(level, msgArray) {
    if (!WRITE_TO_FILE) return;

    const file = LOG_FILES[level];
    if (!file) return; // ignore unknown levels

    const line =
        `[${level.toUpperCase()}] ${ts()} ` +
        msgArray.map(m => (typeof m === "string" ? m : JSON.stringify(m))).join(" ") +
        "\n";

    fs.appendFile(file, line, err => {
        if (err) console.error("Failed to write log file:", err);
    });
}

// ===============================
//  LOGGER
// ===============================
export const logger = {
    debug: (...msg) => {
        if (!shouldLog("debug")) return;
        console.debug(color.gray("[DEBUG]"), color.gray(ts()), ...msg);
        writeToFile("debug", msg);
    },

    info: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.blue("[INFO]"), color.gray(ts()), ...msg);
        writeToFile("info", msg);
    },

    warn: (...msg) => {
        if (!shouldLog("warn")) return;
        console.warn(color.yellow("[WARN]"), color.gray(ts()), ...msg);
        writeToFile("warn", msg);
    },

    error: (...msg) => {
        if (!shouldLog("error")) return;
        console.error(color.red("[ERROR]"), color.gray(ts()), ...msg);
        writeToFile("error", msg);
    },

    success: (...msg) => {
        if (!shouldLog("success")) return;
        console.log(color.green("[SUCCESS]"), color.gray(ts()), ...msg);
        writeToFile("success", msg);
    },

    // Module-specific loggers
    orchestrator: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.magenta("[MediaOrchestrator]"), color.gray(ts()), ...msg);
        writeToFile("orchestrator", msg);
    },

    ptsession: (...msg) => {
        if (!shouldLog("info")) return;
        console.log(color.cyan("[PrototypeSession]"), color.gray(ts()), ...msg);
        writeToFile("ptsession", msg);
    }
};