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

This store is wrapped in `pb.collection('test').store()`, here is basic usage:

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
