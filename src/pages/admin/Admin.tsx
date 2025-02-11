"use client";
import {trpc} from "@/utils/trpc";
import {useState} from "react";
import {PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer} from "recharts";

const Admin = () => {
  const {data:users,isLoading:usersLoading} = trpc.todo.getAllUsersWithTodos.useQuery();
  const {data:registeredUsers,isLoading:registeredUsersLoading} = trpc.auth.getAllUsers.useQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 5;

  if (usersLoading || registeredUsersLoading) return <p>Loading...</p>;

  const totalUsers = registeredUsers?.length || 0;
  const totalTodos = users?.flatMap(user => user.todos).length || 0;
  const completedTodos = users?.flatMap(user => user.todos).filter(todo => todo.completed).length || 0;
  const pendingTodos = totalTodos - completedTodos;

  
  const pieData = [
    { name: "Completed Todos", value: completedTodos },
    { name: "Pending Todos", value: pendingTodos }
  ];

  const COLORS = ["#00C49F", "#FF4444"];

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

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

      <div className="mt-8 bg-gray-800 p-6 rounded-lg flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Todo Completion Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
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
              const completedTasks = userTodos.filter(todo => todo.completed).length;
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
            onClick={()=>setCurrentPage((prev)=>Math.max(prev-1,1))}
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

      {/* Selected User's Tasks Section */}
      {selectedUser && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tasks for {selectedUser.username}</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">Task</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.todos.map((todo) => (
                <tr key={todo.id} className="border-b border-gray-700">
                  <td className="p-2">{todo.title}</td>
                  <td className={`p-2 ${todo.completed ? "text-green-400" : "text-red-400"}`}>
                    {todo.completed ? "Completed" : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={() => setSelectedUser(null)} 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;


