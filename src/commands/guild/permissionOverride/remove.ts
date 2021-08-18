import { Command } from 'discord-akairo';
import type { Message, Role } from 'discord.js';

class PermissionsRemoveCommand extends Command {
	constructor() {
		super('permissionOverride-remove', {
			channel: 'guild',
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'What command would you like to remove the overrides for?',
					},
				},
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: 'What role would you like to remove the overrides for?',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ role, command }: { role: Role; command: Command },
	): Promise<Message | Error | void> {
		const overrides = await this.client.prisma.permissionOverride.findMany({
			where: {
				guildId: message.guild!.id,
			},
		});

		if (!overrides || overrides.length === 0) {
			return new Error(
				'No group command permission overrides to remove. Add one using the `permission-override add` command.',
			);
		}

		await this.client.prisma.permissionOverride.deleteMany({
			where: {
				guildId: message.guild!.id,
				command: command.id,
				id: role.id,
			},
		});

		return message.util?.reply(
			`Cleared **${command.aliases[0]}** command overrides for **${role.name}**.`,
		);
	}
}

export default PermissionsRemoveCommand;
