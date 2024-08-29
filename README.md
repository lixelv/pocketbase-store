# PocketBaseStore Documentation

PocketBaseStore is a library that extends PocketBase functionality with Svelte stores, providing reactive data management for your PocketBase collections.

## Installation

```bash
npm install pocketbase-store
```

## Usage

### Initializing PocketBaseStore

First, create an instance of PocketBaseStore:

```typescript
import { PocketBaseStore } from 'pocketbase-store';

const pb = new PocketBaseStore('https://your-pocketbase-url.com');
```

### Creating a Collection Store

To create a reactive store for a collection:

```typescript
const todoStore = pb.collection('todos').store<TodoItem[]>({ sort: '-created' });
```

This creates a Svelte store that automatically updates when the collection changes.

### Using the Store in a Svelte Component

```svelte
<script lang="ts">
	import { PocketBaseStore } from 'pocketbase-store';
	import { onMount } from 'svelte';

	type TodoItem = {
		id: string;
		title: string;
		completed: boolean;
	};

	let todoStore;

	onMount(() => {
		const pb = new PocketBaseStore('https://your-pocketbase-url.com');
		todoStore = pb.collection('todos').store<TodoItem[]>({ sort: '-created' });
	});
</script>

{#if todoStore}
	{#each $todoStore as todo}
		<div>
			<input type="checkbox" bind:checked={todo.completed} />
			{todo.title}
		</div>
	{/each}
{/if}
```

### Adding Items to the Collection

To add a new item to the collection:

```svelte
<script lang="ts">
	let newTodoTitle = '';

	function addTodo() {
		todoStore.data.create({ title: newTodoTitle, completed: false });
		newTodoTitle = '';
	}
</script>

<input bind:value={newTodoTitle} />
<button on:click={addTodo}>Add Todo</button>
```

### Updating Items in the Collection

To update an existing item:

```svelte
<script lang="ts">
	function updateTodo(todo: TodoItem) {
		todoStore.data.update(todo);
	}
</script>

{#each $todoStore as todo}
	<div>
		<input type="checkbox" bind:checked={todo.completed} on:change={() => updateTodo(todo)} />
		{todo.title}
	</div>
{/each}
```

### Deleting Items from the Collection

To delete an item from the collection:

```svelte
<script lang="ts">
	function deleteTodo(id: string) {
		todoStore.data.delete(id);
	}
</script>

{#each $todoStore as todo}
	<div>
		{todo.title}
		<button on:click={() => deleteTodo(todo.id)}>Delete</button>
	</div>
{/each}
```

## API Reference

### PocketBaseStore

Extends the PocketBase class with additional functionality.

#### Methods

- `collection(idOrName: string): RecordServiceStore<M>`
  Returns a RecordServiceStore for the specified collection.

### RecordServiceStore

Extends RecordService with additional store functionality.

#### Methods

- `store<T extends Record[]>(options?: SendOptions, initialValue?: T): Writable<T> & { data: { create: Function, update: Function, delete: Function } }`
  Creates a Svelte store for the collection with methods for creating, updating, and deleting records.

- `itemStore<T extends Record>(initialValue: T): Writable<T>`
  Creates a Svelte store for a single record.

### SendOptions

Options for configuring the store:

- `expand?: string`
- `fields?: string`
- `filter?: string`
- `sort?: string`
- `expirationTime?: number`

## Best Practices

1. Initialize PocketBaseStore in an onMount callback to ensure it's only created on the client-side.
2. Use TypeScript interfaces or types for your records to ensure type safety.
3. Utilize the sort option when creating stores to keep your data organized.
4. Handle loading states appropriately, as initial data fetching is asynchronous.

## Troubleshooting

If you encounter issues with reactivity:

1. Ensure you're using the store value with the $ prefix (e.g., $todoStore).
2. Check that you're not mutating the store data directly. Always use the provided methods (create, update, delete) to modify data.
3. Verify that your PocketBase server is running and accessible.

For more advanced usage and configuration options, refer to the PocketBase documentation.
