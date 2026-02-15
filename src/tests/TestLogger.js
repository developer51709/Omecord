import fs from "fs";
import path from "path";

export class TestLogger {
    constructor(filename = "prototype_test_results.txt") {
        this.file = path.resolve("logs", filename);

        // Ensure logs folder exists
        fs.mkdirSync(path.dirname(this.file), { recursive: true });

        // Start fresh
        fs.writeFileSync(this.file, "=== Omecord Prototype Test Results ===\n\n");
    }

    log(message) {
        const line = `[INFO] ${message}\n`;
        fs.appendFileSync(this.file, line);
        console.log(line.trim());
    }

    error(message, err) {
        const line = `[ERROR] ${message}\n${err?.stack || err}\n\n`;
        fs.appendFileSync(this.file, line);
        console.error(line.trim());
    }

    section(title) {
        const line = `\n=== ${title} ===\n`;
        fs.appendFileSync(this.file, line);
        console.log(line.trim());
    }
}