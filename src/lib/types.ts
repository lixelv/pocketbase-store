export type Record = {
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
	[key: string]: any;
};

export type CollectionSendOptions = {
	expand?: string;
	fields?: string;
	filter?: string;
	sort?: string;
	expirationTime?: number;
};

export type ItemSendOptions = {
	expand?: string;
	fields?: string;
	expirationTime?: number;
};
