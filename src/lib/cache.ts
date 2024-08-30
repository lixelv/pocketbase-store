export class Cache {
	cache: Set<any>;
	expirationTime: number;

	constructor(expirationTime: number) {
		this.cache = new Set();
		this.expirationTime = expirationTime;
	}

	has(key: any) {
		const stringified = JSON.stringify(key);

		return this.cache.has(stringified);
	}

	add(key: any) {
		const stringified = JSON.stringify(key);
		this.cache.add(stringified);

		setTimeout(() => {
			if (this.cache.has(stringified)) {
				this.cache.delete(stringified);
			}
		}, this.expirationTime);
	}

	delete(key: any) {
		const stringified = JSON.stringify(key);
		this.cache.delete(stringified);
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
