import type { Command } from 'discord-akairo';
import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { deletePrompts } from '../../util/functions';

class CommandFinishedListener extends Listener {
	constructor() {
		super('commandFinished', {
			emitter: 'commandHandler',
			event: 'commandFinished',
		});
	}

	exec(
		message: Message,
		_command: Command,
		_args: Record<string, unknown>,
		returnValue: Message | Error | boolean | undefined,
	): void {
		if (returnValue instanceof Error) {
			const errorEmbed = new MessageEmbed({
				color: 'RED',
				title: 'Error',
				description: returnValue.message,
			});

			message.util?.reply({ embeds: [errorEmbed] });
		}

		if (returnValue === true) {
			message.react('✅');
		}

		if (returnValue === false) {
			message.react('❌');
		}

		deletePrompts(message);
	}
}

export default CommandFinishedListener;
