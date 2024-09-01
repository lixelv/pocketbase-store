import PocketBase, { RecordService, type RecordModel } from 'pocketbase';
import { browser } from '$app/environment';

import type { CollectionSendOptions, ItemSendOptions, Record } from '$lib/types.js';
import { CollectionStore } from '$lib/stores/collection.js';
import { ItemStore } from '$lib/stores/item.js';

export class RecordServiceStore<M extends RecordModel> extends RecordService<M> {
	constructor(pb: PocketBase, collectionIdOrName: string) {
		super(pb, collectionIdOrName);
	}

	store<T extends Record>(
		options?: CollectionSendOptions,
		initialValue?: T[],
		autoSubGetData = true
	) {
		const result = new CollectionStore<T>(
			this.client,
			this.collectionIdOrName,
			options,
			initialValue
		);

		if (autoSubGetData) {
			if (browser) {
				if (!result.loaded) {
					result.getData();
				}
				result.subscribeOnPocketBase();
			}
		}

		return result;
	}

	storeItem<T extends Record>(
		initialValue: T | string,
		options?: ItemSendOptions,
		autoSubGetData = true
	) {
		const result = new ItemStore<T>(this.client, this.collectionIdOrName, initialValue, options);

		if (autoSubGetData) {
			if (browser) {
				if (!result.loaded) {
					result.getData();
				}
				result.subscribeOnPocketBase();
			}
		}

		return result;
	}
}

export class PocketBaseStore extends PocketBase {
	collection<M extends RecordModel>(idOrName: string): RecordServiceStore<M> {
		return new RecordServiceStore<M>(this, idOrName);
	}
}

export { PocketBaseStore as default };

export * from './types.js';
export * from './stores/collection.js';
export * from './utils.js';
