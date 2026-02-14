import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

export default {
    prefix: "shardinfo",

    async executePrefix(message) {
        const client = message.client;

        const shardId = client.shardId ?? 0;
        const totalShards = client.shard?.count ?? 1;

        const buildEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Shard Information")
                .addFields(
                    { name: "Shard ID", value: `${shardId}`, inline: true },
                    { name: "Total Shards", value: `${totalShards}`, inline: true },
                    { name: "Guilds on This Shard", value: `${client.guilds.cache.size}`, inline: true },
                    { name: "WebSocket Ping", value: `${client.ws.ping}ms`, inline: true },
                    { name: "Uptime", value: `${Math.floor(client.uptime / 1000)}s`, inline: true }
                )
                .setTimestamp();
        };

        const refreshButton = new ButtonBuilder()
            .setCustomId("shardinfo_refresh")
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(refreshButton);

        const reply = await message.reply({
            embeds: [buildEmbed()],
            components: [row]
        });

        const collector = reply.createMessageComponentCollector({
            time: 30_000
        });

        collector.on("collect", async interaction => {
            if (interaction.customId !== "shardinfo_refresh") return;

            await interaction.update({
                embeds: [buildEmbed()],
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