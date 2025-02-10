import { useState } from "react";
import { trpc } from "@/utils/trpc";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const registerUser = trpc.auth.registerUser.useMutation({
    onSuccess: () => setMessage("✅ Registration successful!"),
    onError: (error) => setMessage(`❌ ${error.message}`),
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    registerUser.mutate({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-center text-pink-400 mb-6">Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Username</label>
            <input
              type="text"
              className="w-full mt-1 p-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-pink-400 border border-gray-700 text-white outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-pink-400 border border-gray-700 text-white outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-pink-500 text-gray-900 font-bold rounded-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 p-2 bg-gray-800 text-pink-300 font-semibold rounded-md">
            {message}
          </p>
        )}

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <a href="/auth/Login" className="text-pink-400 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Registration;
