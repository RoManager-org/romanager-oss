import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			description: 'Shows the ping between the bot and Discord.',
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const sent = await message.util?.reply('Pong!');
		if (!sent) return;
		const timeDiff =
			(sent.editedAt?.getTime() ?? sent.createdAt?.getTime()) -
			(message.editedAt?.getTime() ?? message.createdAt.getTime());

		return sent?.edit(`Pong! \`${timeDiff}ms\``);
	}
}

export default PingCommand;
