import { Message } from 'discord.js';
import { bloxyClient } from '../../../clients/bloxyClient';
import GroupCommand from '../../../structures/GroupCommand';
import { getDiscordTimestamp } from '../../../util/functions';

class JoinRequestViewCommand extends GroupCommand {
	constructor() {
		super('joinRequest-view', {
			channel: 'guild',
			groupPermission: 'inviteMembers',
		});
	}

	async exec(message: Message): Promise<Message | void> {
		const guildData = await this.client.prisma.guild.findUnique({
			where: {
				id: message.guild!.id,
			},
		});

		if (!guildData?.linkedGroup) return;

		const joinRequests = await bloxyClient.apis.groupsAPI.getJoinRequests({
			groupId: Number(guildData.linkedGroup),
		});

		const requestsText = joinRequests.data.map(
			(request) =>
				`**${request.requester.username}** (**${
					request.requester.userId
				}**) — ${getDiscordTimestamp(new Date(request.created), 'R')}`,
		);

		return message.util?.reply({
			embeds: [
				this.client.util
					.embed()
					.setTitle('Join Requests')
					.setColor('BLURPLE')
					.setDescription(
						requestsText.join('\n') == ''
							? 'No join requests.'
							: requestsText.join('\n'),
					),
			],
		});
	}
}

export default JoinRequestViewCommand;
