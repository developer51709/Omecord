import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} from "discord.js";

export default {
    prefix: "help",

    async executePrefix(message, args) {
        const client = message.client;

        const prefixCommands = [...client.commands.values()]
            .filter(cmd => cmd.prefix)
            .map(cmd => ({
                name: cmd.prefix,
                description: cmd.data?.description ?? "No description provided."
            }));

        if (prefixCommands.length === 0) {
            return message.reply("No prefix commands are registered.");
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Select a command")
            .addOptions(
                prefixCommands.map(cmd => ({
                    label: cmd.name,
                    value: cmd.name,
                    description: cmd.description.slice(0, 50)
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("Help Menu")
            .setDescription("Choose a command from the menu below.")
            .setColor("Blurple");

        const helpMessage = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = helpMessage.createMessageComponentCollector({
            time: 60_000
        });

        collector.on("collect", async interaction => {
            const selected = interaction.values[0];
            const cmd = client.commands.get(selected);

            const cmdEmbed = new EmbedBuilder()
                .setTitle(`Command: ${cmd.prefix}`)
                .setColor("Green")
                .addFields(
                    {
                        name: "Description",
                        value: cmd.data?.description ?? "No description provided."
                    },
                    {
                        name: "Usage",
                        value: `\`${client.config.prefix}${cmd.prefix}\``
                    }
                );

            await interaction.update({
                embeds: [cmdEmbed],
                components: [row]
            });
        });

        collector.on("end", () => {
            const disabledMenu = StringSelectMenuBuilder.from(selectMenu).setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);

            helpMessage.edit({
                components: [disabledRow]
            }).catch(() => {});
        });
    }
};