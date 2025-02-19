"use client"
import {trpc} from "../utils/trpc";
import {useState,useEffect,useMemo} from "react";
import Sortable from "sortablejs";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [username, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const todosPerPage = 3;
  const [createdTime, setCreatedTime] = useState("");


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setName(storedUser.name || "Guest");
  },[]);


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
  console.log("todos are", todos);

  const addTodo = trpc.todo.addTodo.useMutation({ onSuccess: () => refetch() });
  const toggleTodo = trpc.todo.toggleTodo.useMutation({ onSuccess: () => refetch() });
  const deleteTodo = trpc.todo.deleteTodo.useMutation({ onSuccess: () => refetch() });
  const editTodo = trpc.todo.editTodo.useMutation({ onSuccess: () => refetch() });

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleAddTodo = useMemo(() => {
    return () => {
      if (title.trim() && text.trim()) {
        addTodo.mutate({ title, text, userId, createdTime });
        setTitle("");
        setText("");
        setCreatedTime("");
      }
    };
  }, [title, text, userId, createdTime, addTodo]);

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editText.trim()) {
      editTodo.mutate({id:editingId,title:editTitle,text:editText});
      setEditingId(null);
      setEditTitle("");
      setEditText("");
    }
  };

  const filteredTodos = (todos || []).filter((todo) =>
    todo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const reorderTodos = trpc.todo.reorderTodos.useMutation({onSuccess:()=>refetch()});
  const handleDragEnd = (evt) => {
    const reorderedTodos = [...todos];
    const draggedTodo = reorderedTodos.splice(evt.oldIndex, 1)[0];
    reorderedTodos.splice(evt.newIndex,0,draggedTodo);
    reorderTodos.mutate({
    userId,
    orderedTodoIds: reorderedTodos.map((todo) => todo.id),
    });
  };
  
  const indexOfLastTodo = (currentPage + 1) * todosPerPage; // Shift index calculation
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  // Pagination logic ends here

  useEffect(() => {
    if (todos) {
      const sortableInstance = Sortable.create(document.getElementById("todo-list"), {
        onEnd: handleDragEnd,
      });
      return () => {
        sortableInstance.destroy();
      };
    }
  }, [todos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center py-12 px-4">
      <h2 className="text-3xl font-bold text-green-400 mb-4 animate-fadeIn">
        🌟Welcome, <span className="text-red-400 font-bold">{username}</span>! 🌟

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-3 text-sm rounded-md hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </h2>

      <div className="flex justify-between w-full max-w-lg">
        
        <h1 className="text-4xl font-extrabold mb-6 text-blue-400 shadow-md">
          T3 To-Do List
        </h1>
      </div>
      

     <input
        type="text"
        className="w-full max-w-lg p-3 rounded-md mb-3 bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          className="w-full p-3 rounded-md mb-3 bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex">
        <input
        type="text"
        className="flex-1 p-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
        placeholder="Task description..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        />

        <span className="text-white mt-3">Task:</span>
        <input
        type="date"
        className="p-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={createdTime}
        onChange={(e) => setCreatedTime(e.target.value)}
        />

          <button
          onClick={handleAddTodo}
          className="bg-blue-500 px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
          >
            Add
          </button>
        </div>
      </div>

      <div
        id="todo-list"
        className="w-full max-w-lg mt-6 space-y-4"
      >
        {currentTodos?.length > 0 ? (
          currentTodos.map((todo, index) => (
            <div
              key={todo.id}
              
className="bg-gradient-to-r from-gray-900 via-black to-gray-800 p-6 rounded-3xl flex items-center shadow-xl hover:shadow-gray-900 transition-all duration-300 transform hover:scale-105 text-white text-xl  border border-black hover:border-gray-500"
  
              data-id={todo.id}
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
                <div className="flex w-full justify-between items-center space-x-5">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleTodo.mutate({ id: todo.id })}
                  >
                    <div style={{ display: "flex", gap: "20px" }}>
                      <p
                        className={`text-lg text-white ${todo.completed ? "line-through text-gray-400" : ""}`}
                      >
                        {todo.title.length > 9 ? `${todo.title.slice(0, 7)}...` : todo.title}
                      </p>

                      <p
                        className={`text-white ${todo.completed ? "line-through text-gray-400" : ""}`}
                      >
                        {todo.text.length > 12 ? `${todo.text.slice(0, 10)}...` : todo.text}
                      </p>

                <p className={`text-sm ${todo.completed ? "line-through text-gray-400 mt-2" : "text-blue-500"}`}>
                 {new Date(todo.createdTime).toLocaleDateString()}
                </p>

                <p className={`text-sm ${todo.completed ? "line-through text-gray-400 mt-2" : "text-blue-500"}`}>
                 {todo.finishedTime?new Date(todo.finishedTime).toLocaleDateString():"Fullfill commitment first"}
                </p>
                
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-blue-500 hover:text-blue-400 mr-2"
                    >
                    ✏
                    </button>
                    <button
                      onClick={() => deleteTodo.mutate({ id: todo.id })}
                      className="text-red-500 hover:text-red-400"
                    >
                    🗑
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No todos available.</p>
        )}
      </div>

      <div className="mt-4 flex justify-between w-full max-w-lg">
        <button
          onClick={handlePrevPage}
          className="bg-gray-600 px-4 py-2 text-white rounded-md hover:bg-gray-700 transition duration-200"
        >
          Prev
        </button>
        <button
          onClick={handleNextPage}
          className="bg-gray-600 px-4 py-2 text-white rounded-md hover:bg-gray-700 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}


