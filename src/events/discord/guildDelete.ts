import { Listener } from 'discord-akairo';
import type { Guild } from 'discord.js';

class GuildDeleteListener extends Listener {
	constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete',
		});
	}

	async exec(guild: Guild): Promise<void> {
		await this.client.prisma.guild.delete({
			where: {
				id: guild.id,
			},
		});
	}
}

export default GuildDeleteListener;
