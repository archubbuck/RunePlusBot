import { Argument, ArgumentStore, Possible, KlasaMessage, KlasaClient } from 'klasa';
import { Numbers } from '../utils/numbers';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['number'] });
	}

	run(arg: string, possible: Possible, message: KlasaMessage) {
		const { min, max } = possible;
		const number = Numbers.fromKMB(arg);

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2341
		return this.constructor.minOrMax(this.client, number, min, max, possible, message)
			? number
			: null;
	}
}
