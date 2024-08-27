import { createPocketBaseListStore, createPocketBaseOneStore } from './stores.ts';

export const pbStore = {
	list: createPocketBaseListStore,
	one: createPocketBaseOneStore
};
