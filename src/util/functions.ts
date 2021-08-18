import { GuildMember, Message } from 'discord.js';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';
import { GroupPermission } from '../common/types';

const deletePrompts = async (message: Message): Promise<void> => {
	if (!message.util?.messages) return;

	const messagesToDelete = message.util.messages.filter(
		(msg) =>
			msg.author === message.client.user && msg.embeds?.[0]?.title === 'Prompt',
	);

	if (message.channel.type !== 'DM') {
		try {
			message.channel.bulkDelete(messagesToDelete);

			return;
		} catch (e) {
			console.debug(e);
		}
	}
	try {
		messagesToDelete.forEach((message) => {
			if (message.deletable) {
				message.delete();
			}
		});
	} catch (e) {
		console.debug(e);
	}
};

const memberHasPermission = async (
	member: GuildMember,
	permission: GroupPermission,
): Promise<boolean | void> => {
	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: member.guild.id,
		},
	});

	const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

	if (!group) return false;

	const guildMemberData = await client.prisma.guildMember.findUnique({
		where: {
			guildId_userId: {
				guildId: member.guild.id,
				userId: member.id,
			},
		},
	});

	if (!guildMemberData?.selectedAccount) return false;

	const groupMember = await group.getMember(
		Number(guildMemberData.selectedAccount),
	);

	if (!groupMember || !groupMember.role || !groupMember.role.id) return false;

	const memberMembership = await group.getRolePermissions(groupMember.role.id);

	if (!memberMembership.permissions) {
		return false;
	}

	const memberPermissions = {
		...memberMembership.permissions.groupEconomyPermissions,
		...memberMembership.permissions.groupManagementPermissions,
		...memberMembership.permissions.groupMembershipPermissions,
		...memberMembership.permissions.groupPostsPermissions,
	};

	return memberPermissions[permission];
};

/**
 * `t` ☞ `16:20`
 *
 * `T` ☞ `16:20:30`
 *
 * `d` ☞ `20/04/2021` or `04/20/2021`
 *
 * `D` ☞ `20 April 2021` or `April 20, 2021`
 *
 * `f` ☞ `20 April 2021 16:20` or `April 20, 2021 4:20 PM` — This is the default
 *
 * `F` ☞ `Tuesday, 20 April 2021 16:20` or `Tuesday, April 20, 2021 4:20 PM`
 *
 * `R` ☞ `Two months ago`
 */

const getDiscordTimestamp = (
	date: Date,
	style?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R',
): string =>
	`<t:${Math.round(date.getTime() / 1000)}${style ? `:${style}` : ''}>`;

export { deletePrompts, memberHasPermission, getDiscordTimestamp };
