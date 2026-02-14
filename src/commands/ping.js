import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    prefix: "ping", // or "p"

    async execute(interaction) {
        await interaction.reply("Pong!");
    },

    async executePrefix(message, args) {
        await message.reply("Pong!");
    }
};