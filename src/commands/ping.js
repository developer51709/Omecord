import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default {
    prefix: "ping",

    async executePrefix(message) {
        const client = message.client;
        const shardId = client.shardId ?? 0;

        const sent = await message.reply("Measuring latency…");

        const latency = sent.createdTimestamp - message.createdTimestamp;
        const wsPing = client.ws.ping;

        const refreshButton = new ButtonBuilder()
            .setCustomId("ping_refresh")
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(refreshButton);

        const reply = await sent.edit({
            content:
                `**Pong**\n` +
                `• Message latency: ${latency}ms\n` +
                `• WebSocket ping: ${wsPing}ms\n` +
                `• Shard: ${shardId}`,
            components: [row]
        });

        const collector = reply.createMessageComponentCollector({
            time: 30_000
        });

        collector.on("collect", async interaction => {
            if (interaction.customId !== "ping_refresh") return;

            const newSent = await interaction.update({
                content: "Rechecking latency…",
                components: [row]
            });

            const newLatency = newSent.createdTimestamp - message.createdTimestamp;
            const newWsPing = client.ws.ping;

            await interaction.editReply({
                content:
                    `**Pong**\n` +
                    `• Message latency: ${newLatency}ms\n` +
                    `• WebSocket ping: ${newWsPing}ms\n` +
                    `• Shard: ${shardId}`,
                components: [row]
            });
        });

        collector.on("end", () => {
            const disabledButton = ButtonBuilder.from(refreshButton).setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

            reply.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};