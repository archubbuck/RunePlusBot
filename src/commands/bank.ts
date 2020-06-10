import { Command, CommandOptions, CommandStore, KlasaMessage, KlasaClient, KlasaUser } from 'klasa';
import airtables from '../providers/airtables';
import { DMChannel, MessageEmbed } from 'discord.js';
import { botOptions } from '../configuration/settings';

const _ = require('lodash');

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Used to check how many of each item you have in stock.",
			usage: "[member:user] [itemname:string]",
			usageDelim: botOptions.delimiter,
			aliases: ["b"]
		});
	}

	async run(message: KlasaMessage, [member, itemName]: [KlasaUser, string]) {

		if (!message.member.permissions.has("ADMINISTRATOR") && member) {
            throw `You don't have permission to execute this command as <@${member.id}>`
        }

        let trader = member || message.author;

        let provider = this.client.providers.get("airtables") as airtables;

        let items = await provider.bank(trader);

        if (!items || items.length === 0) {
            throw `You don't have any items in your bank yet.`;
        }

        let response = `${message.author.id === trader.id ? "Your" : `<@${trader.id}>'s`} bank includes the following items:\n\n`;

        _.sortBy(items, o => o.Item).forEach(r => {
            response += `${r.Item}: ${r.Quantity.toLocaleString()}\n`;
        });

        return message.sendMessage(response);
    }
}