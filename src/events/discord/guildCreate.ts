import { Listener } from 'discord-akairo';
import type { Guild } from 'discord.js';

class GuildCreateListener extends Listener {
	constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate',
		});
	}

	async exec(guild: Guild): Promise<void> {
		await this.client.prisma.guild.create({
			data: {
				id: guild.id,
			},
		});
	}
}

export default GuildCreateListener;
