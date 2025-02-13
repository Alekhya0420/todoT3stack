"use client"
import { trpc } from "../utils/trpc";
import { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const[username,setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const todosPerPage = 3;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}"); 
    setName(storedUser.name || "Guest");
  }, []);
  
  
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
  const editTodo = trpc.todo.editTodo.useMutation({ onSuccess: ()=>refetch()});

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
      editTodo.mutate({id:editingId,title:editTitle,text:editText});
      setEditingId(null);
      setEditTitle("");
      setEditText("");
    }
  };
    
  const filteredTodos = (todos || []).filter(todo =>
    todo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const reorderTodos = trpc.todo.reorderTodos.useMutation({ onSuccess: () => refetch() });

  const handleDragEnd = (result) => {
    if (!result.destination || !todos) return; 
  
    const reorderedTodos = [...todos]; 
    const [movedItem] = reorderedTodos.splice(result.source.index, 1);
    reorderedTodos.splice(result.destination.index, 0, movedItem);
  
    reorderTodos.mutate({ 
      userId, 
      orderedTodoIds: reorderedTodos.map((todo) => todo.id) 
    });
  };
  //pagination logic starts here
  const indexOfLastTodo = (currentPage + 1) * todosPerPage; // Shift index calculation
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);


  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {  
      setCurrentPage(prev => prev - 1);
    }
  };
  //pagination logic ends here
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center py-12 px-4">
    
    <h2 className="text-3xl font-bold text-green-400 mb-4 animate-fadeIn">
        🌟 Welcome, <span className="text-yellow-400">{username}</span>! 🌟
        <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-3 text-sm rounded-md hover:bg-red-600 transition duration-200">Logout</button>        
    </h2>

      <div className="flex justify-between w-full max-w-lg">
        <h1 className="text-4xl font-extrabold mb-6 text-blue-400 shadow-md">T3 To-Do List</h1>
      </div>
      <input type="text" className="w-full max-w-lg p-3 rounded-md mb-3 bg-gray-900 text-white border border-gray-600" placeholder="Search tasks..." value={searchQuery} onChange={(e) =>setSearchQuery(e.target.value)}/>              

      <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <input type="text" className="w-full p-3 rounded-md mb-3 bg-gray-900 text-white border border-gray-600" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex">
          <input type="text" className="flex-1 p-3 rounded-l-md bg-gray-900 text-white border border-gray-600" placeholder="Task description..." value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={handleAddTodo} className="bg-blue-500 px-6 py-3 rounded-r-md hover:bg-blue-600 transition duration-200">Add</button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <ul className="w-full max-w-lg mt-6 space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
              {currentTodos?.length > 0 ? (
                currentTodos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md hover:shadow-lg">
                        {editingId === todo.id ? (
                          <div className="flex w-full items-center space-x-4">
                            <input type="text" className="w-1/2 p-2 rounded-md bg-gray-700 text-white border border-gray-500" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            <input type="text" className="w-1/2 p-2 rounded-md bg-gray-700 text-white border border-gray-500" value={editText} onChange={(e) => setEditText(e.target.value)} />
                            <button onClick={handleSaveEdit} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Save</button>
                          </div>
                        ) : (
                          <div className="flex w-full justify-between items-center space-x-5">
                            <div className="cursor-pointer" onClick={() => toggleTodo.mutate({ id: todo.id })}>
                              <div style={{ display: "flex", gap: "30px" }}>

  <p className="font-semibold text-lg text-blue-300">{todo.title}</p>   
  <p className={`text-lg text-white ${todo.completed ? "line-through text-gray-400" : ""}`}>
  {todo.text.length > 9 ? `${todo.text.slice(0, 9)}...` : todo.text}
  </p>
                
            <p className={`text-sm ${todo.completed ? "line-through text-gray-400 mt-2" : "text-blue-500"}`}>
                {new Date(todo.createdTime).toLocaleDateString()}
            </p>

            <p className={`text-sm ${todo.completed ? "line-through text-gray-400 mt-2" : "text-blue-500"}`}>
                {todo.finishedTime?new Date(todo.finishedTime).toLocaleDateString():"Fullfill commitment first"}
            </p>

                              </div>
                            </div>
                            <div className="flex space-x-3">
                              {editingId !== todo.id && (
                                <button onClick={() => handleEdit(todo)} className="text-yellow-400 hover:text-yellow-500">✏️</button>
                              )}
                              <button onClick={() => deleteTodo.mutate({ id: todo.id })} className="text-red-500 hover:text-red-700">❌</button>
                            </div>
                          </div>
                        )}
                      </li>
                    )}
                  </Draggable>
                ))
              ) : (
                <p className="text-gray-400 text-center mt-4">No tasks found.</p>
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

<div className="mt-4 flex gap-2">
<button onClick={handlePrevPage}  
className="px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>Prev</button>

<span className="text-lg font-semibold text-white bg-red-700 px-4 py-2 rounded-lg shadow-md">
{currentPage+1}/{totalPages}
</span>

<button onClick={handleNextPage}  
  className="px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
Next</button>
</div>

      
    </div>
  );
}


