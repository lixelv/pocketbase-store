<script lang="ts">
	import PocketBase from 'pocketbase';
	import { createCollectionStore } from '$lib';

	type TestItem = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		name: string;
	};

	// export let data: { test: TestItem[] };

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	pb.autoCancellation(false);

	const testStore = createCollectionStore<TestItem>(pb, 'test');

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

{#each $testStore as item}
	{item.name} - {item.id}
	<button on:click={() => testStore.delete(item)}>Delete</button>
	<br />
{/each}
