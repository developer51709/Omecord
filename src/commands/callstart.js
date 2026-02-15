// src/commands/callstart.js

import { mediaOrchestrator } from "../calls/orchestrator/MediaOrchestrator.js";

export default {
    prefix: "callstart",
    data: {
        description: "Manually start a call session between two voice channels."
    },

    /**
     * @param {Message} message
     * @param {string[]} args
     */
    async executePrefix(message, args) {
        const client = message.client;

        // Permission check
        if (!message.member.permissions.has("ManageGuild")) {
            return message.reply("❌ You need **Manage Server** to start a call session.");
        }

        // Usage: !callstart <channelA> <channelB> [mode] [video]
        if (args.length < 2) {
            return message.reply(
                `Usage:\n\`${client.config.prefix}callstart <channelA> <channelB> [mode] [video]\`\n` +
                `Example:\n\`${client.config.prefix}callstart 123456789012345678 987654321098765432 bridge true\``
            );
        }

        const channelAId = args[0];
        const channelBId = args[1];
        const mode = args[2] || "bridge";
        const enableVideo = args[3] !== "false"; // default true

        // Fetch channels globally, not from the message guild
        const channelA =
            client.channels.cache.get(channelAId) ||
            await client.channels.fetch(channelAId).catch(() => null);

        const channelB =
            client.channels.cache.get(channelBId) ||
            await client.channels.fetch(channelBId).catch(() => null);

        if (!channelA || !channelB) {
            return message.reply("❌ One or both channel IDs are invalid.");
        }

        if (!channelA.isVoiceBased() || !channelB.isVoiceBased()) {
            return message.reply("❌ Both channels must be **voice channels**.");
        }

        // Prevent duplicate sessions
        if (mediaOrchestrator.getSession(channelA.guild.id)) {
            return message.reply(
                `❌ Guild **${channelA.guild.name}** already has an active session.`
            );
        }

        if (mediaOrchestrator.getSession(channelB.guild.id)) {
            return message.reply(
                `❌ Guild **${channelB.guild.name}** already has an active session.`
            );
        }

        await message.reply(
            `🔗 Starting call session between **${channelA.name}** and **${channelB.name}**…`
        );

        try {
            await mediaOrchestrator.startSession(channelA, channelB, {
                mode,
                enableVideo
            });

            await message.channel.send(
                `✅ Session started!\n` +
                `Mode: **${mode}**\n` +
                `Video: **${enableVideo ? "Enabled" : "Disabled"}**`
            );
        } catch (err) {
            console.error("[!callstart] Error:", err);

            await message.channel.send(
                "❌ Failed to start the session. Check logs for details."
            );
        }
    }
};