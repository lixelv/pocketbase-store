<script lang="ts">
	import PocketBase from 'pocketbase';
	import { browser } from '$app/environment';
	import { createCollectionStore } from '$lib';

	type TestItem = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		name: string;
	};

	export let data: { computers: TestItem[] };
	let value = '';
	// export let data: { test: TestItem[] };

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	pb.autoCancellation(false);

	if (browser) {
		pb.collection('computers').subscribe('*', (event) => {
			console.log('DEBUG', event);
		});
	}

	const computersStore = createCollectionStore<TestItem>(
		pb,
		'test',
		{
			sort: '-updated'
		},
		data.computers
	);

	if (browser) {
		computersStore.subscribeOnPocketBase();
		computersStore.getData();
	}
</script>

{#each $computersStore as item}
	name - {item.name} id - {item.id}<br />
{/each}
<form
	on:submit|preventDefault={async () => {
		await computersStore.create({ name: value });
	}}
>
	<input type="text" bind:value /><button type="submit">add new</button>
</form>
