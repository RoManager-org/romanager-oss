/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: write typings for devforum responses

import { User } from 'bloxy/dist/structures';
import { Argument, Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import got from 'got';
import { getDiscordTimestamp } from '../../util/functions';

class DevForumCommand extends Command {
	constructor() {
		super('devforum', {
			aliases: ['devforum'],
			description: "View a user's DevForum profile.",
			cooldown: 1000,
			ratelimit: 1,
			args: [
				{
					id: 'robloxUser',
					match: 'rest',
					type: Argument.union('robloxUser', 'verifiedRobloxUser'),
					prompt: {
						start: 'What user would you like to search for?',
						retry:
							'Invalid user. Please provide a user **name**, **id**, or **url**.',
					},
				},
			],
		});
	}

	async exec(
		message: Message,
		{ robloxUser }: { robloxUser: User },
	): Promise<Message | Error | void> {
		let devforumSummaryRequest;
		let devforumUserRequest;
		let devforumBadgesRequest;

		try {
			devforumSummaryRequest = await got(
				`https://devforum.roblox.com/u/${robloxUser.name}/summary.json`,
				{ responseType: 'json' },
			);
			devforumUserRequest = await got(
				`https://devforum.roblox.com/u/${robloxUser.name}.json`,
				{ responseType: 'json' },
			);

			devforumBadgesRequest = await got(
				`https://devforum.roblox.com/user-badges/${robloxUser.name}.json?grouped=true`,
				{ responseType: 'json' },
			);
		} catch (e) {
			if (e.response.statusCode === 404) {
				return new Error(
					`I could not find \`${robloxUser.name}\` on the Developer Forum.`,
				);
			} else {
				return new Error(
					`An error ocurred while trying to find \`${robloxUser.name}\`.`,
				);
			}
		}
		const userInfo = devforumUserRequest.body?.user;
		const userSummary = devforumSummaryRequest.body?.user_summary;
		const badges = devforumBadgesRequest.body?.badges;

		if (!userSummary || !userInfo) {
			return new Error(
				`An error occured while fetching the DevForum profile of \`${robloxUser.name}\`.`,
			);
		}

		const badgesView = badges
			?.map(
				(badge) =>
					`[${badge.name}](https://devforum.roblox.com/badges/${badge.id}/-)`,
			)
			.join(', ');

		const embed = this.client.util
			.embed()
			.setTitle(userInfo.username)
			.setAuthor(
				'Roblox Developer Forum',
				'https://i.jaydensar.net/studio_icon.png',
			)
			.setColor('BLURPLE')
			.setThumbnail(
				'https://doy2mn9upadnk.cloudfront.net/' +
					userInfo.avatar_template.replace('{size}', '120'),
			)
			.setURL(`https://devforum.roblox.com/u/${robloxUser.name}/summary`)
			.setDescription(userInfo.bio_raw || '')
			.addField(
				'🔰 Created',
				getDiscordTimestamp(new Date(userInfo.created_on)),
				true,
			)
			.addField('👀 Last Seen', new Date(userInfo.last_seen_at), true)
			.addField(
				'📨 Last Posted',
				userInfo.last_posted_at
					? getDiscordTimestamp(new Date(userInfo.last_posted_at), 'R')
					: 'Never',
				true,
			)
			.addField('📮 Topics', String(userSummary.topic_count ?? 0), true)
			.addField('📩 Posts', String(userSummary.post_count ?? 0), true)
			.addField(
				'🗂️ Groups',
				userInfo.groups
					?.map(
						(group) =>
							`[${group.title}](https://devforum.roblox.com/g/${group.name})`,
					)
					.join(', ') || 'None',
				true,
			)
			.addField('❤️ Likes given', String(userSummary.likes_given ?? 0), true)
			.addField(
				'💗 Likes received',
				String(userSummary.likes_received ?? 0),
				true,
			)
			.addField(
				'🗒️ Posts read',
				String(userSummary.posts_read_count ?? 0),
				true,
			)
			.addField('✅ Posts solved', String(userSummary.solved_count ?? 0), true)
			.addField('🗓️ Days visited', String(userSummary.days_visited ?? 0), true)
			.addField(
				'⭐ Badges',
				badgesView?.length <= 1024
					? badgesView
					: badges?.map((badge) => `${badge.name}`).join(', ') || 'None',
				true,
			);

		return message.util?.reply({ embeds: [embed] });
	}
}

export default DevForumCommand;
