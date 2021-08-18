// https://github.com/discord-akairo/discord-akairo/blob/master/test/commands/eval.js

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import util from 'util';

class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'e'],
			ownerOnly: true,
			quoted: false,
			args: [
				{
					id: 'code',
					match: 'content',
				},
			],
		});
	}

	async exec(
		message: Message,
		{ code }: { code: string },
	): Promise<Message | undefined> {
		if (message.util === undefined || this.client.token === null) return;

		if (!code) return message.util.reply('No code provided!');

		const evaled: {
			message?: Message;
			errored?: boolean;
			output?: string;
		} = {};
		const logs: string[] = [];

		const token = this.client.token.split('').join('[^]{0,2}');
		const rev = this.client.token.split('').reverse().join('[^]{0,2}');
		const tokenRegex = new RegExp(`${token}|${rev}`, 'g');
		const cb = '```';

		try {
			let output = eval(code);
			if (output && typeof output.then === 'function') {
				output = await output;
			}

			if (typeof output !== 'string') {
				output = util.inspect(output, { depth: 0 });
			}
			output = `${logs.join('\n')}\n${
				logs.length && output === 'undefined' ? '' : output
			}`;
			output = output.replace(tokenRegex, '[TOKEN]');

			if (output.length + code.length > 1900) output = 'Output too long.';

			const sent = await message.util.send(
				[`**Input**${cb}js`, code, cb, `**Output**${cb}js`, output, cb].join(
					'\n',
				),
			);

			evaled.message = sent;
			evaled.errored = false;
			evaled.output = output;

			return sent;
		} catch (err) {
			console.error(err);
			let error = err;

			error = error.toString();
			error = `${logs.join('\n')}\n${
				logs.length && error === 'undefined' ? '' : error
			}`;
			error = error.replace(tokenRegex, '[TOKEN]');

			const sent = await message.util.send(
				[
					`\u2000**Input**${cb}js`,
					code,
					cb,
					`\u2000**Error**${cb}js`,
					error,
					cb,
				].join('\n'),
			);

			evaled.message = sent;
			evaled.errored = true;
			evaled.output = error;

			return sent;
		}
	}
}

export default EvalCommand;
