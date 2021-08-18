import { Message } from 'discord.js';
import FuzzySearch from 'fuzzy-search';
import { bloxyClient } from '../../../clients/bloxyClient';
import GroupCommand from '../../../structures/GroupCommand';

class JoinRequestAcceptCommand extends GroupCommand {
	constructor() {
		super('joinRequest-accept', {
			channel: 'guild',
			groupPermission: 'inviteMembers',
			args: [
				{
					id: 'userInput',
					match: 'rest',
					prompt: {
						start:
							"Which user's join request would you like to accept? Please provide a user **name**, **id**, or **url**.",
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ userInput }: { userInput: string },
	): Promise<boolean | Error | void> {
		const guildData = await this.client.prisma.guild.findUnique({
			where: {
				id: message.guild!.id,
			},
		});

		if (!guildData?.linkedGroup) return;

		const joinRequests = await bloxyClient.apis.groupsAPI.getJoinRequests({
			groupId: Number(guildData.linkedGroup),
			limit: 100,
		});

		if (!joinRequests.data) return;

		if (userInput === 'all') {
			await bloxyClient.apis.groupsAPI.acceptJoinRequests({
				groupId: Number(guildData.linkedGroup),
				userIds: joinRequests.data.map((request) => request.requester.userId),
			});

			return true;
		}

		const searcher = new FuzzySearch(
			joinRequests.data,
			['requester.username', 'requester.userId'],
			{
				sort: true,
			},
		);

		const res = searcher.search(userInput);

		if (!res[0]) {
			return new Error(
				`Could not find a join request matching \`${userInput}\`.`,
			);
		}

		await bloxyClient.apis.groupsAPI.acceptJoinRequest({
			groupId: Number(guildData.linkedGroup),
			userId: res[0].requester.userId,
		});

		return true;
	}
}

export default JoinRequestAcceptCommand;
