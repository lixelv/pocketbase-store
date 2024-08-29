<script lang="ts">
	import { PocketBaseStore } from '$lib/index.js';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	type SubRecord = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		name: string;
		desc: string;
		[key: string]: any;
	};

	let pbList = writable([] as SubRecord[]) as Writable<SubRecord[]> & { data: any };

	onMount(() => {
		const pb = new PocketBaseStore('https://pocketbase-control-hub.fly.dev/');
		pbList = pb.collection('test').store<SubRecord[]>({ sort: '-name,-created' });
	});

	let value = '';
</script>

{#each $pbList as item, index}
	<p>
		<span>
			Item {index}: {item.name}
		</span>
		<span>
			Desc: {item.desc}
		</span>
		<span>
			Created: {item.created}
		</span>
	</p>
{/each}

<input bind:value />
<button on:click={() => pbList.data.create({ name: value, desc: 't' })}>Add</button>
