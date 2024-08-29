import PocketBase, { RecordService, type RecordModel } from 'pocketbase';
import type { Writable } from 'svelte/store';

import type { SendOptions, Record } from './types.js';
import { createCollectionStore, createItemStore } from './stores.js';

class RecordServiceStore<M extends RecordModel> extends RecordService<M> {
	constructor(pb: PocketBase, collectionIdOrName: string) {
		super(pb, collectionIdOrName);
	}

	store<T extends Record[]>(options?: SendOptions, initialValue?: T) {
		return createCollectionStore<T>(
			this.client,
			this.collectionIdOrName,
			options,
			initialValue
		) as Writable<T> & {
			data: {
				create: (value: { [key: string]: any }) => void;
				update: (value: T[number]) => void;
				delete: (id: string) => void;
			};
		};
	}

	itemStore<T extends Record>(initialValue: T) {
		return createItemStore<T>(this.client, initialValue) as Writable<T>;
	}
}

export class PocketBaseStore extends PocketBase {
	collection<M extends RecordModel>(idOrName: string): RecordServiceStore<M> {
		return new RecordServiceStore<M>(this, idOrName);
	}
}

export { PocketBaseStore as default };
export { createCollectionStore, createItemStore };
