import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';

class AccountListCommand extends Command {
	constructor() {
		super('listAccounts', {
			aliases: [
				'list-accounts',
				'list-account',
				'view-accounts',
				'view-account',
			],
			cooldown: 1000,
			ratelimit: 1,
			description: 'View your currently linked Roblox accounts.',
		});
	}

	async exec(message: Message): Promise<Message | boolean | Error> {
		const userData = await this.client.prisma.user.findUnique({
			where: {
				id: message.author.id,
			},
		});

		if (!userData || userData.robloxAccounts.length === 0) {
			return message.author.send('You do not have any linked accounts.');
		}

		const robloxAccounts = await Promise.all(
			userData.robloxAccounts.map(
				async (accountId) => await bloxyClient.getUser(Number(accountId)),
			),
		);

		return message.author.send({
			embeds: [
				this.client.util
					.embed()
					.setColor('BLURPLE')
					.setTitle('Linked Accounts')
					.setDescription(
						robloxAccounts
							.map(
								(account) =>
									`${
										account.id === Number(userData.defaultRobloxAccount)
											? '⭐ '
											: ''
									}**${account.name}** (**${account.id}**)${
										account.id === Number(userData.defaultRobloxAccount)
											? ' (**Primary**)'
											: ''
									}`,
							)
							.join('\n'),
					),
			],
		});
	}
}

export default AccountListCommand;
