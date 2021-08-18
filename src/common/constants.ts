const BLOXLINK_API_URL = 'https://api.blox.link/v1/';
const ROVER_API_URL = 'https://verify.eryn.io/api/';
const ROWIFI_API_URL = 'https://api.rowifi.link/v1/';

const FRIENDLY_PERMISSION_NAMES = {
	viewWall: 'View group wall',
	postToWall: 'Post on group wall',
	deleteFromWall: 'Delete group wall posts',
	viewStatus: 'View group shout',
	postToStatus: 'Post group shout',

	changeRank: 'Manage lower-ranked member ranks',
	inviteMembers: 'Accept join requests',
	removeMembers: 'Kick lower-ranked members',

	manageRelationships: 'Manage allies and enemies',
	viewAuditLogs: 'View audit log',

	spendGroupFunds: 'Spend group funds',
	advertiseGroup: 'Advertise the group',
	createItems: 'Create group items',
	manageItems: 'Configure group items',
	addGroupPlaces: 'Create and edit group games',
	manageGroupGames: 'Create and edit group games',
	viewGroupPayouts: '',
};

// thanks Bloxlink https://github.com/bloxlink/Bloxlink/src/resources/constants.py#L86
// some words added by me
const WORDS = [
	'bus',
	'roblox',
	'book',
	'key',
	'shirt',
	'pants',
	'battery',
	'lamp',
	'desk',
	'water',
	'soda',
	'button',
	'can',
	'hello',
	'mouse',
	'vase',
	'rug',
	'blanket',
	'pillow',
	'music',
	'lego',
	'glasses',
	'controller',
	'pencil',
	'devforum',
	'add',
	'group',
	'follow',
	'play',
	'game',
	'inventory',
	'premium',
	'robux',
	'studio',
];

const SUPPORT_SERVER_LINK = 'https://discord.gg/6hZcYrfnQ3';

export {
	BLOXLINK_API_URL,
	ROVER_API_URL,
	ROWIFI_API_URL,
	FRIENDLY_PERMISSION_NAMES,
	WORDS,
	SUPPORT_SERVER_LINK,
};
