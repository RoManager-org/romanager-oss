import type { Group } from 'bloxy/dist/structures';
import { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';
import GroupCommand from '../../structures/GroupCommand';

class SetupCommand extends GroupCommand {
	constructor() {
		super('setup', {
			aliases: ['setup'],
			description: 'Set up your server with RoManager.',
			channel: 'guild',
			ownerOnly: true,
			args: [
				{
					id: 'robloxGroup',
					type: 'robloxGroup',
					prompt: {
						start:
							'What group would you like to link? Please enter a Roblox group **name**, **id**, or **url**.',
						retry:
							'Please enter a valid Roblox group **name**, **id**, or **url**.',
					},
					match: 'rest',
				},
			],
		});
	}

	async exec(
		message: Message,
		{ robloxGroup }: { robloxGroup: Group },
	): Promise<Message | Error | void> {
		if (!robloxGroup.getMember(bloxyClient.user!.id)) {
			return new Error(
				"Your bot account isn't in the group you're trying to set up. Join the group with the bot account, then try again.",
			);
		}

		await this.client.prisma.guild.update({
			where: { id: message.guild!.id },
			data: {
				linkedGroup: robloxGroup.id,
			},
		});

		return message.util?.reply(
			`Successfully linked **${robloxGroup.name}** to ${message.guild!.name}`,
		);
	}
}

export default SetupCommand;
