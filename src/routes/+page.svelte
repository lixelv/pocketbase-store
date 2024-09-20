<script lang="ts">
	import PocketBase from '$lib/index.js';

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
	// const testStore = pb.collection('test').store<TestItem>({ sort: '-name,created' }, data.test);
	const testStore = pb.collection('test').storeItem<TestItem>('rhot1q2hgy03mkk');

	let value = '';
</script>

<input type="text" bind:value={$testStore.name} />
<button on:click={async () => await testStore.send()}>Send</button>

<!-- <form
	on:submit|preventDefault={() => {
		testStore.create({ name: value });
		value = '';
	}}
>
	<input type="text" bind:value />
	<button type="submit">Add</button>
</form>
{#each $testStore as item}
	{item.name}{item.id}
	<button on:click={() => testStore.delete(item)}>Delete</button>
	<br />
{/each} -->
