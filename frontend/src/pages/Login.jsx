import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import illustration from "../assets/illustration.svg";
import logo from "../assets/logo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center bg-indigo-50 p-12">
      <div className="hidden md:flex flex-1 flex-col justify-center p-12">
        <div className="flex items-center gap-2 text-indigo-500 font-bold text-lg mb-8">
          <span className="w-16 h-16 rounded-full border-indigo-400 border-3 flex items-center justify-center">
            <img src={logo} alt={"logo"} />
          </span>
          WhiteBoard
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-500 mb-8">
          Login to continue your collaborative session.
        </p>
        <img src={illustration} alt="" className="max-w-full h-auto" />
      </div>

      <div className="flex-1 bg-white  p-4  flex flex-col justify-center rounded-2xl h-150 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Login to your account</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 mb-6 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
