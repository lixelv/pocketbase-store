# pocketbase-store

## Overview

This library was created to make using pocketbase **realtime data** in svelte apps easier, by providing reactive stores for collections and individual records.

## Installation

```bash
npm install pocketbase-store
```

## Usage

Here is example of basic usage for storing some words and sorting them by name and created fields:

```svelte
<script lang="ts">
	import PocketBase from 'pocketbase-store';

	type TestItem = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		name: string;
	};

	const pb = new PocketBase('https://your-pocketbase-url.com');
	const testStore = pb.collection('example').store<TestItem>({ sort: '-name,created' });

	let value = '';
</script>

<form
	on:submit|preventDefault={() => {
		testStore.create({ name: value });
		value = '';
	}}
>
	<input type="text" bind:value />
	<button type="submit">Add</button>
</form>
{#each $testStore as item (item.id)}
	{item.name}
	<button on:click={() => testStore.delete(item)}>Delete</button>
	<br />
{/each}
```

## Elements

### Collection Store

#### Overview

This `CollectionStore` class is wrapped in `pb.collection('test').store()`, here is basic usage:

```svelte
<script lang="ts">
	import PocketBase from 'pocketbase-store';

	const pb = new PocketBase('https://your-pocketbase-url.com');
	const collectionStore = pb.collection('example').store();
</script>

{#each $collectionStore as item (item.id)}
	<!-- ... -->
{/each}
```

And data will refresh automatically when it changes, thanks for realtime data support in pocketbase!

#### Generics

Also you can use basic generics in stores, the example is in [Usage](#usage) section:

#### Additional methods

I've added some additional methods in this store:

- `getData`: Used for getting data from pocketbase. Returns nothing. By default when `autoSubGetData = true` lunches when initialized, method is async.
- `subscribeOnPocketBase`: Used for subscribing on pocketbase. Returns nothing. By default when `autoSubGetData = true` lunches when initialized, method is async.

- `create`: Used for changing data in the store first, and after in pocketbase. Returns nothing.
- `update_`: Used for updating data in the store first, and after in pocketbase. Returns nothing. Also named `update_` because `update` is already used in `writable`, sadly :(.
- `delete`: Used for deleting data in the store first, and after in pocketbase. Returns nothing.

All this methods are async methods, also they changes the store much faster, then waiting for response from pocketbase.

#### Writible

Collection Store is a class, that implements `writable` interface. That means, that you can change data in store. But sadly this changes won't be reflected in pocketbase, I want to fix this, in the future, this is planed. Now use `update_` method instead.

#### Options

You can add 2 additional arguments to `store` method:

- `options`: `CollectionSendOptions`, you can find it in [Types](#types) section.
- `initialValue`: `T[]`, it's an array of objects that will be stored in the store, instead of calling `getFullList` method from pocketbase.
- `autoSubGetData`: `boolean`, if you want to manage getting data and subscribing on pocketbase by methods `getData` and `subscribeOnPocketBase`, set it to `false`, by default it's `true`.

#### Types

```ts
type CollectionSendOptions = {
	expand?: string; // string like 'name,created', more info in pocketbase admin ui docs
	fields?: string; // string like 'name,created' for sorting witch fields to send
	filter?: string; // string like 'name = "test"', more info here: https://pocketbase.io/docs/api-rules-and-filters/
	sort?: string; // string like '-name,created', more info in pocketbase admin ui docs
	expirationTime?: number; // time in milliseconds then data in cache will be deleted (by default 4 seconds)
	autoSubGetData?: boolean; // if you want to manage getting data and subscribing on pocketbase by methods `getData` and `subscribeOnPocketBase`, set it to `false`, by default it's `true`
};

// Every T generic type better to have all Record fields
type Record = {
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
};
```

### Item Store

#### Overview

This `ItemStore` class is wrapped in `pb.collection('test').storeItem()`, here is basic usage:

```svelte
<script lang="ts">
	import PocketBase from 'pocketbase-store';

	const pb = new PocketBase('https://your-pocketbase-url.com');
	const itemStore = pb.collection('example').storeItem('RECORD_ID');
</script>

<input type="text" bind:value={$itemStore.name} />

<button on:click={async () => await $itemStore.send()}>Send</button>
```

> [!NOTE]
> When you write something in input, it will be changed in store, and on calling `$itemStore.send()`, it will be sent to pocketbase.

#### Generics

Here is supported generics, all I can say.

#### Additional methods

I've added some additional methods in this store:

- `getData`: Used for getting data from pocketbase. Returns nothing. By default when `autoSubGetData = true` lunches when initialized, method is async.
- `subscribeOnPocketBase`: Used for subscribing on pocketbase. Returns nothing. By default when `autoSubGetData = true` lunches when initialized, method is async.

- `send`: Used for refreshing data in the pocketbase.

#### Options

When creating new ItemStore, you can add next arguments:

- `initialValue (required)`: `T | string`, used for initializing new item, can hold string like `'RECORD_ID'` and object like `{ id: 'RECORD_ID', collectionId: 'COLLECTION_ID', collectionName: 'COLLECTION_NAME', etc.}`.
- `options`: `ItemSendOptions`, you can find it in [Types](#types) section.

#### Types

```ts
type ItemSendOptions = {
	expand?: string; // string like 'name,created', more info in pocketbase admin ui docs
	fields?: string; // string like 'name,created' for sorting witch fields to send
	expirationTime?: number; // time in milliseconds then data in cache will be deleted (by default 4 seconds)
	autoSubGetData?: boolean; // if you want to manage getting data and subscribing on pocketbase by methods `getData` and `subscribeOnPocketBase`, set it to `false`, by default it's `true`
};
```

## Contributing and Releasing

### Development

1. Fork the repository
2. Make your changes
3. Create a pull request

### Publishing a New Version

This library uses GitHub Actions for automated publishing to npm. To release a new version:

1. Update the version number in `package.json`
2. Commit your changes: `git commit -am "Bump version to x.y.z"`
3. Create a new tag: `git tag vx.y.z` (where x.y.z is the version number)
4. Push the changes and tags: `git push && git push --tags`

The GitHub Actions workflow will automatically:
- Build and test the package
- Publish to npm when a new tag is pushed

Note: You need to have an NPM_TOKEN secret set up in your GitHub repository settings for the automated publishing to work.

## LICENSE

MIT License, do what you want with it, this is your responsibility.
