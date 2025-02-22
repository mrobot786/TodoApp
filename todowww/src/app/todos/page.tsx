'use client';
import { Todo } from '@/types/todos';
import { useEffect, useState } from 'react';

export default function TodosHome() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () =>
    fetch('/api/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((error) => console.error('Error fetching todos:', error));

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: newTodo }),
    });

    if (res.ok) {
      const todo = await res.json();
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const editTodo = async () => {
    if (!editingTodo) return;

    const res = await fetch('/api/todos', {
      method: 'PUT',
      body: JSON.stringify({ id: editingTodo.id, title: editingTodo.title }),
    });

    if (res.ok) {
      setEditingTodo(null);
      fetchTodos();
    }
  };

  // Delete Todo
  const deleteTodo = async (id: number) => {
    const res = await fetch('/api/todos', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      fetchTodos();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Todo App</h1>

      {/* Add Todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 flex-grow rounded"
          placeholder="Enter a todo..."
          value={editingTodo ? editingTodo.title : newTodo}
          onChange={(e) =>
            editingTodo
              ? setEditingTodo({ ...editingTodo, title: e.target.value })
              : setNewTodo(e.target.value)
          }
          onKeyDown={(e) => {
            const code = e.code.toLocaleLowerCase();
            if (code === 'enter') {
              if (editingTodo) {
                editTodo();
              } else {
                addTodo();
              }
            }
          }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={editingTodo ? editTodo : addTodo}
        >
          {editingTodo ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Todos List */}
      <ul className="space-y-2 flex flex-col">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center bg-gray-100 p-2 rounded"
          >
            <span className="flex-1">{todo.title}</span>
            <div className="space-x-2 w-fit">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => setEditingTodo(todo)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
