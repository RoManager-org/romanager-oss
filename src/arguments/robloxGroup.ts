import type { ArgumentTypeCaster } from 'discord-akairo';
import { URL } from 'url';
import { bloxyClient } from '../clients/bloxyClient';

const robloxGroupTypeCaster: ArgumentTypeCaster = async (_message, phrase) => {
	if (!phrase) return;

	try {
		return await bloxyClient.getGroup(Number(phrase));
	} catch (e) {
		console.debug(e);
	}

	try {
		const search = await bloxyClient.apis.groupsAPI.searchGroups({
			groupName: phrase,
		});

		const groups = search.data?.filter(
			(group) => group.name.toLowerCase() === phrase.toLowerCase(),
		);

		if (groups?.[0]) {
			return await bloxyClient.getGroup(groups[0].id);
		}
	} catch (e) {
		console.debug(e);
	}

	try {
		const robloxUrl = new URL(phrase);

		const id = robloxUrl.pathname.substr(
			1,
			robloxUrl.pathname.substr(1).indexOf('/'),
		);

		if (Number(id)) {
			return await bloxyClient.getGroup(Number(id));
		}
	} catch (e) {
		console.debug(e);
	}

	return;
};

export default robloxGroupTypeCaster;
