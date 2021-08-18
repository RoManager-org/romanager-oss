import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class PermissionsViewCommand extends Command {
	constructor() {
		super('permissionOverride-view', {
			channel: 'guild',
		});
	}

	async exec(message: Message): Promise<Message | Error | void> {
		const permissionOverrides =
			await this.client.prisma.permissionOverride.findMany({
				where: {
					guildId: message.guild!.id,
				},
			});

		if (!permissionOverrides || permissionOverrides.length === 0) {
			return new Error(
				'No permission overrides. Use the `.permission-override` command to add a permission override.',
			);
		}

		let allowDesc;
		let denyDesc;

		if (permissionOverrides.find((override) => override.action === 'ALLOW')) {
			allowDesc = permissionOverrides
				.filter((override) => override.action === 'ALLOW')
				.map((override) => `**${override.command}**: <@&${override.id}>`)
				.join('\n');
		}

		if (permissionOverrides.find((override) => override.action === 'DENY')) {
			allowDesc = permissionOverrides
				.filter((override) => override.action === 'DENY')
				.map((override) => `**${override.command}**: <@&${override.id}>`)
				.join('\n');
		}

		const embed = this.client.util
			.embed()
			.setColor('BLURPLE')
			.setTitle('Group Permission Overrides')
			.setDescription(
				`**Allow**\n${
					allowDesc && allowDesc !== '' ? allowDesc : 'None'
				}\n**Deny**\n${denyDesc && denyDesc !== '' ? denyDesc : 'None'}`,
			);

		return message.util?.reply({ embeds: [embed] });
	}
}

export default PermissionsViewCommand;
