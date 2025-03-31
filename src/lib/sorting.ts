import type { Record } from './types.js';

function unicodeCompare(a: string, b: string): number {
	if (a === b) {
		return 0;
	}

	for (let i = 0; i <= Math.min(a.length - 1, b.length - 1); i++) {
		if (a[i] !== b[i]) {
			return a[i].charCodeAt(0) > b[i].charCodeAt(0) ? 1 : -1;
		}
	}

	if (a.length > b.length) {
		return 1;
	} else if (a.length < b.length) {
		return -1;
	} else {
		return 0;
	}
}

function compare(a: any, b: any, desc: boolean = false) {
	if (typeof a === 'number') {
		return desc ? b - a : a - b;
	} else {
		return desc ? unicodeCompare(b, a) : unicodeCompare(a, b);
	}
}

function binarySearch<T>(arr: T[], el: T, compare_fn: (a: T, b: T) => number): number {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		const middle = (right + left) >> 1;
		const cmp = compare_fn(el, arr[middle]);

		if (cmp > 0) {
			left = middle + 1;
		} else if (cmp < 0) {
			right = middle - 1;
		} else {
			return middle;
		}
	}

	return left;
}

function getCompareFunction(expression: string) {
	const sorters = expression.split(',');

	function result(a: Record, b: Record) {
		for (let sorter of sorters) {
			if (!'+-'.includes(sorter[0])) {
				sorter = '+' + sorter;
			}

			const desc = sorter[0] === '-';
			sorter = sorter.slice(1);

			const compared = compare(a[sorter], b[sorter], desc);
			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	}

	return result;
}

export function pocketBaseInsert(arr: Record[], element: Record, expression: string = '-created') {
	const index = binarySearch(arr, element, getCompareFunction(expression));

	arr.splice(index, 0, element);
	return index;
}
