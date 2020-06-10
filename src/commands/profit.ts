import { Command, CommandStore, KlasaMessage, KlasaUser, util } from 'klasa';
import airtables from '../providers/airtables';
import { botOptions } from '../configuration/settings';
import { MessageEmbed } from 'discord.js';

const moment = require('moment');

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Retrieves the profit statistics for the given user.",
            usage: "[member:user]",
            usageDelim: botOptions.delimiter,
            cooldown: 5
		});
	}

	async run(message: KlasaMessage, [member]: [KlasaUser]) {

		let trader = member || message.author;

        let provider = this.client.providers.get("airtables") as airtables;

        let today = await provider.profit(trader, moment(), moment());
        let yesterday = await provider.profit(trader, moment().subtract(1, 'day'), moment().subtract(1, 'day'));
        let thisWeek = await provider.profit(trader, moment().startOf('week'), moment().endOf('week'));
        let lastWeek = await provider.profit(trader, moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week'));
        let thisMonth = await provider.profit(trader, moment().startOf('month'), moment().endOf('month'));
        let lastMonth = await provider.profit(trader, moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month'));

        let embed = new MessageEmbed().setTitle(`${trader.username}'s Profit Statistics`);

        embed.addFields([
            {
                name: "Today",
                value: today.toLocaleString()
            },
            {
                name: "Yesterday",
                value: yesterday.toLocaleString()
            },
            {
                name: "This Week",
                value: thisWeek.toLocaleString()
            },
            {
                name: "Last Week",
                value: lastWeek.toLocaleString()
            },
            {
                name: "This Month",
                value: thisMonth.toLocaleString()
            },
            {
                name: "Last Month",
                value: lastMonth.toLocaleString()
            }
        ]);

        return message.sendEmbed(embed);
    }
}