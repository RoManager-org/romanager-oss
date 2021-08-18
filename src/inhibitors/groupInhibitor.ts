import type { Command } from 'discord-akairo';
import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import { bloxyClient } from '../clients/bloxyClient';
import { FRIENDLY_PERMISSION_NAMES } from '../common/constants';
import GroupCommand from '../structures/GroupCommand';

class GroupInhibitor extends Inhibitor {
	constructor() {
		super('group', {
			reason: 'group',
			priority: 2,
		});
	}

	async exec(
		message: Message,
		command: GroupCommand | Command,
	): Promise<boolean> {
		if (!(command instanceof GroupCommand)) return false;
		if (!command.groupPermission && !command.groupOwnerOnly) return false;
		if (!message.guild) return true;

		const errorEmbed = this.client.util
			.embed()
			.setColor('RED')
			.setTitle('Blocked');

		const [guildData, guildMemberData] = await this.client.prisma.$transaction([
			this.client.prisma.guild.findUnique({
				where: {
					id: message.guild.id,
				},
			}),
			this.client.prisma.guildMember.findUnique({
				where: {
					guildId_userId: {
						guildId: message.guild.id,
						userId: message.author.id,
					},
				},
			}),
		]);

		if (!guildData || !guildMemberData || !guildMemberData.selectedAccount) {
			return true;
		}

		if (!guildData.linkedGroup) {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription(
						`You must have a linked group to run the **${command.aliases[0]}** command. Run the \`setup\` command and try again.`,
					),
				],
			});
			return true;
		}

		const group = await bloxyClient.getGroup(Number(guildData.linkedGroup));

		const selfMembership = await group.getSelfMembership();

		const selfPermissions = {
			...selfMembership.permissions.groupEconomyPermissions,
			...selfMembership.permissions.groupManagementPermissions,
			...selfMembership.permissions.groupMembershipPermissions,
			...selfMembership.permissions.groupPostsPermissions,
		};

		if (selfMembership.userRole.role.rank === 0) {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription(
						`I am not in the linked group (**${group.name}**). Please re-run the \`setup\` command and try again.`,
					),
				],
			});

			await this.client.prisma.guild.update({
				where: {
					id: message.guild.id,
				},
				data: {
					linkedGroup: null,
				},
			});

			return true;
		}

		if (command.groupPermission) {
			if (!selfPermissions[command.groupPermission]) {
				message.util?.reply({
					embeds: [
						errorEmbed.setDescription(
							`Missing permissions. Please grant **${
								bloxyClient.user?.name
							}** (**${bloxyClient.user?.id}**) the **${
								FRIENDLY_PERMISSION_NAMES[command.groupPermission]
							}** permission and try again.`,
						),
					],
				});
				return true;
			}
		}

		if (!selfPermissions.changeRank) {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription(
						`Missing permissions. Please grant **${bloxyClient.user?.name}** (**${bloxyClient.user?.id}**) the **${FRIENDLY_PERMISSION_NAMES.changeRank}** permission and try again.`,
					),
				],
			});
			return true;
		}

		const permissionOverrides =
			await this.client.prisma.permissionOverride.findMany({
				where: {
					command: command.id,
					guildId: message.guild.id,
				},
			});

		for (const override of permissionOverrides.filter(
			(override) => override.action === 'ALLOW',
		)) {
			if (message.member?.roles.cache.has(override.id as `${bigint}`)) {
				return false;
			}
		}

		for (const override of permissionOverrides.filter(
			(override) => override.action === 'DENY',
		)) {
			if (message.member?.roles.cache.has(override.id as `${bigint}`)) {
				message.util?.reply({
					embeds: [
						errorEmbed.setDescription(
							`A permission override for <@&${override.id}> is preventing you from running this command.`,
						),
					],
				});
				return true;
			}
		}

		const member = await group.getMember(
			Number(guildMemberData.selectedAccount),
		);

		if (!member || !member.role || !member.role.id) return true;

		const memberMembership = await group.getRolePermissions(member.role.id);

		const memberPermissions = {
			...memberMembership.permissions.groupEconomyPermissions,
			...memberMembership.permissions.groupManagementPermissions,
			...memberMembership.permissions.groupMembershipPermissions,
			...memberMembership.permissions.groupPostsPermissions,
		};

		if (command.groupOwnerOnly) {
			if (memberMembership.role.rank !== 255) {
				message.util?.reply({
					embeds: [
						errorEmbed.setDescription(
							`You must be the owner of **${group.name}** (**${group.id}**) to run this command.`,
						),
					],
				});
				return true;
			}
		}

		if (command.groupPermission) {
			if (!memberPermissions[command.groupPermission]) {
				message.util?.reply({
					embeds: [
						errorEmbed.setDescription(
							`You (**${(await member.getUser()).name}**) need the **${
								FRIENDLY_PERMISSION_NAMES[command.groupPermission]
							}** permission to run this command.`,
						),
					],
				});
				return true;
			}
		}

		return false;
	}
}

export default GroupInhibitor;
