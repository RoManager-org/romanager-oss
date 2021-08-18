import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';
import { SUPPORT_SERVER_LINK } from '../../common/constants';

class AboutCommand extends Command {
	constructor() {
		super('about', {
			aliases: ['about'],
			description: 'Miscellaneous bot information.',
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const embed = this.client.util
			.embed()
			.setTitle('RoManager (open-source)')
			.setColor('BLURPLE')
			.setDescription(
				`Created by [**${
					this.client.users.cache.get('307679776728940555')?.username ??
					'jayden'
				}**#${
					this.client.users.cache.get('307679776728940555')?.discriminator ??
					'3568'
				}](https://jaydenn.dev).`,
			)
			.addField(
				'Guilds',
				[...this.client.guilds.cache.values()].length.toString(),
				true,
			)
			.addField(
				'Bot Account',
				`[${bloxyClient.user?.name}](https://roblox.com/users/${bloxyClient.user?.id})`,
			)
			.addField(
				'Links',
				`[Support Server](${SUPPORT_SERVER_LINK})\n[Roblox Group](https://roblox.com/groups/9518878)\n[Add the public version of RoManager](https://discord.com/oauth2/authorize?client_id=738035113815834746&permissions=8&scope=bot%20applications.commands)\n[Source](https://github.com/RoManager-org/romanager-oss)\n[License](https://github.com/RoManager-org/romanager-oss/blob/main/LICENSE)`,
			);

		return message.util?.reply({ embeds: [embed] });
	}
}

export default AboutCommand;
