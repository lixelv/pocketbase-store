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
	};

	let value = {
		text: ''
	};

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	pb.autoCancellation(false);

	const testStore = createCollectionStore<TestItem>(pb, 'test', {
		sort: '-updated'
	});

	onMount(async () => {
		await testStore.subscribeOnPocketBase();
		await testStore.getData();
	});

	onDestroy(async () => {
		await testStore.unsubscribeFromPocketBase();
	});

	// onMount( async () => {
	// 	if (browser) {}});
</script>

<input bind:value={value.text} />
<button
	on:click={async () => {
		console.log(101);
		await testStore.create(value);
	}}>Send</button
>
<div class="flex flex-col">
	{#each $testStore as item (item.id)}
		<p>{item.id} {item.text}</p>
	{/each}
</div>
