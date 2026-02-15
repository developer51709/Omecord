import chalk from "chalk";

export function printBanner() {
    console.log(
        chalk.magenta(`
 ██████╗ ███╗   ███╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗ 
██╔═══██╗████╗ ████║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗
██║   ██║██╔████╔██║█████╗  ██║     ██║   ██║██████╔╝██║  ██║
██║   ██║██║╚██╔╝██║██╔══╝  ██║     ██║   ██║██╔══██╗██║  ██║
╚██████╔╝██║ ╚═╝ ██║███████╗╚██████╗╚██████╔╝██║  ██║██████╔╝
 ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝
        `)
    );

    console.log(chalk.cyan("           Discord‑Native Random Video Platform"));
    console.log(chalk.gray("─────────────────────────────────────────────────────────────"));
    console.log(chalk.gray("→ Pre-Alpha Version (this version is not stable and may break at any time)"));
    console.log(chalk.gray("→ Made with ♡ by Nyxen"));
    console.log(chalk.gray("→ https://github.com/developer51709/Omecord"));
    console.log(chalk.gray("─────────────────────────────────────────────────────────────"));
}