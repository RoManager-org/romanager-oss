import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: 'View or change my prefix for this guild.',
			channel: 'guild',
			args: [
				{
					id: 'newPrefix',
					match: 'rest',
				},
			],
		});
	}

	async exec(
		message: Message,
		{ newPrefix }: { newPrefix: string },
	): Promise<Message | string | undefined> {
		if (!newPrefix) {
			if (typeof this.handler.prefix !== 'function') return;
			const currentPrefix = await this.handler.prefix(message);

			return message.util?.reply(
				`The current prefix is \`${currentPrefix}\`. To change the prefix, run \`${currentPrefix}prefix <prefix>\`.`,
			);
		}

		if (!message.member?.permissions.has('MANAGE_GUILD')) {
			return 'You do not have permission to change the prefix.';
		}

		await this.client.prisma.guild.update({
			where: {
				id: message.guild?.id,
			},
			data: {
				prefix: newPrefix,
			},
		});

		return message.util?.reply(`Set the prefix to \`${newPrefix}\`.`);
	}
}

export default PrefixCommand;
