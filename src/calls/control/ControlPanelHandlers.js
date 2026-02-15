// src/calls/control/ControlPanelHandlers.js

import { CONTROL_IDS } from "./ControlPanelButtons.js";
import { mediaOrchestrator } from "../orchestrator/MediaOrchestrator.js";
import { queueManager } from "../matchmaking/QueueManager.js";
import { buildHelpMenu } from "./HelpMenu/HelpMenuBuilder.js";
import { canUseControl } from "./utils/ControlPermissions.js";

const registered = new Set();

/**
 * Register global interaction handlers once per client.
 */
export function registerControlPanelHandlers(client) {
    if (registered.has(client)) return;
    registered.add(client);

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const id = interaction.customId;

        if (!Object.values(CONTROL_IDS).includes(id)) return;

        const guildId = interaction.guildId;
        const session = mediaOrchestrator.getSession(guildId);
        if (!session) {
            return interaction.reply({
                content: "This call session is no longer active.",
                ephemeral: true
            });
        }

        if (!canUseControl(interaction.member, id, session)) {
            return interaction.reply({
                content: "You don't have permission to use this control.",
                ephemeral: true
            });
        }

        try {
            switch (id) {
                case CONTROL_IDS.SKIP:
                    await handleSkip(interaction, session);
                    break;
                case CONTROL_IDS.PAUSE:
                    await handlePause(interaction, session);
                    break;
                case CONTROL_IDS.REPORT:
                    await handleReport(interaction, session);
                    break;
                case CONTROL_IDS.END:
                    await handleEnd(interaction, session);
                    break;
                case CONTROL_IDS.HELP:
                    await handleHelp(interaction, session);
                    break;
            }
        } catch (err) {
            console.error("[ControlPanelHandlers] Error handling control:", err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "Something went wrong handling that control.",
                    ephemeral: true
                });
            }
        }
    });
}

async function handleSkip(interaction, session) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;

    // Requeue this guild
    queueManager.add({
        guildId,
        channelId: session.vcA.id,
        mode: session.mode || "bridge",
        timestamp: Date.now(),
        metadata: {}
    });

    // End current session
    mediaOrchestrator.stopSession(guildId);

    await interaction.editReply("Skipping to a new server… you’ll be reconnected shortly.");
}

async function handlePause(interaction, session) {
    await interaction.deferReply({ ephemeral: true });

    session.paused = !session.paused;

    if (session.paused) {
        session.pausePipelines?.();
        await interaction.editReply("Call paused. Audio/video temporarily disconnected.");
    } else {
        session.resumePipelines?.();
        await interaction.editReply("Call resumed. Audio/video reconnected.");
    }

    await session.controlPanelManager.updatePanel();
}

async function handleReport(interaction, session) {
    await interaction.deferReply({ ephemeral: true });

    // Here you’d send to a mod-log channel or external system
    console.log(
        `[REPORT] Guild ${interaction.guildId} reported partner ${session.vcB.guild.id}`
    );

    await interaction.editReply(
        "The current server has been reported. Thank you for helping keep things safe."
    );
}

async function handleEnd(interaction, session) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    mediaOrchestrator.stopSession(guildId);

    await interaction.editReply("Call session ended.");
}

async function handleHelp(interaction, session) {
    const helpPayload = buildHelpMenu(session);

    await interaction.reply({
        ...helpPayload,
        ephemeral: true
    });
}