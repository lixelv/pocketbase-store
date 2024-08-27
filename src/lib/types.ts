export type Record = {
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
	[key: string]: any;
};

export type SendOptions = {
	expand?: string;
	fields?: string;
	filter?: string;
	sort?: string;
	expirationTime?: number;
};
