export function copy<T>(obj: T): T | undefined {
	if (!obj) {
		return undefined;
	}

	return JSON.parse(JSON.stringify(obj));
}

export function getDate() {
	const d = new Date();
	return d.toISOString().replace(/[a-yA-Y]/g, ' ');
}

export function findDifference<T>(
	obj1: object[],
	obj2: object[]
): {
	action: 'create' | 'update' | 'delete' | undefined;
	record: T;
} {
	if (obj1.length === obj2.length) {
		for (let i = 0; i < obj1.length; i++) {
			const obj1I = JSON.stringify(obj1[i]);
			const obj2I = JSON.stringify(obj2[i]);

			if (obj1I != obj2I) {
				return {
					action: 'update',
					record: obj2[i] as T
				};
			}
		}
	} else if (obj1.length < obj2.length) {
		for (let i = 0; i < obj2.length; i++) {
			const obj1I = JSON.stringify(obj1[i]);
			const obj2I = JSON.stringify(obj2[i]);

			if (obj1I != obj2I) {
				return {
					action: 'create',
					record: obj2[i] as T
				};
			}
		}
	} else if (obj1.length > obj2.length) {
		for (let i = 0; i < obj1.length; i++) {
			const obj1I = JSON.stringify(obj1[i]);
			const obj2I = JSON.stringify(obj2[i]);

			if (obj1I != obj2I) {
				return {
					action: 'delete',
					record: obj1[i] as T
				};
			}
		}
	}
	return {
		action: undefined,
		record: undefined as T
	};
}
