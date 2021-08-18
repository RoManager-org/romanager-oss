import { Command } from 'discord-akairo';
import { Message, MessageActionRow, MessageSelectMenu } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';

class AccountSwitchCommand extends Command {
	constructor() {
		super('switchAccount', {
			aliases: ['switch-account'],
			cooldown: 1000,
			ratelimit: 1,
			description: 'Switch your currently linked Roblox account.',
		});
	}

	async exec(message: Message): Promise<boolean | Error> {
		const userData = await this.client.prisma.user.findUnique({
			where: {
				id: message.author.id,
			},
		});

		if (!userData?.robloxAccounts || userData.robloxAccounts.length <= 1) {
			return new Error(
				'You do not have any accounts to switch to. Use the `verify` command to add an account.',
			);
		}

		const robloxAccounts = await Promise.all(
			userData.robloxAccounts.map(
				async (accountId) => await bloxyClient.getUser(Number(accountId)),
			),
		);

		const selectMenu = new MessageSelectMenu()
			.setMaxValues(1)
			.setCustomId('accountSwitcherSelect')
			.addOptions(
				robloxAccounts.map((account) => {
					return {
						label: account.name ?? '',
						value: String(account.id),
						description: String(account.id),
					};
				}),
			);

		const actionRow = new MessageActionRow().addComponents(selectMenu);

		const promptMessage = await message.author.send({
			content: 'What account would you like to switch to?',
			components: [actionRow],
		});

		if (!promptMessage) {
			return new Error('I was unable to DM you the account switcher prompt.');
		}

		const result = await promptMessage
			.awaitMessageComponent({
				filter: (interaction) => interaction.user.id === message.author.id,
				time: 300000,
			})
			.catch(() => undefined);

		if (!result?.isSelectMenu()) return false;

		promptMessage.delete();

		const account = robloxAccounts.find(
			(account) => account.id === Number(result.values?.[0]),
		);

		if (!account) return false;

		await this.client.prisma.user.update({
			where: {
				id: message.author.id,
			},
			data: {
				defaultRobloxAccount: account.id,
			},
		});

		if (message.guild) {
			await this.client.prisma.guildMember.upsert({
				where: {
					guildId_userId: {
						guildId: message.guild.id,
						userId: message.author.id,
					},
				},
				create: {
					guildId: message.guild.id,
					userId: message.author.id,
					selectedAccount: account.id,
				},
				update: {
					selectedAccount: account.id,
				},
			});
		}

		return true;
	}
}

export default AccountSwitchCommand;
