# PocketBaseStore Documentation

PocketBaseStore is a Svelte-friendly wrapper for PocketBase that provides reactive stores for collections and individual records.

## Installation

'''bash
npm install pocketbase-store
'''

## Key Features

1. Collection Stores
2. Item Stores
3. Real-time updates
4. Sorting and filtering
5. Type-safe with generics

## Usage

### Initializing PocketBaseStore

'''typescript
import { PocketBaseStore } from 'pocketbase-store';

const pb = new PocketBaseStore('https://your-pocketbase-url.com');
'''

### Collection Store

Create a reactive store for a collection:

'''typescript
import type { Record } from 'pocketbase-store';

interface TodoItem extends Record {
title: string;
completed: boolean;
}

const todoStore = pb.collection<TodoItem>('todos').store({
sort: '-created,title', // Sort by creation date (descending) and then by title
filter: 'completed = false', // Only fetch uncompleted todos
expand: 'user', // Expand the user field
});
'''

### Item Store

Create a reactive store for a single item:

'''typescript
const todoItemStore = pb.collection<TodoItem>('todos').itemStore(initialTodoItem);
'''

### Options

- `sort`: Specify sorting order (e.g., '-created,title')
- `filter`: Apply filters to the query
- `expand`: Expand relations
- `fields`: Specify which fields to return

### Full Todo App Example

'''svelte

<script lang="ts">
import { PocketBaseStore } from 'pocketbase-store';
import { onMount } from 'svelte';
import type { Writable } from 'svelte/store';

interface TodoItem {
 id: string;
 title: string;
 completed: boolean;
}

let todoStore: Writable<TodoItem[]> & { data: any };
let newTodoTitle = '';

onMount(() => {
 const pb = new PocketBaseStore('https://your-pocketbase-url.com');
 todoStore = pb.collection<TodoItem>('todos').store({
   sort: '-created',
   filter: 'completed = false'
 });
});

function addTodo() {
 if (newTodoTitle.trim()) {
   todoStore.data.create({ title: newTodoTitle, completed: false });
   newTodoTitle = '';
 }
}

function toggleTodo(todo: TodoItem) {
 todoStore.data.update({ ...todo, completed: !todo.completed });
}

function deleteTodo(id: string) {
 todoStore.data.delete(id);
}
</script>

<input bind:value={newTodoTitle} placeholder="New todo" />
<button on:click={addTodo}>Add Todo</button>

{#if todoStore}
{#each $todoStore as todo}

   <div>
     <input type="checkbox" checked={todo.completed} on:change={() => toggleTodo(todo)} />
     <span>{todo.title}</span>
     <button on:click={() => deleteTodo(todo.id)}>Delete</button>
   </div>
 {/each}
{/if}
'''

This example demonstrates:

- Creating a typed collection store
- Real-time updates
- Adding, updating, and deleting items
- Sorting and filtering

Note: The store automatically updates when changes occur in the database, providing real-time functionality.
