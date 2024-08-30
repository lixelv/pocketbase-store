<!-- <script lang="ts">
	import { getDate, PocketBaseStore } from '$lib/index.js';

	type TodoItem = {
		id: string;
		created: string;
		updated: string;
		collectionId: string;
		collectionName: string;
		title: string;
		completed: boolean;
	};

	let newTodoTitle = '';

	const pb = new PocketBaseStore('https://pocketbase-control-hub.fly.dev/');
	const todoStore = pb.collection('todos').store<TodoItem>({ sort: '-title,created' });

	function addTodo() {
		if (newTodoTitle.trim()) {
			todoStore.create({ title: newTodoTitle, completed: false });
			newTodoTitle = '';
		}
	}

	function toggleTodo(todo: TodoItem, event: { target: { checked: boolean } }) {
		todoStore.update({ ...todo, completed: event.target.checked });
		);
	}

	function deleteTodo(todo: TodoItem) {
		todoStore.delete(todo);
	}

	));
</script>

<input bind:value={newTodoTitle} placeholder="New todo" />
<button on:click={addTodo}>Add Todo</button> -->

<!-- {@debug $todoStore} -->

<!-- {#if todoStore}
	{#each $todoStore as todo (todo.id)}
		<div>
			<input type="checkbox" checked={todo.completed} />
			<span>{todo.title}</span>
			<button on:click={() => deleteTodo(todo)}>Delete</button>
			{todo.created}
		</div>
	{/each}
{/if} -->

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

	export let data: { test: TestItem[] };

	const pb = new PocketBase('https://pocketbase-control-hub.fly.dev/');
	const testStore = pb.collection('test').store<TestItem>({ sort: '-name,created' }, data.test);

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
	{item.name}
	<button on:click={() => testStore.delete(item)}>Delete</button>
	<br />
{/each}
