import type { Command } from 'discord-akairo';
import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';

class MissingPermissionsListener extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
		});
	}

	exec(
		message: Message,
		_command: Command,
		type: 'client' | 'user',
		// eslint-disable-next-line
		missing?: any,
	): void {
		if (!missing) return;

		message.util?.reply(
			`${
				type === 'client' ? 'I am' : 'You are'
			} missing ${missing} permission(s).${
				type === 'client' ? ' Please grant them to me and try again.' : ''
			}`,
		);
	}
}

export default MissingPermissionsListener;
