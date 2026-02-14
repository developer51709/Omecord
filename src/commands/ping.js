import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    async execute(interaction) {
        const shard = interaction.client.shardId ?? "0";
        const version = interaction.client.version;

        await interaction.reply(`Pong! (Shard ${shard}, v${version})`);
    }
};