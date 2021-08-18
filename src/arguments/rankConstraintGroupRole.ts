import type { ArgumentTypeCaster } from 'discord-akairo';
import FuzzySearch from 'fuzzy-search';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';

const rankConstraintGroupRoleTypeCaster: ArgumentTypeCaster = async (
	message,
	phrase,
) => {
	const guildMemberData = await client.prisma.guildMember.findUnique({
		where: {
			guildId_userId: {
				guildId: message.guild!.id,
				userId: message.author.id,
			},
		},
	});

	if (!guildMemberData?.selectedAccount) return;

	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: message.guild!.id,
		},
	});

	const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

	if (!group) return;

	const selfMembership = await group.getSelfMembership();

	const groupMember = await group
		.getMember(Number(guildMemberData.selectedAccount))
		.catch(() => undefined);

	if (!groupMember?.role?.rank) return;

	const groupRank = groupMember.role.rank;

	const groupRoles = (await group.getRoles()).filter(
		(role) =>
			role.rank &&
			role.rank < selfMembership.userRole.role.rank &&
			role.rank < groupRank,
	);

	const searcher = new FuzzySearch(groupRoles, ['rank', 'name'], {
		sort: true,
	});

	return searcher.search(phrase)[0];
};

export default rankConstraintGroupRoleTypeCaster;
