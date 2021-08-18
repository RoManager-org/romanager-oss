import type { ArgumentTypeCaster } from 'discord-akairo';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';

const verifiedRobloxUserTypeCaster: ArgumentTypeCaster = async (
	message,
	phrase,
) => {
	if (!phrase) return;

	if (message.guild) {
		let guildMember;

		try {
			guildMember = client.util.resolveMember(
				phrase,
				message.guild.members.cache,
			);

			if (!guildMember) {
				guildMember = (
					await message.guild.members.fetch({
						query: phrase.replace('<@', '').replace('>', '').replace('!', ''),
					})
				).first();
			}
		} catch (e) {
			console.debug(e);
		}

		if (guildMember && !guildMember.user.bot) {
			const guildMemberData = await client.prisma.guildMember.findUnique({
				where: {
					guildId_userId: {
						guildId: message.guild.id,
						userId: guildMember.id,
					},
				},
			});

			if (guildMemberData?.selectedAccount) {
				return bloxyClient.getUser(Number(guildMemberData?.selectedAccount));
			}
		}
	}

	let user;

	try {
		user = client.util.resolveUser(phrase, client.users.cache);

		if (!user) {
			user = await client.users.fetch(
				phrase
					.replace('<@', '')
					.replace('>', '')
					.replace('!', '') as `${bigint}`,
			);
		}
	} catch (e) {
		console.debug(e);
	}
	if (!user || user.bot) return;

	const userData = await client.prisma.user.findUnique({
		where: { id: user.id },
	});

	const robloxId = Number(userData?.defaultRobloxAccount);

	if (!robloxId) return;

	return bloxyClient.getUser(robloxId);
};

export default verifiedRobloxUserTypeCaster;
