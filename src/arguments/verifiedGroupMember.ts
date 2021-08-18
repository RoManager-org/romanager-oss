import type { ArgumentTypeCaster } from 'discord-akairo';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';

const verifiedGroupMemberTypeCaster: ArgumentTypeCaster = async (
	message,
	phrase,
) => {
	let guildMember;

	try {
		guildMember = client.util.resolveMember(
			phrase,
			message.guild!.members.cache,
		);

		if (!guildMember) {
			guildMember = (
				await message.guild!.members.fetch({
					query: phrase.replace('<@', '').replace('>', '').replace('!', ''),
				})
			).first();
		}
	} catch (e) {
		console.debug(e);
	}

	if (!guildMember) return;

	const guildMemberData = await client.prisma.guildMember.findUnique({
		where: {
			guildId_userId: {
				guildId: message.guild!.id,
				userId: guildMember.id,
			},
		},
	});

	if (!guildMemberData?.selectedAccount) return;

	if (!guildMember || guildMember.user.bot) {
		return;
	}

	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: message.guild!.id,
		},
	});

	const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

	return group?.getMember(Number(guildMemberData.selectedAccount));
};

export default verifiedGroupMemberTypeCaster;
