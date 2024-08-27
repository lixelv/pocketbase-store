import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { onMount } from 'svelte';

import type { Record, SendOptions } from './types.ts';
import { EXPIRATION_TIME } from './constants.ts';
import { pocketBaseInsert } from './sorting.ts';
import { copy } from './utils.ts';

class Cache {
	cache: Set<any>;
	expirationTime: number;

	constructor(expirationTime: number) {
		this.cache = new Set();
		this.expirationTime = expirationTime;
	}

	has(key: any) {
		return this.cache.has(key);
	}

	add(key: any) {
		this.cache.add(key);

		setTimeout(() => {
			if (this.cache.has(key)) {
				this.cache.delete(key);
			}
		}, this.expirationTime);
	}

	delete(key: any) {
		this.cache.delete(key);
	}

	clear() {
		this.cache.clear();
	}

	enteries() {
		return this.cache.entries();
	}

	size() {
		return this.cache.size;
	}
}

export function createPocketBaseListStore<T extends Record[]>(
	pb: PocketBase,
	collection: string,
	options?: SendOptions,
	initialValue?: T
) {
	const store = writable<T>(initialValue || ([] as unknown as T));

	const addCache = new Cache(options?.expirationTime || EXPIRATION_TIME);
	const updateCache = new Cache(options?.expirationTime || EXPIRATION_TIME);
	const removeCache = new Cache(options?.expirationTime || EXPIRATION_TIME);

	function addEvent(value: T[number]) {
		if (addCache.has(value.id)) {
			return;
		} else {
			addCache.add(value.id);
		}

		store.update((s) => {
			if (options?.sort) {
				pocketBaseInsert(s, value, options?.sort);
			} else {
				s.push(value);
			}

			return s;
		});
	}

	function updateEvent(value: T[number]) {
		if (updateCache.has(value)) {
			return;
		} else {
			updateCache.add(value);
		}

		store.update((s) => {
			let result: T;

			if (options?.sort) {
				result = s.filter((item: { id: string }) => item.id !== value.id) as T;
				pocketBaseInsert(result, value, options?.sort);
			} else {
				result = s.map((item: { id: string }) => (item.id === value.id ? value : item)) as T;
			}

			return result;
		});
	}

	function removeEvent(id: string) {
		if (removeCache.has(id)) {
			return;
		} else {
			removeCache.add(id);
		}
		store.update((s) => {
			return s.filter((item: { id: string }) => item.id !== id) as T;
		});
	}

	async function create(value: { [key: string]: any }) {
		const newValue = (await pb.collection(collection).create(value)) as T[number];

		addEvent(newValue);
	}

	async function update(value: T[number]) {
		await pb.collection(collection).update(value.id, value);

		updateEvent(value);
	}

	function remove(id: string) {
		pb.collection(collection).delete(id);

		removeEvent(id);
	}

	if (!initialValue) {
		pb.collection(collection)
			.getFullList(copy(options))
			.then((data) => {
				store.set(data as unknown as T);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	onMount(() => {
		const unsubscribe = pb.collection(collection).subscribe(
			'*',
			({ action, record }) => {
				switch (action) {
					case 'create':
						addEvent(record);
						break;
					case 'update':
						updateEvent(record);
						break;
					case 'delete':
						removeEvent(record.id);
						break;
				}
			},
			copy(options)
		);

		return async () => {
			await (
				await unsubscribe
			)();
		};
	});

	return {
		...store,
		collection: {
			create,
			update,
			delete: remove
		}
	};
}

export function createPocketBaseOneStore<T extends Record>(pb: PocketBase, initialValue: T) {
	const store = writable<T | null>(initialValue);

	onMount(() => {
		const unsubscribe = pb
			.collection(initialValue.collectionName)
			.subscribe(initialValue.id, ({ action, record }) => {
				switch (action) {
					case 'update':
						store.set(record as unknown as T);
						break;
					case 'delete':
						store.set(null);
						break;
				}
			});

		return async () => {
			await (
				await unsubscribe
			)();
		};
	});

	return {
		...store
	};
}
