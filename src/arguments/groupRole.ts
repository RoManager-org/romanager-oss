import type { ArgumentTypeCaster } from 'discord-akairo';
import FuzzySearch from 'fuzzy-search';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';

const groupRoleTypeCaster: ArgumentTypeCaster = async (message, phrase) => {
	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: message.guild!.id,
		},
	});

	const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

	if (!group) return;

	const groupRoles = await group.getRoles();

	const searcher = new FuzzySearch(groupRoles, ['rank', 'name'], {
		sort: true,
	});

	return searcher.search(phrase)[0];
};

export default groupRoleTypeCaster;
