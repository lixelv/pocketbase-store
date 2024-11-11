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
	type Updater,
	type Writable,
	type Invalidator,
	type Subscriber,
	type Unsubscriber
} from 'svelte/store';

import { EXPIRATION_TIME } from '$lib/constants.js';

import type { Record, ItemSendOptions } from '$lib/types.js';
import { Cache } from '$lib/cache.js';
import { copy } from '$lib/utils.js';

export class ItemStore<T extends Record> implements Writable<T> {
	pb: PocketBase;
	collection: string;
	initialValue: T;
	options?: ItemSendOptions;

	id: string;
	loaded: boolean;
	#unsubscribe?: Unsubscriber;
	#act: boolean;
	#cache: Cache;
	#store: Writable<T>;

	constructor(
		pb: PocketBase,
		collection: string,
		initialValue: T | string,
		options?: ItemSendOptions
	) {
		let loaded = typeof initialValue !== 'string';

		if (typeof initialValue === 'string') {
			initialValue = { id: initialValue } as T;
		}

		this.id = initialValue.id;
		this.pb = pb;
		this.collection = collection;
		this.initialValue = initialValue;
		this.options = options;
		this.loaded = loaded;

		this.#act = true;
		this.#cache = new Cache(options?.expirationTime || EXPIRATION_TIME);
		this.#store = writable<T>(initialValue);

		this.#store.subscribe((value) => {
			this.initialValue = value;
		});

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
		const data = await this.pb.collection(this.collection).getOne<T>(this.id, copy(this.options));
		this.#store.set(data);
	}

	async subscribeOnPocketBase() {
		this.#unsubscribe = await this.pb.collection(this.collection).subscribe(
			this.id,
			({ action, record }) => {
				const value = { action, record: { ...record, updated: '' } };

				switch (action) {
					case 'update':
						this.#act = false;
						if (!this.#cache.has(value)) {
							this.#store.set(record as T);
							this.#cache.add(value);
						} else {
						}
						this.#act = true;
						break;
					case 'delete':
						this.#act = false;
						this.#store.set({} as T);
						this.#act = true;
						break;
				}
			},
			copy(this.options)
		);
	}

	async send() {
		await this.pb
			.collection(this.collection)
			.update(this.id, this.initialValue, copy(this.options));
	}

	set(value: T): void {
		this.#cache.add({ action: 'update', record: { ...value, updated: '' } });
		this.#store.set(value);
	}

	update(updater: Updater<T>): void {
		const newUpdater = (value: T) => {
			const newValue = updater(value);

			this.#cache.add({ action: 'update', record: { ...newValue, updated: '' } });

			return newValue;
		};
		this.#store.update(newUpdater);
	}

	subscribe(run: Subscriber<T>, invalidate?: Invalidator<T> | undefined): Unsubscriber {
		const subscription = this.#store.subscribe(run, invalidate);

		return () => {
			subscription();
			this.#unsubscribe?.();
		};
	}
}
