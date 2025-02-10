import { trpc } from "../utils/trpc";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      setUserId(storedUserId);
      if (!storedUserId) {
        window.location.href = "/auth/Login";
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    window.location.href = "/auth/Login";
  };

  const { data: todos, refetch } = trpc.todo.getTodos.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const addTodo = trpc.todo.addTodo.useMutation({ onSuccess: () => refetch() });
  const toggleTodo = trpc.todo.toggleTodo.useMutation({ onSuccess: () => refetch() });
  const deleteTodo = trpc.todo.deleteTodo.useMutation({ onSuccess: () => refetch() });
  const editTodo = trpc.todo.editTodo.useMutation({ onSuccess: () => refetch() });

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleAddTodo = useMemo(() => {
    return () => {
      if (title.trim() && text.trim()) {
        addTodo.mutate({ title, text, userId });
        setTitle("");
        setText("");
      }
    };
  }, [title, text, userId, addTodo]);

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editText.trim()) {
      editTodo.mutate({ id: editingId, title: editTitle, text: editText });
      setEditingId(null);
      setEditTitle("");
      setEditText("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center py-12 px-4">
      <div className="flex justify-between w-full max-w-lg">
        <h1 className="text-4xl font-extrabold mb-6 text-blue-400 shadow-md">T3 To-Do List</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 text-sm rounded-md hover:bg-red-600 transition duration-200 transform hover:scale-105 shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Todo Input Box */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          className="w-full p-3 rounded-md mb-3 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-3 rounded-l-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Task description..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleAddTodo}
            className="bg-blue-500 px-6 py-3 rounded-r-md hover:bg-blue-600 transition duration-200 transform hover:scale-105 shadow-md"
          >
            Add
          </button>
        </div>
      </div>

      {/* Todo List */}
      <ul className="w-full max-w-lg mt-6 space-y-4">
        {todos?.length > 0 ? (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md hover:shadow-lg transition duration-300"
            >
              {editingId === todo.id ? (
                <div className="flex w-full items-center space-x-4">
                  <input
                    type="text"
                    className="w-1/2 p-2 rounded-md bg-gray-700 text-white border border-gray-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-1/2 p-2 rounded-md bg-gray-700 text-white border border-gray-500"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex w-full justify-between items-center space-x-4">
                  <div className="cursor-pointer" onClick={() => toggleTodo.mutate({ id: todo.id })}>
                    
                    <div style={{display:"flex",gap:"10px"}}>
                    <p className="font-semibold text-lg text-blue-300">{todo.title}</p>
                    <p
                      className={`text-lg ${
                        todo.completed ? "line-through text-gray-400" : "text-white"
                      }`}
                    >
                      {todo.text}
                    </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {editingId !== todo.id && (
                      <button
                        onClick={() => handleEdit(todo)}
                        className="text-yellow-400 hover:text-yellow-500 transition duration-200 transform hover:scale-110"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo.mutate({ id: todo.id })}
                      className="text-red-500 hover:text-red-700 transition duration-200 transform hover:scale-110"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-400 text-center mt-4">No tasks found.</p>
        )}
      </ul>
    </div>
  );
}
