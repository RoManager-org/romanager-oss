import { PrismaClient } from '@prisma/client';
import {
	AkairoClient,
	ArgumentTypeCaster,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
} from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import fs from 'fs';
import path from 'path';

const errorEmbed = new MessageEmbed().setColor('RED');

class RoManagerClient extends AkairoClient {
	constructor() {
		super(
			{
				ownerID: process.env.DISCORD_BOT_OWNER as `${bigint}`,
			},
			{
				allowedMentions: {
					repliedUser: false,
				},
				partials: ['MESSAGE', 'USER', 'CHANNEL', 'REACTION'],
				intents: [
					'GUILDS',
					'GUILD_MESSAGES',
					'GUILD_MESSAGE_REACTIONS',
					'DIRECT_MESSAGES',
					'DIRECT_MESSAGE_REACTIONS',
				],
			},
		);

		this.prisma = new PrismaClient();

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: path.join(__dirname, '..', 'inhibitors/'),
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', 'events/'),
		});

		this.commandHandler = new CommandHandler(this, {
			commandUtil: true,
			handleEdits: true,
			storeMessages: true,
			automateCategories: true,
			aliasReplacement: /-/g,
			directory: path.join(__dirname, '..', 'commands/'),
			prefix: async (message) => {
				if (!message.guild) return '.';

				const guildData = await this.prisma.guild.findUnique({
					where: { id: message.guild.id },
				});

				return guildData?.prefix ?? '.';
			},
			argumentDefaults: {
				prompt: {
					modifyStart: (msg, text) => ({
						embeds: [
							new MessageEmbed()
								.setTitle('Prompt')
								.setDescription(text)
								.setColor('BLURPLE')
								.setFooter(
									'This prompt will expire in 300 seconds. Say "cancel" to cancel.',
								),
						],
						replyTo: msg,
					}),

					modifyRetry: (msg, text) => ({
						embeds: [
							errorEmbed.setTitle('Invalid option').setDescription(text ?? ''),
						],
						replyTo: msg,
					}),

					modifyTimeout: (
						msg,
						text = "You didn't respond within 300 seconds!",
					) => ({
						embeds: [
							errorEmbed.setTitle('Prompt timed out').setDescription(text),
						],
						replyTo: msg,
					}),

					cancelWord: 'cancel',
					time: 300000,
				},
			},
		});
	}

	async login() {
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
		});

		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

		return super.login();
	}
}

const client = new RoManagerClient();
client.login();

client.on('debug', console.debug);

fs.readdir(path.join(__dirname, '..', 'arguments/'), (_e, files) => {
	for (const file of files) {
		if (!file.endsWith('.js')) continue;

		import(`../arguments/${file}`)
			.then((typeCasterModule: { default: ArgumentTypeCaster }) => {
				client.commandHandler.resolver.addType(
					file.replace('.js', ''),
					typeCasterModule.default,
				);

				console.debug(`Registered type caster ${file.replace('.js', '')}`);
				return;
			})
			.catch((e) => {
				console.log(`Error while registering type caster: ${e}`);
			});
	}
});

export default client;
