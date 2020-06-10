import { GameResult } from "./lookups";

export class Transaction implements Airtable.Record<TransactionFields> {
    id: string;
    fields: TransactionFields;
}

export class TransactionFields {
    Item: string;
    Quantity: number;
    BuyPrice: number;
    SellPrice?: number;
    Bought: Date;
    Sold?: Date;
    Trader: string;
    Profit?: number;
}