import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';

class SettingsCommand extends Command {
	constructor() {
		super('settings', {
			aliases: ['settings'],
			description: 'View current guild settings.',
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD',
			typing: true,
		});
	}

	async exec(message: Message): Promise<Message | void> {
		const guildData = await this.client.prisma.guild.findUnique({
			where: {
				id: message.guild!.id,
			},
			include: {
				permissionOverrides: true,
			},
		});

		const settingsEmbed = this.client.util
			.embed()
			.setColor('BLURPLE')
			.setTitle('Settings')
			.addField('Prefix', guildData?.prefix ?? '.', true);

		if (guildData?.linkedGroup) {
			const group = await bloxyClient.getGroup(Number(guildData.linkedGroup));

			if (group) {
				settingsEmbed.addField(
					'Linked Group',
					`[${group.name}](https://roblox.com/groups/${group.id}}) (**${group.id}**)`,
					true,
				);
			}
		}

		return message.util?.reply({ embeds: [settingsEmbed] });
	}
}

export default SettingsCommand;
