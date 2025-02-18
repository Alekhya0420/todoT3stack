"use client";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Adminsubadmin = () => {
  const [subadmin, setSubadmin] = useState(null);
  const router = useRouter();
  const { data: users, isLoading: usersLoading, refetch } = trpc.todo.getAllUsersWithTodos.useQuery();
  const { data: registeredUsers, isLoading: registeredUsersLoading } = trpc.auth.getAllUsers.useQuery();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setSubadmin(user.name);
    }
  }, []);
  console.log("subadmin is", subadmin);

  console.log("todo user", users);
  console.log("registered user", registeredUsers);

  const deleteTodo = trpc.todo.deleteTodo.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateTodo = trpc.todo.editTodo.useMutation({
    onSuccess: () => {
      refetch();
      setEditTodo(null);
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editTodo, setEditTodo] = useState(null);
  const usersPerPage = 5;

  console.log("users are", users);

  if (usersLoading || registeredUsersLoading) return <p>Loading...</p>;

  const totalUsers = registeredUsers?.length || 0;
  const totalTodos = users?.flatMap((user) => user.todos).length || 0;
  const completedTodos = users?.flatMap((user) => user.todos).filter((todo) => todo.completed).length || 0;
  const pendingTodos = totalTodos - completedTodos;

  const backtoOld = () => {
    router.push("/admin/Admin");
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleEditTodo = (todo) => {
    setEditTodo(todo);
  };

  const handleSaveEdit = () => {
    if (editTodo) {
      updateTodo.mutate({
        id: editTodo.id,
        title: editTodo.title,
        text: editTodo.text,
        completed: editTodo.completed,
        createdTime: editTodo.createdTime,
        finishedTime: editTodo.finishedTime,
      });
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Welcome {subadmin}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-lg font-semibold">Total Registered Users</h2>
          <p className="text-4xl font-bold text-blue-400 mt-2">{totalUsers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-lg font-semibold">Total Todos</h2>
          <p className="text-4xl font-bold text-yellow-400 mt-2">{totalTodos}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-lg font-semibold">Completed / Pending Todos</h2>
          <p className="text-4xl font-bold text-green-400 mt-2">
            {completedTodos} <span className="text-red-400">/{pendingTodos}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Registered Users & Their Todos</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Tasks (Completed / Total)</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => {
              const userTodos = user.todos || [];
              const completedTasks = userTodos.filter((todo) => todo.completed).length;
              return (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="p-2">{user.id}</td>
                  <td
                    className="p-2 text-blue-400 cursor-pointer hover:underline"
                    onClick={() => handleUserClick(user)}
                  >
                    {user.username}
                  </td>
                  <td className="p-2">
                    {completedTasks} / {userTodos.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-3 py-1 rounded mx-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-3 py-1 rounded mx-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Back to old page */}
      <div className="mt-6 bg-gray-800 p-6 rounded-lg text-center">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={backtoOld}
        >
          Back to old page
        </button>
      </div>

      {/* Selected User's Tasks Section */}
      {selectedUser && (
        <div className="mt-6 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-green-300 mb-4">Tasks for {selectedUser.username}</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2 text-red-500">Task</th>
                <th className="p-2 text-red-500">Description</th>
                <th className="p-2 text-red-500">Commitment Time</th>
                <th className="p-2 text-red-500">Fulfill Time</th>
                <th className="p-2 text-red-500">Status</th>
                <th className="p-2 text-red-500">Control</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.todos.map((todo) => (
                <tr key={todo.id} className="border-b border-gray-700">
                  <td className="p-2">{todo.title}</td>
                  <td className="p-2">{todo.text}</td>
                  <td className="p-2">{new Date(todo.createdTime).toLocaleString()}</td>
                  <td className="p-2">
                    {todo.finishedTime
                      ? new Date(todo.finishedTime).toLocaleString()
                      : "Fulfill commitment OR DONT MAKE PROMISE"}
                  </td>
                  <td className={`p-2 ${todo.completed ? "text-green-400" : "text-red-400"}`}>
                    {todo.completed ? "Completed" : "Pending"}
                  </td>
                  <td className="p-2">
                    <button
                      className={`text-green-500 mx-2 bg-gray-800 px-4 py-2 rounded ${subadmin === selectedUser.username ? "" : "disabled:opacity-50"}`}
                      onClick={() => subadmin === selectedUser.username && handleEditTodo(todo)}
                      disabled={subadmin !== selectedUser.username}
                    >
                      Edit
                    </button>
                    <button
                      className={`text-red-500 mx-2 bg-gray-800 px-4 py-2 rounded ${subadmin === selectedUser.username ? "" : "disabled:opacity-50"}`}
                      onClick={() => subadmin === selectedUser.username && deleteTodo.mutate({ id: todo.id })}
                      disabled={subadmin !== selectedUser.username}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Edit Todo Section */}
          {editTodo && (
            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-red-500 mb-4">Edit Todo</h2>
              <input
                type="text"
                value={editTodo.title}
                onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
                className="w-full mb-4 p-2 text-black rounded"
              />
              <textarea
                value={editTodo.text}
                onChange={(e) => setEditTodo({ ...editTodo, text: e.target.value })}
                className="w-full mb-4 p-2 text-black rounded"
              />
              <div className="flex justify-between">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => setEditTodo(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Adminsubadmin;
