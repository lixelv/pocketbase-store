let browser: boolean;

(async () => {
	try {
		const { browser: browserModule } = await import('$app/environment');
		browser = browserModule;
	} catch {
		browser = true;
	}
})();

import PocketBase from 'pocketbase';
import {
	writable,
	type Invalidator,
	type Readable,
	type Writable,
	type Subscriber,
	type Unsubscriber,
	type Updater
} from 'svelte/store';

import { EXPIRATION_TIME } from '$lib/constants.js';
import type { Record, CollectionSendOptions } from '$lib/types.js';
import { Cache } from '$lib/cache.js';
import { pocketBaseInsert } from '$lib/sorting.js';
import { copy, getDate, getStore } from '$lib/utils.js';

export class CollectionStore<T extends Record> implements Readable<T[]> {
	pb: PocketBase;
	collection: string;
	options?: CollectionSendOptions;

	// #act: boolean;
	loaded: boolean;
	#subscribed: boolean;
	#unsubscribe?: Unsubscriber;
	#store: Writable<T[]>;
	#cache: Cache;

	constructor(
		pb: PocketBase,
		collection: string,
		options?: CollectionSendOptions,
		initialValue?: T[]
	) {
		this.pb = pb;
		this.collection = collection;

		this.options = options;
		this.loaded = initialValue?.length ? true : false;

		// TODO: add writable pocketbase store, now only readable
		// this.#act = true;
		this.#subscribed = false;
		this.#store = writable<T[]>(initialValue || ([] as unknown as T[]));
		this.#cache = new Cache(options?.expirationTime || EXPIRATION_TIME);

		if (options?.autoSubGetData ? options.autoSubGetData : true) {
			if (browser) {
				if (!this.loaded) {
					this.getData();
				}
				this.subscribeOnPocketBase();
			}
		}
	}

	async getData() {
		const data = await this.pb.collection(this.collection).getFullList<T>(copy(this.options));
		this.#store.set(data);
	}

	async subscribeOnPocketBase() {
		if (this.#subscribed) {
			return;
		}

		const unsubscribe = await this.pb.collection(this.collection).subscribe(
			'*',
			({ action, record }) => {
				this.handleSummary({ action, record } as {
					action: 'create' | 'update' | 'delete';
					record: T;
				});
			},
			copy(this.options)
		);

		this.#subscribed = true;

		this.#unsubscribe = async () => {
			await unsubscribe();
			this.#subscribed = false;
		};
	}

	async unsubscribeFromPocketBase() {
		if (this.#subscribed) {
			await this.#unsubscribe?.();
		}
	}

	handleCreate(value: T) {
		this.#store.update((s) => {
			s = s.filter(
				(item: { id: string }) => item.id !== 'justCreated' && item.id !== value.id
			) as T[];

			if (this.options?.sort) {
				pocketBaseInsert(s, value, this.options?.sort);
			} else {
				s.push(value);
			}

			return s;
		});
	}

	handleUpdate(value: T, toCache: boolean = true) {
		if (toCache) {
			if (
				this.#cache.has({ action: 'update', record: JSON.stringify({ ...value, updated: '' }) })
			) {
				return;
			} else {
				this.#cache.add({ action: 'update', record: JSON.stringify({ ...value, updated: '' }) });
			}
		}

		this.#store.update((s) => {
			if (this.options?.sort) {
				s = s.filter((item: { id: string }) => item.id !== value.id) as T[];
				pocketBaseInsert(s, value, this.options?.sort);
			} else {
				s = s.map((item: { id: string }) => (item.id === value.id ? value : item)) as T[];
			}

			return s;
		});
	}

	handleDelete(value: T, toCache: boolean = true) {
		if (toCache) {
			if (this.#cache.has({ action: 'delete', record: value.id })) {
				return;
			} else {
				this.#cache.add({ action: 'delete', record: value.id });
			}
		}

		this.#store.update((s) => {
			s = s.filter((item: { id: string }) => item.id !== value.id) as T[];
			return s;
		});
	}

	handleSummary(args: { action: 'create' | 'update' | 'delete' | undefined; record: T }) {
		// this.#act = false;

		switch (args.action) {
			case 'create':
				this.handleCreate(args.record as T);
				break;
			case 'update':
				this.handleUpdate(args.record as T);
				break;
			case 'delete':
				this.handleDelete(args.record as T);
				break;
		}

		// this.#act = true;
	}

	async create(value: { [key: string]: any }) {
		const insertValue = { ...value, id: 'justCreated', created: getDate(), updated: getDate() };
		this.handleCreate(insertValue as unknown as T);

		try {
			await this.pb.collection(this.collection).create(value);
		} catch (error) {
			this.handleDelete(insertValue as unknown as T, false);
			throw error;
		}
	}

	async update_(value: T) {
		const previousValue = getStore<T[]>(this.#store).find(
			(item: { id: string }) => item.id === value.id
		);
		this.handleUpdate(value, false);

		try {
			await this.pb.collection(this.collection).update(value.id, value);
		} catch (error) {
			this.handleUpdate(previousValue as T, false);
			throw error;
		}
	}

	async delete(value: T) {
		const previousValue = getStore<T[]>(this.#store).find(
			(item: { id: string }) => item.id === value.id
		);
		this.handleDelete(value);

		try {
			await this.pb.collection(this.collection).delete(value.id);
		} catch (error) {
			this.handleDelete(previousValue as T, false);
			throw error;
		}
	}

	set(value: T[]): void {
		this.#store.set(value);
	}

	update(updater: Updater<T[]>): void {
		this.#store.update(updater);
	}

	subscribe(run: Subscriber<T[]>, invalidate?: Invalidator<T[]> | undefined): Unsubscriber {
		const subscription = this.#store.subscribe(run, invalidate);

		return () => {
			subscription();
			this.#unsubscribe?.();
		};
	}
}

export function createCollectionStore<T extends Record>(
	pb: PocketBase,
	collection: string,
	options?: CollectionSendOptions,
	initialValue?: T[]
) {
	return new CollectionStore<T>(pb, collection, options, initialValue);
}
