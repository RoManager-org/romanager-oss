import { Message } from 'discord.js';
import FuzzySearch from 'fuzzy-search';
import { bloxyClient } from '../../../clients/bloxyClient';
import GroupCommand from '../../../structures/GroupCommand';

class JoinRequestDeclineCommand extends GroupCommand {
	constructor() {
		super('joinRequest-decline', {
			channel: 'guild',
			groupPermission: 'inviteMembers',
			args: [
				{
					id: 'userInput',
					match: 'rest',
					prompt: {
						start:
							"Which user's join request would you like to decline? Please provide a user **name**, **id**, or **url**.",
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
		});

		if (!joinRequests.data) return;

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

		await bloxyClient.apis.groupsAPI.declineJoinRequest({
			groupId: Number(guildData.linkedGroup),
			userId: res[0].requester.userId,
		});

		return true;
	}
}

export default JoinRequestDeclineCommand;
