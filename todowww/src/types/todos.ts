export interface Todo {
  id: number;
  title: string;
}

export interface ApiResponse<T> {
  todos?: T[]; // For GET request
  todo?: T; // For single item (POST, PUT, DELETE)
  message?: string;
  error?: string; // For error handling
}
