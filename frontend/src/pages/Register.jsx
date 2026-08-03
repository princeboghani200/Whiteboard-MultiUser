import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("auth/register", { name, email, password });
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate("/board/6a69923498186e18a3e5b584");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div style={{ maxWidth: "400px", margin: "4rem auto" }}>
        <h2>Register</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "1rem",
              padding: "0.5rem",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "1rem",
              padding: "0.5rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "1rem",
              padding: "0.5rem",
            }}
          />
          <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
            Register
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </>
  );
};

export default Register;
