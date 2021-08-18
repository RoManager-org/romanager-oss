import type { Command } from 'discord-akairo';
import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import { SUPPORT_SERVER_LINK } from '../../common/constants';

class ErrorListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
		});
	}

	exec(error: Error, message: Message, command: Command): void {
		console.error(error);

		// @ts-expect-error Argument of type 'TextBasedChannels' is not assignable to parameter of type 'Channel'.
		this.client.commandHandler.removePrompt(message.channel, message.author);

		message.util?.reply({
			embeds: [
				this.client.util
					.embed()
					.setColor('RED')
					.setTitle('An internal bot error occurred')
					.setDescription(
						`An internal error has occurred with the **${
							command.aliases[0] ?? command.id
						}** command. If this continues to occur, please join the [support server](${SUPPORT_SERVER_LINK}) and notify us of the issue.`,
					),
			],
		});

		message.react('❗');
	}
}

export default ErrorListener;
