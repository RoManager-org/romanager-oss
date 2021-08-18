import { Listener } from 'discord-akairo';

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	async exec(): Promise<void> {
		console.log(
			`Logged onto Discord as ${this.client.user?.tag} (${this.client.user?.id})`,
		);

		const allGuildsData = await this.client.prisma.guild.findMany();

		const guildsMissingData = [...this.client.guilds.cache.values()].filter(
			(guild) =>
				allGuildsData.find((guildData) => guildData.id === guild.id) ===
				undefined,
		);

		await this.client.prisma.guild.createMany({
			data: guildsMissingData.map((guild) => {
				return { id: guild.id };
			}),
		});
	}
}

export default ReadyListener;
