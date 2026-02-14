import { Client, Collection } from "discord.js";

export class OmecordClient extends Client {
    constructor(options) {
        super(options);

        this.commands = new Collection();
        this.version = "0.1.0";

        this.shardId = process.env.SHARD_ID ?? null;
    }
}