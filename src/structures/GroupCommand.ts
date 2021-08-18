import type { CommandOptions } from 'discord-akairo';
import { Command } from 'discord-akairo';
import { GroupPermission } from '../common/types';

interface GroupCommandOptions extends CommandOptions {
	groupPermission?: GroupPermission;
	groupOwnerOnly?: boolean;
}

class GroupCommand extends Command {
	constructor(id: string, options?: GroupCommandOptions) {
		super(id, options);
		this.channel = 'guild';
		this.groupPermission = options?.groupPermission;
		this.groupOwnerOnly = options?.groupOwnerOnly;
	}

	groupPermission;
	groupOwnerOnly;
}

export default GroupCommand;
