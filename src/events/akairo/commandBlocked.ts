import type { Command } from 'discord-akairo';
import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';

class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
		});
	}

	exec(message: Message, command: Command, reason: string): void {
		console.debug(
			`${command.categoryID}:${command.id} ran by ${message.author.tag} (${message.author.id}) with message as "${message.content}" blocked: ${reason}`,
		);
		message.react('🚫');

		const errorEmbed = this.client.util
			.embed()
			.setColor('RED')
			.setTitle('Blocked');

		if (reason === 'owner') {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription('This command is locked to owners only.'),
				],
			});
			return;
		}

		if (reason === 'guild') {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription(
						'You can only use this command in a server.',
					),
				],
			});
		}

		if (reason === 'dm') {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription('You can only use this command in DMs.'),
				],
			});
		}
	}
}

export default CommandBlockedListener;
