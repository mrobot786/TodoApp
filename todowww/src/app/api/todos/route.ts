import { ApiResponse, Todo } from '@/types/todos';
import { NextResponse } from 'next/server';

const API_URL = 'https://todoapp-c3rq.onrender.com/todos'; //'http://localhost:8000/todos'; <---local Backend

export async function GET(): Promise<NextResponse<ApiResponse<Todo[]>>> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch todos');
    const data: ApiResponse<Todo[]> = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<Todo | ApiResponse<Todo>>> {
  try {
    const { title }: { title: string } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    const data: Todo = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request
): Promise<NextResponse<Todo | ApiResponse<Todo>>> {
  try {
    const {
      id,
      title,
      completed,
    }: { id: number; title: string; completed: boolean } = await req.json();
    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID and Title are required' },
        { status: 400 }
      );
    }
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed }),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    const data: Todo = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const { id }: { id: number } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete todo');
    return NextResponse.json(
      { message: 'Todo deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
