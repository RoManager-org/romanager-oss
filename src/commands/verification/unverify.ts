import type { User } from 'bloxy/dist/structures';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import got from 'got';
import {
	BLOXLINK_API_URL,
	ROVER_API_URL,
	ROWIFI_API_URL,
} from '../../common/constants';
import type {
	IBloxlinkResponse,
	IRoVerResponse,
	IRoWifiResponse,
} from '../../common/types.d';

class VerifyCommand extends Command {
	constructor() {
		super('unverify', {
			aliases: ['unverify', 'remove-account'],
			cooldown: 5000,
			ratelimit: 1,
			typing: true,
			description: 'Remove a linked Roblox account from your Discord account.',
			args: [
				{
					id: 'robloxUser',
					type: 'robloxUser',
					match: 'rest',
					prompt: {
						start:
							'What account would you like to unverify? Please enter a Roblox account **username**, **id**, or **url**.',
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

		if (
			userData?.robloxAccounts
				.map((id: BigInt) => Number(id))
				.includes(robloxUser.id)
		) {
			await this.client.prisma.guildMember.updateMany({
				where: {
					userId: message.author.id,
					selectedAccount: robloxUser.id,
				},
				data: {
					selectedAccount: null,
				},
			});

			const userData = await this.client.prisma.user.findUnique({
				where: {
					id: message.author.id,
				},
			});

			await this.client.prisma.user.update({
				where: {
					id: message.author.id,
				},
				data: {
					defaultRobloxAccount:
						Number(userData?.defaultRobloxAccount) === robloxUser.id
							? userData?.robloxAccounts.filter(
									(accountId) => Number(accountId) !== robloxUser.id,
							  )[0] ?? null
							: null,

					robloxAccounts: userData?.robloxAccounts.filter(
						(accountId) => Number(accountId) !== robloxUser.id,
					),
				},
			});

			return message.util?.reply(
				`Successfully unverified **${robloxUser.name}** (**${
					robloxUser.id
				}**).${
					robloxIds?.includes(robloxUser.id)
						? '\n\n**NOTE:** This does not unverify you from any other verification bots.'
						: ''
				}`,
			);
		}

		return new Error(
			`Could not unverify **${robloxUser.name}** (**${robloxUser.id}**) as it is not one of your verified accounts.`,
		);
	}
}

export default VerifyCommand;
