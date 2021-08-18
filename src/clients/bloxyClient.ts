import * as bloxy from 'bloxy';

const client = new bloxy.Client({
	credentials: {
		cookie: process.env.ROBLOX_COOKIE,
	},
});

client
	.login()
	.then((user) =>
		console.log(`Logged into ${user.name} (${user.id}) successfully.`),
	)
	.catch((e) => {
		console.error(`Unable to log into Roblox account:\n${e}`);
		process.exit(1);
	});

export { client as bloxyClient };
