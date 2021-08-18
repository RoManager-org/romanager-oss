import type { Group } from 'bloxy/dist/structures';
import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { bloxyClient } from '../../clients/bloxyClient';

class GroupCommand extends Command {
	constructor() {
		super('group', {
			aliases: ['group', 'lookup-group'],
			typing: true,
			description: 'Looks up a Roblox group.',
			args: [
				{
					id: 'robloxGroup',
					type: 'robloxGroup',
					match: 'rest',
					prompt: {
						start:
							'What group would you like to look up? Please enter a Roblox group **name**, **id**, or **url**.',
						retry:
							'That group does not exist or could not be found. Please enter a Roblox group **name**, **id**, or **url**.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ robloxGroup }: { robloxGroup: Group },
	): Promise<Message | undefined> {
		const embed = this.client.util
			.embed()
			.setColor('BLURPLE')
			.setTitle(robloxGroup.name)
			.setURL(`https://roblox.com/groups/${robloxGroup.id}`)
			.addField('ID', robloxGroup.id.toString())
			.addField('Members', robloxGroup.memberCount.toString(), true)

			.addField(
				'Owner',
				`${
					robloxGroup.owner
						? `[${robloxGroup.owner.name}](https://roblox.com/users/${robloxGroup.owner.id}/profile)`
						: 'No One!'
				}`,
				true,
			)
			.setDescription(
				robloxGroup.description && robloxGroup.description.length > 300
					? robloxGroup.description.substr(0, 300) + '...'
					: robloxGroup.description,
			)
			.setThumbnail(
				(
					await bloxyClient.apis.thumbnailsAPI.getGroupsIcons({
						format: 'png',
						groupIds: [robloxGroup.id],
						size: '420x420',
					})
				).data?.[0]?.imageUrl ?? '',
			);

		if (robloxGroup.shout?.content) {
			embed.addField(
				'Shout',
				`*${(await robloxGroup.shout.creator.getUser()).name}:*\`\`\`${
					robloxGroup.shout.content
				}\`\`\``,
			);
		}
		embed.addField(
			'Roles',
			(await robloxGroup.getRoles())
				.reverse()
				.map((role) => {
					if (!role.rank) return;
					return `\`${role.rank}\` **${role.name}**`;
				})
				.filter((roleFormatted) => roleFormatted !== undefined)
				.join('\n'),
		);

		return message.util?.reply({ embeds: [embed] });
	}
}

export default GroupCommand;
