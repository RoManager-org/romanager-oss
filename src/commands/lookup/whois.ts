import type { User } from 'bloxy/dist/structures';
import { Argument, Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import got from 'got';
import { bloxyClient } from '../../clients/bloxyClient';
import { IPresence, IUserGames } from '../../common/types';
import { getDiscordTimestamp } from '../../util/functions';

class WhoisCommand extends Command {
	constructor() {
		super('whois', {
			aliases: ['whois'],
			typing: true,
			description: 'Looks up a Roblox group',
			args: [
				{
					id: 'robloxUser',
					type: Argument.union('robloxUser', 'verifiedRobloxUser'),
					match: 'rest',
					prompt: {
						start:
							'What user would you like to look up? Please enter a Roblox account **username**, **id**, or **url**, or @mention a verified user.',
						retry:
							'That user does not exist or could not be found. If you @mentioned someone, make sure they are verified with RoManager.\n\nPlease enter a Roblox account **username**, **id**, or **url**, or @mention a **verified** user.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ robloxUser }: { robloxUser: User },
	): Promise<Message | undefined> {
		if (!robloxUser.name) return;

		const [apiUserData, presence, userGameData] = await Promise.all([
			bloxyClient.apis.usersAPI
				.getUserById({
					userId: robloxUser.id,
				})
				.catch(() => undefined),
			got<IPresence>(
				`https://api.roblox.com/users/${robloxUser.id}/onlinestatus`,
				{
					resolveBodyOnly: true,
					responseType: 'json',
				},
			),
			got<IUserGames>(
				`https://games.roblox.com/v2/users/${robloxUser.id}/games?accessFilter=Public&limit=50`,
				{ resolveBodyOnly: true, responseType: 'json' },
			),
		]);

		const { description, created, isBanned } = apiUserData ?? {
			description: 'Unable to get description.',
			created: 'Unable to get created date',
			isBanned: false,
		};

		const embed = this.client.util.embed();

		embed.setDescription(description);

		if (robloxUser.status) {
			embed.addField('Status', robloxUser.status);
		}

		let groupMember;

		try {
			if (message.guild) {
				const guildData = await this.client.prisma.guild.findUnique({
					where: {
						id: message.guild.id,
					},
				});

				if (guildData?.linkedGroup) {
					const group = await bloxyClient.getGroup(
						Number(guildData.linkedGroup),
					);
					groupMember = await group.getMember(robloxUser.id);
				}
			}
		} catch (e) {
			console.debug(e);
		}

		if (groupMember) {
			embed.addField('Group Role', groupMember.role?.name ?? 'undefined', true);
		}

		embed
			.setColor('BLURPLE')
			.setTitle(`${isBanned ? `~~${robloxUser.name}~~` : robloxUser.name}`)
			.addFields(
				{
					name: 'Friends',
					value: robloxUser.friendsCount.toString(),
					inline: true,
				},
				{
					name: 'Followers',
					value: robloxUser.followersCount.toString(),
					inline: true,
				},
				{
					name: 'Following',
					value: robloxUser.followingCount.toString(),
					inline: true,
				},
				{ name: 'ID', value: robloxUser.id.toString(), inline: true },
				{
					name: 'Created',
					value: `${
						Date.parse(created)
							? getDiscordTimestamp(new Date(created))
							: 'Error'
					} (${
						Date.parse(created)
							? getDiscordTimestamp(new Date(created), 'R')
							: 'Error'
					})`,
					inline: true,
				},
				{
					name: 'Place visits',
					value:
						userGameData.data
							?.map((game) => game.placeVisits)
							.reduce((a, b) => a + b)
							.toString() ?? '0',
					inline: true,
				},
				{
					name: 'Last seen',
					value: presence?.LastOnline
						? getDiscordTimestamp(new Date(presence.LastOnline), 'R')
						: 'Never',
					inline: true,
				},
			)
			.setURL(`https://www.roblox.com/users/${robloxUser.id}/profile`)
			.setThumbnail(
				`http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${encodeURIComponent(
					robloxUser.name,
				)}`,
			);

		return message.util?.reply({ embeds: [embed] });
	}
}

export default WhoisCommand;
