import type { Command } from 'discord-akairo';
import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import GroupCommand from '../structures/GroupCommand';

class VerificationInhibitor extends Inhibitor {
	constructor() {
		super('verification', {
			reason: 'verification',
		});
	}

	async exec(
		message: Message,
		command: GroupCommand | Command,
	): Promise<boolean> {
		if (!(command instanceof GroupCommand)) return false;
		if (!message.guild) return true;

		const errorEmbed = this.client.util
			.embed()
			.setColor('RED')
			.setTitle('Blocked');

		const userData = await this.client.prisma.user.findUnique({
			where: {
				id: message.author.id,
			},
			include: {
				guildMemberships: {
					where: {
						guildId: message.guild.id,
						userId: message.author.id,
					},
				},
			},
		});

		if (!userData || !userData.robloxAccounts[0]) {
			message.util?.reply({
				embeds: [
					errorEmbed.setDescription(
						`You must link your Roblox account to your Discord account in order to use the **${command.aliases[0]}** command. Run the \`verify\` command and try again.`,
					),
				],
			});
			return true;
		}

		const guildMemberData = userData.guildMemberships[0];

		if (!userData.defaultRobloxAccount) {
			await this.client.prisma.user.update({
				where: {
					id: message.author.id,
				},
				data: {
					defaultRobloxAccount: userData.robloxAccounts[0],
				},
			});
		}

		if (!guildMemberData) {
			await this.client.prisma.guildMember.create({
				data: {
					guildId: message.guild.id,
					userId: message.author.id,
					selectedAccount: userData.robloxAccounts[0],
				},
			});
		}

		if (!guildMemberData?.selectedAccount) {
			await this.client.prisma.guildMember.update({
				where: {
					guildId_userId: {
						guildId: message.guild.id,
						userId: message.author.id,
					},
				},
				data: {
					selectedAccount:
						userData.defaultRobloxAccount ?? userData.robloxAccounts[0],
				},
			});
		}

		return false;
	}
}

export default VerificationInhibitor;
