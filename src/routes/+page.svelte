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

	// export let data: { test: TestItem[] };

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	pb.admins.authWithPassword('controlhub4@gmail.com', 'oqHjDn5Cm_w7jBIlOZVwWhzElP2kfb1S');
	pb.autoCancellation(false);

	if (browser) {
		pb.collection('computers').subscribe('*', (event) => {
			console.log('DEBUG', event);
		});
	}

	const computersStore = createCollectionStore<TestItem>(
		pb,
		'computers',
		{
			sort: '-updated',
			filter: `region.name = "killme232" && region.team.name = "lixelv's team"`
		},
		data.computers
	);

	if (browser) {
		computersStore.subscribeOnPocketBase();
		computersStore.getData();
	}
</script>

{#each $computersStore as item}
	name - {item.name} <br />
{/each}
