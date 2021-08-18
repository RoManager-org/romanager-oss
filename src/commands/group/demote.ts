import { GroupMember } from 'bloxy/dist/structures';
import { Argument } from 'discord-akairo';
import type { Message } from 'discord.js';
import GroupCommand from '../../structures/GroupCommand';

class DemoteCommand extends GroupCommand {
	constructor() {
		super('demote', {
			aliases: ['demote'],
			description: 'Demote a member in the currently linked group.',
			groupPermission: 'changeRank',
			channel: 'guild',
			args: [
				{
					id: 'groupMember',
					type: Argument.union('groupMember', 'verifiedGroupMember'),
					prompt: {
						start: 'What member would you like to demote?',
						retry:
							'Please enter a valid group member **name**, **id**, or **url**.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ groupMember }: { groupMember: GroupMember },
	): Promise<boolean | void> {
		const command = this.category.get('role');
		const rank = groupMember.role?.rank;
		if (!rank) return false;

		const groupRoles = await groupMember.group.getRoles();

		const role =
			groupRoles[groupRoles.findIndex((role) => role.rank === rank) - 1];

		if (!role || !role.rank) return false;

		return this.handler.runCommand(message, command!, {
			groupMember: groupMember,
			groupRole: role,
		});
	}
}

export default DemoteCommand;
