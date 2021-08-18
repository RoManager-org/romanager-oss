import { User } from 'bloxy/dist/structures';
import type { ArgumentTypeCaster } from 'discord-akairo';
import client from '../clients/akairoClient';
import { bloxyClient } from '../clients/bloxyClient';
import robloxUserTypeCaster from './robloxUser';

const groupMemberTypeCaster: ArgumentTypeCaster = async (message, phrase) => {
	const robloxUser: User | undefined = await robloxUserTypeCaster(
		message,
		phrase,
	);

	if (!robloxUser) return;

	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: message.guild!.id,
		},
	});

	const group = await bloxyClient.getGroup(Number(guildData?.linkedGroup));

	if (!group) return;

	return group.getMember(robloxUser.id);
};

export default groupMemberTypeCaster;
