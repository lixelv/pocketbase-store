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

	if (browser) {
		pb.collection('test').subscribe('*', (event) => {
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

	onMount(async () => {
		const data = await computersStore.getData();
		const subscription = await computersStore.subscribeOnPocketBase();
		const ip = fetch('https://api.ipify.org?format=json');
		// .then((response) => response.json())
		// .then((data) => (ip = data.ip));

		await data;
		await subscription;
		value.ip = (await (await ip).json()).ip;
	});

	onDestroy(async () => {
		await computersStore.unsubscribeFromPocketBase();
	});

	let ip: null | string = null;
</script>

{#each $computersStore as item}
	{item.ip == value.ip ? 'you' : item.ip} - {item.text}
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
