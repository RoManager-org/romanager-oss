import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';

class UnlinkCommand extends Command {
	constructor() {
		super('unlink', {
			aliases: ['unlink'],
			userPermissions: 'MANAGE_GUILD',
			description: 'Unlinks the currently linked group.',
			channel: 'guild',
		});
	}

	async exec(message: Message): Promise<Message | void> {
		const guildData = await this.client.prisma.guild.findUnique({
			where: {
				id: message.guild!.id,
			},
		});

		if (!guildData?.linkedGroup) {
			return message.util?.reply('No group to unlink.');
		}

		const group = await bloxyClient.getGroup(Number(guildData.linkedGroup));

		await this.client.prisma.permissionOverride.deleteMany({
			where: {
				guildId: message.guild!.id,
			},
		});

		await this.client.prisma.guild.update({
			where: {
				id: message.guild!.id,
			},
			data: {
				linkedGroup: null,
			},
		});

		return message.util?.reply(`Unlinked **${group.name}**.`);
	}
}

export default UnlinkCommand;
