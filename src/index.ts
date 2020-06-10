import { Client, KlasaClientOptions, KlasaClient } from 'klasa';
import { klasaOptions, botOptions } from './configuration/settings';
import airtables from './providers/airtables';
// import { User } from './lib/models';

class OSRSBot extends Client {

	constructor(options?: KlasaClientOptions) {
		super(options);

		// Add any properties to your Klasa Client
	}

	// Add any methods to your Klasa Client

}

let c: KlasaClient = new OSRSBot(klasaOptions);

// c.on("guildMemberAdd", async (member) => {
// 	let provider = member.client.providers.get("airtables") as airtables;
// 	let user = await provider.getUser(Number.parseInt(member.id));
// 	console.log(user);

// 	if (typeof user !== "object") {
// 		let newUser = new User();
// 		newUser.fields = {
// 			DiscordIdentifier: Number.parseInt(member.id),
// 			OSRSBalance: 0,
// 			RS3Balance: 0,
// 			AutoConfirm: false,
// 			PrivateBanking: false
// 		};
// 		let inserted = await provider.createUser(newUser);
// 		console.log(inserted);
// 	}
// });

c.login(botOptions.token);

