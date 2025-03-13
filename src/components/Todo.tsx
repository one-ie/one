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