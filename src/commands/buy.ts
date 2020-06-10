import { Command, CommandOptions, CommandStore, KlasaMessage, KlasaClient, KlasaUser } from 'klasa';
import airtables from '../providers/airtables';
import { DMChannel, MessageEmbed } from 'discord.js';
import { botOptions } from '../configuration/settings';
import { Transaction, TransactionFields } from '../lib/models';
import { Numbers } from '../utils/numbers';
import { Strings } from '../utils/strings';

const { Items } = require("oldschooljs");
const pluralize = require('pluralize');
const _ = require('lodash');

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Used to record a purchase.",
            usage: "[member:user] <quantity:number> <itemname:string> <price:number>",
			usageDelim: botOptions.delimiter
		});
	}

	async run(message: KlasaMessage, [member, quantity, itemName, price]: [KlasaUser, number, string, number]) {

		if (!message.member.permissions.has("ADMINISTRATOR") && member) {
            throw `You don't have permission to execute this command as <@${member.id}>`
        }

        let trader = member || message.author;

        // const itemNameNormalized = pluralize.singular(itemName);
        const items = Items.filter(i => {
            return [itemName.toLowerCase(), pluralize.singular(itemName).toLowerCase()]
                .includes(i.name.toLowerCase());
        }).array();
        
        if (items.length === 0)
            throw `"${itemName}" does not exist.`;

        const [item] = items;

        quantity = Numbers.fromKMB(quantity.toString());
        price = Numbers.fromKMB(price.toString());

        let transaction = new Transaction();
        transaction.fields = {
            Item: Strings.titleCase(item.name),
            Quantity: quantity,
            BuyPrice: price,
            Bought: new Date(),
            Trader: trader.id
        } as TransactionFields;

        await message.channel.send(
            `${message.author}, say \`confirm\` to insert the following record:\`\`\`json\n${JSON.stringify(transaction, null, 4)}\`\`\``
        )

        try {
            await message.channel.awaitMessages(_msg =>
                _msg.author.id === message.author.id &&
                _msg.content.toLowerCase() === 'confirm',
                {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                }
            );
        } catch (err) {
            return message.sendMessage(
                `*Your purchase request has been canceled. Please try again.*`
            )
        }

        let provider = this.client.providers.get("airtables") as airtables;
        let resp = await provider.buy(transaction);

        let response = `You purchased **${transaction.fields.Quantity.toLocaleString()}** x **${transaction.fields.Item}** for **${transaction.fields.BuyPrice.toLocaleString()}** each${message.author.id !== trader.id ? " on behalf of <@" + trader.id.toString() + ">" : ""}. \`${resp.id}\``;

        return message.sendMessage(response);
    }
}