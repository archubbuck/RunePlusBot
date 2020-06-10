import { Provider, ProviderStore, ProviderOptions, KlasaUser } from 'klasa';
import { airtablesOptions } from '../configuration/settings';
import { Transaction } from '../lib/models';

const _ = require('lodash');
const moment = require('moment')
const { resolve } = require('path');
const fs = require('fs-nextra');
const Airtable = require('airtable');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: airtablesOptions.token
});

export default class extends Provider {

    base: Airtable.Base;
    
	public constructor(store: ProviderStore, file: string[], directory: string, options?: ProviderOptions) {
		super(store, file, directory, {
            name: "airtables"
        });
        this.directory = resolve(this.client.userBaseDirectory, 'providers');
	}

    public async init() {
        this.base = Airtable.base(airtablesOptions.base);
    }

    public async buy(transaction: Transaction) {
        return this.base("Sales Deals").create(transaction.fields, { "typecast": true });
    }

    public async sell(transaction: Transaction) {
        const relatedRecords = await this.base("Sales Deals").select({
            filterByFormula: `AND(LOWER(Item) = '${transaction.fields.Item.toLowerCase().replace("'", "\\'")}', {Sold} = '', {Trader} = '${transaction.fields.Trader}')`
        }).all() as Transaction[];

        const quantityOfItemInStock = relatedRecords.reduce((acc, curr) => acc + curr.fields.Quantity, 0);

        if (transaction.fields.Quantity > quantityOfItemInStock) {
            throw `Our records indicate that you only have **${quantityOfItemInStock.toLocaleString()}** x **${transaction.fields.Item}** in stock, which is a difference of ${Math.abs(quantityOfItemInStock - transaction.fields.Quantity).toLocaleString()}.`;
        }

        let profit = 0;

        let quantity = transaction.fields.Quantity;
        for (let i = 0; i < relatedRecords.length; i++) {
            let element = relatedRecords[i];
            if (quantity >= element.fields.Quantity) {
                element.fields.SellPrice = transaction.fields.SellPrice;
                element.fields.Sold = new Date();
                quantity -= element.fields.Quantity;
            } else {
                element.fields.Quantity = element.fields.Quantity - quantity;
                break;
            }
        }

        let toUpdate = _.chunk(relatedRecords.map(r => {
            return {
                id: r.id,
                fields: {
                    Quantity: r.fields.Quantity,
                    SellPrice: r.fields.SellPrice,
                    Sold: r.fields.Sold.toISOString().substr(0, 10)
                }
            }
        }), 10);

        let updated = [];
        for (let i in toUpdate) {
            let records = await this.base("Sales Deals").update(toUpdate[i]);
            updated.push(...records);
        }

        if (quantity > 0) {
            let created = await this.base("Sales Deals").create({
                Trader: transaction.fields.Trader,
                Item: transaction.fields.Item,
                Quantity: quantity,
                Bought: updated[0].fields.Bought,
                BuyPrice: updated[0].fields.BuyPrice,
                SellPrice: transaction.fields.SellPrice,
                Sold: new Date().toISOString().substr(0, 10)
            }, { "typecast": true }) as Transaction;
            profit += created.fields.Profit;
        }

        updated.forEach(r => {
            if (r.fields.Profit) {
                profit += r.fields.Profit;
            }
        });

        return {
            profit: profit
        }
    }

    public async bank(member: KlasaUser) {
        let itemsInStock = await this.base("Sales Deals").select({
            filterByFormula: `AND({Sold} = '', {Trader} = '${member.id}')`
        }).all() as Transaction[];

        let condensed = _(itemsInStock.map(m => { return { Item: m.fields.Item, Quantity: m.fields.Quantity } })).groupBy('Item')
            .map((objs, key) => { return { 'Item': key, 'Quantity': _.sumBy(objs, 'Quantity') } }).value();

        return condensed;
    }

    public async profit(member: KlasaUser, startDate: Date, endDate: Date) {
        const records = await this.base("Sales Deals").select({
            filterByFormula: `AND( NOT({Profit} = ''), {Trader} = '${member.id}', IS_AFTER({Sold},'${moment(startDate).subtract(1, 'day').format("YYYY-MM-DD")}'), IS_BEFORE({Sold},'${moment(endDate).add(1, 'day').format("YYYY-MM-DD")}') )`
        }).all() as Transaction[];
        let profit = _.sum(records.map(m => m.fields.Profit));
        return profit;
    }

    /* Auto Generated */

    public create(table: string, entry: string, data: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public createTable(table: string, rows?: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public delete(table: string, entry: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public deleteTable(table: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public get(table: string, entry: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public getAll(table: string): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    public has(table: string, entry: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public hasTable(table: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public update(table: string, entry: string, data: import("klasa").SettingsUpdateResultEntry[] | [string, any][] | Record<string, any>): Promise<any> {
        throw new Error("Method not implemented.");
    }
    public replace(table: string, entry: string, data: import("klasa").SettingsUpdateResultEntry[] | [string, any][] | Record<string, any>): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}