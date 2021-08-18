import type { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';
import GroupCommand from '../../structures/GroupCommand';

class ShoutCommand extends GroupCommand {
	constructor() {
		super('shout', {
			aliases: ['shout'],
			description: 'Changes the group shout.',
			channel: 'guild',
			groupPermission: 'postToStatus',
			typing: true,
			args: [
				{
					id: 'shoutContent',
					match: 'rest',
					prompt: {
						start: 'What would you like to set the shout to?',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ shoutContent }: { shoutContent: string },
	): Promise<Message | Error | void> {
		const guildData = await this.client.prisma.guild.findUnique({
			where: {
				id: message.guild!.id,
			},
		});

		const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

		if (!group) return;

		if (shoutContent === 'clear') {
			await group.updateShout('');
			return message.util?.reply('Successfully cleared the group shout.');
		}

		const newShout = await group.updateShout(shoutContent);

		return message.util?.reply(
			`Successfully updated the shout: \`\`\`\n${newShout?.body}\`\`\``,
		);
	}
}

export default ShoutCommand;
