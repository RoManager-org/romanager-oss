import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';

class CooldownListener extends Listener {
	constructor() {
		super('cooldownListener', {
			emitter: 'commandHandler',
			event: 'cooldown',
		});
	}

	exec(message: Message): void {
		message.react('⌛');
	}
}

export default CooldownListener;
