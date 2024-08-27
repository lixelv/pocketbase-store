<script lang="ts">
	import PocketBase from 'pocketbase';
	import { pbStore } from '$lib/index.ts';

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

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	const pbList = pbStore.list<SubRecord[]>(pb, 'test', { sort: '-name,-created' });

	let value = '';
	pbList.collection.update;
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
<button on:click={() => pbList.collection.create({ name: value, desc: 't' })}>Add</button>
