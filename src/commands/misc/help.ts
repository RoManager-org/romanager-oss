import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			description: 'View a list of commands and help information.',
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					match: 'rest',
				},
			],
		});
	}

	async exec(
		message: Message,
		{ command }: { command: Command },
	): Promise<Message | void> {
		// just to silence the error due to the union type
		if (typeof this.handler.prefix !== 'function') return;
		const prefix = await this.handler.prefix(message);

		if (command) {
			const embed = this.client.util
				.embed()
				.setTitle(command.aliases[0] ?? command.id)
				.setColor('BLURPLE')
				.setDescription(command.description ?? '_No description provided._');

			const aliases = command.aliases
				.slice(1)
				.map((alias) => '`' + alias + '`')
				.join(' ');

			if (aliases !== '') {
				embed.addField('Aliases', aliases, true);
			}

			return message.util?.reply({ embeds: [embed] });
		}
		const embed = this.client.util
			.embed()
			.setColor('BLURPLE')
			.setTitle('Commands')
			.setDescription(
				`The current prefix is \`${prefix}\`.\n\nTo get started with ${this.client.user?.username}, use the \`${prefix}setup\` command.\n\nFor more information about a command, run \`${prefix}help <command>\`.\n**Example:** \`${prefix}help role\``,
			);

		this.handler.categories.forEach((category) => {
			const friendlyTitle = {
				group: 'Group',
				guild: 'Guild',
				lookup: 'Lookup',
				misc: 'Misc',
				settings: 'Settings',
				verification: 'Verification',
			}[category.id];

			if (friendlyTitle) {
				embed.addField(
					friendlyTitle,
					category.map((cmd) => '`' + cmd.aliases[0] + '`').join(' '),
				);
			}
		});

		try {
			return await message.util?.reply({ embeds: [embed] });
		} catch (e) {
			return message.author.send({ embeds: [embed] }).catch(() => undefined);
		}
	}
}

export default HelpCommand;
