---
layout: ../../layouts/Text.astro
title: "Building a Todo App with ONE"
description: "Step-by-step tutorial for creating a Todo application"
aiProvider: "openai"
aiModel: "gpt-4o-mini"
temperature: 0.7
maxTokens: 4000
systemPrompt: "You are a helpful coding tutor specializing in the ONE framework. Your role is to help users understand how to build a Todo application using ONE. You provide clear, accurate code explanations, troubleshooting advice, and best practices for React, TypeScript, and Astro development."
welcomeMessage: "👋 Hello! I'm your coding assistant for this Todo app tutorial. Ask me anything about the code, concepts, or if you get stuck!"
avatar: "/icon.svg"
suggestions:
  - label: "🤔 Explain the Code"
    prompt: "Can you explain how the Todo component works in detail?"
  - label: "🐛 Fix Common Errors"
    prompt: "What are common errors when building this Todo app and how do I fix them?"
  - label: "🚀 Next Steps"
    prompt: "How can I extend this Todo app with additional features?"
  - label: "💡 TypeScript Tips"
    prompt: "Can you explain the TypeScript types used in this tutorial?"
contentPrefix: "### Tutorial Content:"
---

# Building a Todo App with ONE

This tutorial will guide you through building a simple Todo application using the ONE framework. We'll create a fully functional Todo app with the ability to add, complete, and delete tasks.

## Project Setup

First, make sure you have the ONE framework installed:

```bash
# Create a new ONE project if you haven't already
pnpm create astro@latest my-todo-app -- --template one

# Navigate to your project
cd my-todo-app

# Install dependencies
pnpm install
```

## Creating the Todo Component

Let's start by creating a Todo component. Create a new file at `src/components/Todo.tsx`:

```tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Trash2 } from 'lucide-react';

// Define the Todo item type
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function Todo() {
  // State for the list of todos and the input value
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Add a new todo
  const addTodo = () => {
    if (inputValue.trim() === '') return;
    
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: inputValue,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Todo App</h2>
      
      {/* Input form */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1"
        />
        <Button onClick={addTodo}>Add</Button>
      </div>
      
      {/* Todo list */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground">No tasks yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  id={`todo-${todo.id}`}
                />
                <label 
                  htmlFor={`todo-${todo.id}`}
                  className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {todo.text}
                </label>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteTodo(todo.id)}
                className="h-8 w-8 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      
      {/* Summary */}
      {todos.length > 0 && (
        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            {todos.filter(t => t.completed).length} of {todos.length} tasks completed
          </p>
        </div>
      )}
    </div>
  );
}
```

## Creating the Todo Page

Now, let's create a page to display our Todo component. Create a new file at `src/pages/todo.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import Todo from "../components/Todo";
---

<Layout title="Todo App | ONE Framework">
  <main class="container mx-auto py-12">
    <h1 class="text-4xl font-bold text-center mb-8">Todo App</h1>
    <p class="text-center text-muted-foreground mb-8 max-w-md mx-auto">
      A simple Todo application built with ONE framework, React, and Shadcn UI.
    </p>
    
    <Todo client:load />
  </main>
</Layout>
```

## How It Works

Let's break down the key parts of our Todo application:

### State Management

We use React's `useState` hook to manage our application state:

```tsx
const [todos, setTodos] = useState<TodoItem[]>([]);
const [inputValue, setInputValue] = useState('');
```

### Adding Todos

The `addTodo` function creates a new todo item with a unique ID:

```tsx
const addTodo = () => {
  if (inputValue.trim() === '') return;
  
  const newTodo: TodoItem = {
    id: crypto.randomUUID(),
    text: inputValue,
    completed: false
  };
  
  setTodos([...todos, newTodo]);
  setInputValue('');
};
```

### Toggling Completion

The `toggleTodo` function updates the completion status:

```tsx
const toggleTodo = (id: string) => {
  setTodos(
    todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
};
```

### Deleting Todos

The `deleteTodo` function removes a todo from the list:

```tsx
const deleteTodo = (id: string) => {
  setTodos(todos.filter(todo => todo.id !== id));
};
```

## Styling with Shadcn UI

We're using Shadcn UI components for a clean, modern interface:

- `Button` for actions
- `Input` for text entry
- `Checkbox` for marking todos as complete

The styling is handled through Tailwind CSS classes, making it easy to customize the appearance.

## TypeScript Integration

We define a `TodoItem` interface to ensure type safety:

```tsx
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
```

This helps catch errors at compile time and provides better editor support.

## Astro Integration

The Todo component is a React component, but we're using it in an Astro page with the `client:load` directive:

```astro
<Todo client:load />
```

This tells Astro to hydrate the component on the client side as soon as the page loads, making it interactive.

## Extending the App

Here are some ways you could extend this Todo app:

1. **Persistence**: Add local storage to save todos between sessions
2. **Categories**: Allow users to categorize todos
3. **Due Dates**: Add due dates and reminders
4. **Filtering**: Add options to filter by completion status
5. **Drag and Drop**: Implement drag and drop to reorder todos

## Troubleshooting

### Common Issues

#### "Property 'randomUUID' does not exist on type 'Crypto'"

If you encounter this error, you may need to update your TypeScript configuration. Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ESNext"]
  }
}
```

#### Component not interactive

If your Todo component isn't interactive, make sure you're using the `client:load` directive in your Astro page:

```astro
<Todo client:load />
```

#### Styling issues

If the styling doesn't look right, ensure you've set up Shadcn UI correctly. Check that your `tailwind.config.mjs` includes the necessary configuration.

## Conclusion

Congratulations! You've built a functional Todo application using the ONE framework. This example demonstrates how to:

- Create interactive React components
- Use TypeScript for type safety
- Integrate with Shadcn UI components
- Implement basic CRUD operations
- Structure an Astro page

Feel free to use this as a starting point for more complex applications. The patterns demonstrated here can be applied to a wide range of web applications. 