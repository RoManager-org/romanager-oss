import { Flag } from 'discord-akairo';
import GroupCommand from '../../structures/GroupCommand';

class JoinRequestCommand extends GroupCommand {
	constructor() {
		super('joinRequest', {
			aliases: ['join-request', 'join-requests', 'jr'],
			description: 'Accept/decline join requests.',
			channel: 'guild',
			groupPermission: 'inviteMembers',
		});
	}

	*args(): unknown {
		const method = yield {
			type: [
				['joinRequest-accept', 'accept'],
				['joinRequest-decline', 'decline', 'deny'],
				['joinRequest-view', 'view', 'list', 'ls'],
			],
			otherwise: {
				embeds: [
					this.client.util
						.embed()
						.setTitle('Please choose a sub-command')
						.setDescription(
							"`accept` — accept a user's join request\n`decline` — decline a user's join request\n`view` — view all join requests",
						)
						.setColor('BLURPLE'),
				],
			},
		};

		return Flag.continue(method);
	}
}

export default JoinRequestCommand;
