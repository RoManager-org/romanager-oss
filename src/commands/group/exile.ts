import type { GroupMember } from 'bloxy/dist/structures';
import { Argument } from 'discord-akairo';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import GroupCommand from '../../structures/GroupCommand';

class ExileCommand extends GroupCommand {
	constructor() {
		super('exile', {
			aliases: ['exile'],
			channel: 'guild',
			groupPermission: 'removeMembers',
			args: [
				{
					id: 'groupMember',
					type: Argument.union('groupMember', 'verifiedGroupMember'),
					prompt: {
						start:
							'What user would you like to exile? Please enter a valid group member **name**, **id**, or **url**.',
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
	): Promise<Message | Error | boolean | undefined> {
		const robloxUser = await groupMember.getUser();
		const group = groupMember.group;

		const embed = new MessageEmbed({
			title: robloxUser.name ?? undefined,
			url: `https://roblox.com/users/${robloxUser.id}`,
			color: 'BLURPLE',
			fields: [
				{
					name: 'Current role',
					value: groupMember.role?.name ?? 'undefined',
					inline: true,
				},
				{
					name: 'New role',
					value: 'Guest',
					inline: true,
				},
			],
			thumbnail: {
				url:
					'https://www.roblox.com/Thumbs/Avatar.ashx?x=200&y=200&Format=Png&username=' +
					robloxUser.name,
			},
		});

		const yesButton = new MessageButton()
			.setCustomId('confirmButton')
			.setLabel('Confirm')
			.setStyle('PRIMARY');

		const noButton = new MessageButton()
			.setCustomId('cancelButton')
			.setLabel('Cancel')
			.setStyle('SECONDARY');

		const actionRow = new MessageActionRow().addComponents(yesButton, noButton);

		const promptMessage = await message.reply({
			content: 'Are you sure you want to exile this user?',
			embeds: [embed],
			components: [actionRow],
		});

		const result = await promptMessage
			.awaitMessageComponent({
				filter: (interaction) => interaction.user.id === message.author.id,
				time: 300000,
			})
			.catch(() => undefined);

		promptMessage.delete();

		if (!result || result.customId === 'cancelButton') {
			result?.reply({ content: 'Cancelled.', ephemeral: true });
			return false;
		}

		try {
			await group.kickMember(robloxUser.id);
		} catch (e) {
			return new Error(
				`An error occured while attempting to exile **${robloxUser.name}**.`,
			);
		}

		return true;
	}
}

export default ExileCommand;
