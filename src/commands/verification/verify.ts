import type { User } from 'bloxy/dist/structures';
import { Command } from 'discord-akairo';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import got from 'got';
import { bloxyClient } from '../../clients/bloxyClient';
import {
	BLOXLINK_API_URL,
	ROVER_API_URL,
	ROWIFI_API_URL,
	WORDS,
} from '../../common/constants';
import type {
	IBloxlinkResponse,
	IRoVerResponse,
	IRoWifiResponse,
} from '../../common/types.d';

class VerifyCommand extends Command {
	constructor() {
		super('verify', {
			aliases: ['verify'],
			cooldown: 5000,
			ratelimit: 1,
			typing: true,
			description: 'Link your Roblox account to your Discord account.',
			args: [
				{
					id: 'robloxUser',
					type: 'robloxUser',
					match: 'rest',
					prompt: {
						start:
							'What account would you like to verify? Please enter a Roblox account **username**, **id**, or **url**.',
						retry:
							'That user does not exist or could not be found. Please enter a Roblox account **username**, **id**, or **url**.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ robloxUser }: { robloxUser: User },
	): Promise<Message | Error | boolean | void> {
		const userData = await this.client.prisma.user.findUnique({
			where: {
				id: message.author.id,
			},
		});

		if (
			userData?.robloxAccounts
				.map((id: BigInt) => Number(id))
				.includes(robloxUser.id)
		) {
			return message.util?.reply(
				Number(userData.defaultRobloxAccount) === robloxUser.id
					? `You're already verified as **${robloxUser.name}**.`
					: `You're already verified as **${robloxUser.name}**. Run the \`switch-account\` command to switch to it.`,
			);
		}

		const bloxlinkRequest = got<IBloxlinkResponse>(
			BLOXLINK_API_URL + `user/${message.author.id}`,
			{
				responseType: 'json',
				resolveBodyOnly: true,
			},
		);

		const roverRequest = got<IRoVerResponse>(
			ROVER_API_URL + `user/${message.author.id}`,
			{
				responseType: 'json',
				resolveBodyOnly: true,
			},
		);

		const roWifiRequest = got<IRoWifiResponse>(ROWIFI_API_URL + 'users/', {
			responseType: 'json',
			resolveBodyOnly: true,
		});

		const requests = await Promise.all([
			bloxlinkRequest.catch(() => undefined),
			roverRequest.catch(() => undefined),
			roWifiRequest.catch(() => undefined),
		]);

		const robloxIds = requests?.map((request): number | undefined => {
			if (!request) return;

			if ('primaryAccount' in request) {
				return request.primaryAccount
					? Number(request.primaryAccount)
					: undefined;
			}

			if ('robloxId' in request) {
				return request.robloxId;
			}

			if ('roblox_id' in request) {
				return request.roblox_id;
			}

			return;
		});

		if (robloxIds?.includes(robloxUser.id)) {
			await this.client.prisma.user.upsert({
				create: {
					id: message.author.id,
					robloxAccounts: robloxUser.id,
					defaultRobloxAccount: robloxUser.id,
				},
				update: {
					defaultRobloxAccount: robloxUser.id,
					robloxAccounts: {
						push: robloxUser.id,
					},
				},
				where: {
					id: message.author.id,
				},
			});
			return message.util?.reply(
				`Successfully transferred link **${robloxUser.name}** (**${robloxUser.id}**) => **${message.author.tag}** from another verification bot.`,
			);
		}

		let phrase = [WORDS[Math.floor(Math.random() * WORDS.length)]];

		for (let w = 0; w < 20; w++) {
			phrase.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
		}

		// remove duplicates from words
		phrase = [...new Set(phrase)];

		const doneButton = new MessageButton()
			.setCustomId('doneButton')
			.setLabel('Done')
			.setStyle('PRIMARY');

		const cancelButton = new MessageButton()
			.setCustomId('cancelButton')
			.setLabel('Cancel')
			.setStyle('SECONDARY');

		const promptActionRow = new MessageActionRow().addComponents(
			doneButton,
			cancelButton,
		);

		const verificationEmbed = new MessageEmbed()
			.setColor('BLURPLE')
			.setTitle('Verify')
			.setDescription(
				`To link **${
					robloxUser.name
				}** to your Discord account, please add the following phrase in your account description or bio:\`\`\`\n${phrase.join(
					' ',
				)}\`\`\`\nThen select **done** when done.`,
			)
			.setFooter('This prompt will expire in 300 seconds.');

		const promptMessage = await message.util?.reply({
			embeds: [verificationEmbed],
			components: [promptActionRow],
		});

		const result = await promptMessage
			?.awaitMessageComponent({
				filter: (interaction) => interaction.user.id === message.author.id,
				time: 300000,
			})
			.catch(() => undefined);

		promptMessage?.delete();

		if (result && result.customId === 'cancelButton') {
			result?.reply({ content: 'Cancelled.', ephemeral: true });
			return false;
		}

		const userInfo = await Promise.all([
			bloxyClient.apis.usersAPI
				.getUserById({
					userId: robloxUser.id,
				})
				.then((res) => res.description),
			robloxUser.getStatus(),
		]);

		if (userInfo.includes(phrase.join(' '))) {
			await this.client.prisma.user.upsert({
				create: {
					id: message.author.id,
					robloxAccounts: robloxUser.id,
					defaultRobloxAccount: robloxUser.id,
				},
				update: {
					defaultRobloxAccount: robloxUser.id,
					robloxAccounts: {
						push: robloxUser.id,
					},
				},
				where: {
					id: message.author.id,
				},
			});

			return message.util?.reply(
				`Successfully linked **${robloxUser.name}** (**${robloxUser.id}**) to **${message.author.tag}**.`,
			);
		}

		return new Error(
			`I could not find the specified phrase in the description or status of **${robloxUser.name}**. Please try again.`,
		);
	}
}

export default VerifyCommand;
