from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import Column, Integer, String, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# SQLite Database
DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


# Database Model
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)


# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI()

# Allow frontend (Next.js) to access the API
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to manage DB session
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide DB session
    finally:
        db.close()  # Ensure session is closed


# Pydantic Model (for API request validation)
class TodoCreate(BaseModel):
    title: str
    completed: bool = False


class TodoResponse(TodoCreate):
    id: int


# Routes


@app.get("/todos", response_model=List[TodoResponse])
def get_todos(db: Session = Depends(get_db)):  # Injecting the session
    return db.query(Todo).all()


@app.post("/todos", response_model=TodoResponse)
def create_todo(
    todo: TodoCreate, db: Session = Depends(get_db)
):  # Injecting the session
    new_todo = Todo(title=todo.title, completed=todo.completed)
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int, todo: TodoCreate, db: Session = Depends(get_db)
):  # Injecting the session
    todo_item = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo_item:
        raise HTTPException(status_code=404, detail="Todo not found")

    todo_item.title = todo.title
    todo_item.completed = todo.completed
    db.commit()
    db.refresh(todo_item)
    return todo_item


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):  # Injecting the session
    todo_item = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo_item:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo_item)
    db.commit()
    return {"message": "Todo deleted successfully"}


# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# from sqlalchemy import Column, Integer, String, Boolean, create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # SQLite Database
# DATABASE_URL = "sqlite:///./todos.db"
# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(bind=engine, autoflush=False)
# Base = declarative_base()


# # Database Model
# class Todo(Base):
#     __tablename__ = "todos"

#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     completed = Column(Boolean, default=False)


# # Create tables
# Base.metadata.create_all(bind=engine)

# # FastAPI App
# app = FastAPI()
# # Allow frontend (Next.js) to access the API
# origins = [
#     "http://localhost:3000",  # Next.js local dev server
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
#     allow_headers=["*"],  # Allow all headers
# )


# # Pydantic Model (for API request validation)
# class TodoCreate(BaseModel):
#     title: str
#     completed: bool = False


# class TodoResponse(TodoCreate):
#     id: int


# # In-memory database session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # Routes
# @app.get("/todos", response_model=List[TodoResponse])
# def get_todos():
#     db = SessionLocal()
#     todos = db.query(Todo).all()
#     return todos


# @app.post("/todos", response_model=TodoResponse)
# def create_todo(todo: TodoCreate):
#     db = SessionLocal()
#     new_todo = Todo(title=todo.title, completed=todo.completed)
#     db.add(new_todo)
#     db.commit()
#     db.refresh(new_todo)
#     return new_todo


# @app.put("/todos/{todo_id}", response_model=Todo)
# def update_todo(todo_id: int, todo: Todo):
#     db = SessionLocal()
#     todo_item = db.query(Todo).filter(Todo.id == todo_id).first()
#     if not todo_item:
#         raise HTTPException(status_code=404, detail="Todo not found")
#     todo_item.title = todo.title
#     db.commit()
#     db.refresh(todo_item)
#     return todo_item


# @app.delete("/todos/{todo_id}")
# def delete_todo(todo_id: int):
#     db = SessionLocal()
#     todo_item = db.query(Todo).filter(Todo.id == todo_id).first()
#     if not todo_item:
#         raise HTTPException(status_code=404, detail="Todo not found")
#     db.delete(todo_item)
#     db.commit()
#     return {"message": "Todo deleted successfully"}
