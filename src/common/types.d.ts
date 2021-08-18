import type { PrismaClient } from '@prisma/client';

declare module 'discord-akairo' {
	interface AkairoClient {
		prisma: PrismaClient;
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		inhibitorHandler: InhibitorHandler;
	}
}

// verification api types
interface IVerificationApiResponse {
	status: 'ok' | 'error';
	error?: string;
}

export interface IBloxlinkResponse extends IVerificationApiResponse {
	primaryAccount?: string;
}

export interface IRoVerResponse extends IVerificationApiResponse {
	errorCode?: number;
	robloxUsername?: string;
	robloxId?: number;
}

export interface IRoWifiResponse {
	success: boolean;
	message?: string;
	discord_id?: number;
	roblox_id?: number;
}

// group permission type
type GroupPermission =
	| 'viewWall'
	| 'postToWall'
	| 'deleteFromWall'
	| 'viewStatus'
	| 'postToStatus'
	| 'changeRank'
	| 'inviteMembers'
	| 'removeMembers'
	| 'manageRelationships'
	| 'viewAuditLogs'
	| 'spendGroupFunds'
	| 'advertiseGroup'
	| 'createItems'
	| 'manageItems'
	| 'addGroupPlaces'
	| 'manageGroupGames'
	| 'viewGroupPayouts';

// Roblox presence types
export interface IPresence {
	GameId?: number;
	IsOnline: boolean;
	LastLocation: string;
	LastOnline: string;
	LocationType: number;
	PlaceId?: number;
	VisitorId: number;
	PresenceType: number;
	UniverseId?: number;
}

// Roblox user game data types
export interface IUserGames {
	previousPageCursor: null;
	nextPageCursor: null;
	data: IUserGameDatum[];
}

interface IUserGameDatum {
	id: number;
	name: string;
	description: null | string;
	creator: IGameParent;
	rootPlace: IGameParent;
	created: string;
	updated: string;
	placeVisits: number;
}

interface IGameParent {
	id: number;
	type: IGameType;
}

declare enum IGameType {
	Place = 'Place',
	User = 'User',
}
