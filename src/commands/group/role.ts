import type { GroupMember, GroupRole } from 'bloxy/dist/structures';
import { Argument } from 'discord-akairo';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import GroupCommand from '../../structures/GroupCommand';

class RoleCommand extends GroupCommand {
	constructor() {
		super('role', {
			aliases: ['role', 'rank', 'setrole', 'setrank'],
			channel: 'guild',
			groupPermission: 'changeRank',
			args: [
				{
					id: 'groupMember',
					type: Argument.union('groupMember', 'verifiedGroupMember'),
					prompt: {
						start:
							'What user would you like to modify the role of? Please enter a valid group member **name**, **id**, or **url**.',
						retry:
							'Please enter a valid group member **name**, **id**, or **url**.',
					},
				},
				{
					id: 'groupRole',
					type: 'rankConstraintGroupRole',
					match: 'rest',
					prompt: {
						start:
							'What role would you like to assign? Please enter a valid role **name** or **rank**',
						retry:
							'Please enter a valid role **name** or **rank**, and make sure you have permission to assign the role.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{
			groupMember,
			groupRole,
		}: { groupMember: GroupMember; groupRole: GroupRole },
	): Promise<Message | Error | boolean | undefined> {
		if (!groupRole.id) return;
		const robloxUser = await groupMember.getUser();
		const group = groupMember.group;

		const selfMembership = await group.getSelfMembership();

		if (selfMembership.userRole.role.rank <= (groupMember.role?.rank ?? 0)) {
			return new Error(
				`My role must be above **${selfMembership.userRole.role.name}** to change the role of **${robloxUser.name}**.`,
			);
		}

		const authorGroupMember = await group.getMember(
			Number(
				(
					await this.client.prisma.guildMember.findUnique({
						where: {
							guildId_userId: {
								guildId: message.guild!.id,
								userId: message.author.id,
							},
						},
					})
				)?.selectedAccount,
			),
		);

		if ((authorGroupMember?.role?.rank ?? 0) <= (groupMember.role?.rank ?? 0)) {
			return new Error(
				`Your role must be above **${groupMember.role?.name}** to change the role of **${robloxUser.name}**.`,
			);
		}

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
					value: groupRole.name ?? 'undefined',
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
			content: "Are you sure you want to change this user's role?",
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
			await group.updateMember(robloxUser.id, groupRole.id);
		} catch (e) {
			return new Error(
				`An error occured while attempting to role **${robloxUser.name}**.`,
			);
		}

		return true;
	}
}

export default RoleCommand;
