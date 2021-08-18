import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
import { FRIENDLY_PERMISSION_NAMES } from '../../../common/constants';
import GroupCommand from '../../../structures/GroupCommand';
import { memberHasPermission } from '../../../util/functions';

class PermissionsAddCommand extends GroupCommand {
	constructor() {
		super('permissionOverride-add', {
			channel: 'guild',
			args: [
				{
					id: 'option',
					type: ['allow', 'deny'],
					prompt: {
						start: 'Allow or deny usage of the command? (allow/deny)',
						retry: 'Must be `allow` or `deny`.',
					},
				},
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'What command would you like to add an override for?',
						retry: 'Please provide a **command** name.',
					},
				},
				{
					id: 'role',
					type: 'role',
					limit: 0,
					prompt: {
						start: 'What role would you like to override?',
						retry: 'Please provide a **role**.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{
			role,
			command,
			option,
		}: {
			role: Role;
			command: Command | GroupCommand;
			option: 'allow' | 'deny';
		},
	): Promise<Message | Error | void> {
		if (!message.guild || !message.member) return;

		if (
			!('groupPermission' in command) ||
			command.groupPermission === undefined
		) {
			return new Error(
				`**${command.aliases[0]}** cannot be overridden. Only commands that require a group permission can be overridden.`,
			);
		}

		if (!(await memberHasPermission(message.member, command.groupPermission))) {
			return new Error(
				`You must have the **${
					FRIENDLY_PERMISSION_NAMES[command.groupPermission]
				}** permission to override the **${command.aliases[0]}** command.`,
			);
		}

		const existingOverride =
			await this.client.prisma.permissionOverride.findUnique({
				where: {
					id_type_command: {
						id: role.id,
						type: 'ROLE',
						command: command.id,
					},
				},
			});

		if (existingOverride) {
			return new Error(
				`An **${option}** override already exists for <@&${role.id}>.`,
			);
		}

		await this.client.prisma.permissionOverride.create({
			data: {
				guildId: message.guild.id,
				id: role.id,
				type: 'ROLE',
				action: option === 'allow' ? 'ALLOW' : 'DENY',
				command: command.id,
			},
		});

		return message.util?.reply(
			`Added **${command.aliases[0]}** command override for **${role.name}** (**${option}**)`,
		);
	}
}

export default PermissionsAddCommand;
