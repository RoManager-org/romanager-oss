import type { ArgumentTypeCaster } from 'discord-akairo';
import { URL } from 'url';
import { bloxyClient } from '../clients/bloxyClient';

const robloxUserTypeCaster: ArgumentTypeCaster = async (_message, phrase) => {
	if (!phrase) return;

	if (!isNaN(Number(phrase))) {
		try {
			return await bloxyClient.getUser(phrase);
		} catch (e) {
			console.debug(e);
		}
	}

	try {
		return await (await bloxyClient.getUserIdFromUsername(phrase)).getUser();
	} catch (e) {
		console.debug(e);
	}

	try {
		const robloxUrl = new URL(phrase);

		const id = robloxUrl.pathname.substr(
			1,
			robloxUrl.pathname.substr(1).indexOf('/'),
		);

		return await bloxyClient.getUser(Number(id));
	} catch (e) {
		console.debug(e);
	}

	return;
};

export default robloxUserTypeCaster;
