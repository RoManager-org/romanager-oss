import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import { deletePrompts } from '../../util/functions';

class CommandCancelledListener extends Listener {
	constructor() {
		super('commandCancelled', {
			emitter: 'commandHandler',
			event: 'commandCancelled',
		});
	}

	exec(message: Message): void {
		message.react('❌');
		deletePrompts(message);
	}
}

export default CommandCancelledListener;
