<script lang="ts">
	import PocketBase from 'pocketbase';
	import { browser } from '$app/environment';
	import { createCollectionStore } from '$lib/index.js';
	import { onDestroy, onMount } from 'svelte';

	type TestItem = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		text: string;
		ip: string;
	};

	export let data: { computers: TestItem[] };
	let value = {
		text: '',
		ip: ''
	};

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	pb.autoCancellation(false);

	const computersStore = createCollectionStore<TestItem>(
		pb,
		'test',
		{
			sort: '-updated'
		},
		data.computers
	);

	onMount( async () => {
		if (browser) {
			await computersStore.getData();
	}});


	let ip: null | string = null;
</script>

{#each $computersStore as item}
	{JSON.stringify(item)}
	<button on:click={() => computersStore.delete(item)}>delete</button><br />
{/each}
<form
	on:submit|preventDefault={async () => {
		const result = computersStore.create(value);
		value.text = '';
		await result;
	}}
>
	<input type="text" bind:value={value.text} /><button type="submit">add new</button>
</form>
