import { Command, Flag } from 'discord-akairo';

class PermissionOverrideCommand extends Command {
	constructor() {
		super('permissionOverride', {
			aliases: ['permission-override', 'permission-overrides', 'po'],
			userPermissions: 'MANAGE_GUILD',
			channel: 'guild',
			description: 'Override group command permissions.',
		});
	}

	*args(): unknown {
		const method = yield {
			type: [
				['permissionOverride-add', 'add'],
				['permissionOverride-view', 'view', 'list', 'ls'],
				['permissionOverride-remove', 'remove', 'rm', 'delete', 'del'],
			],
			otherwise: {
				embeds: [
					this.client.util
						.embed()
						.setTitle('Please choose a sub-command')
						.setDescription(
							'`add` — add a group permission override\n`remove` — remove a group permission override\n`view` — view all group permission overrides',
						)
						.setColor('BLURPLE'),
				],
			},
		};

		return Flag.continue(method);
	}
}

export default PermissionOverrideCommand;
