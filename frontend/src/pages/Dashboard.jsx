import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  
  const [newBoardName, setNewBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinBoardId, setJoinBoardId] = useState("");
  const [ownedBoards, setOwnedBoards] = useState([]);
  const [joinedBoards, setJoinedBoards] = useState([]);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards/mine");
      setOwnedBoards(res.data.ownedBoards);
      setJoinedBoards(res.data.joinedBoards);
    } catch (err) {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/boards", {
        name: newBoardName || "Untitled Board",
      });
      navigate(`/board/${res.data._id}`);
    } catch (err) {
      setError("Failed to create board");
    }
  };

  const handleJoinBoard = async (e) => {
    e.preventDefault();
    if (!joinBoardId.trim()) return;

    try {
      const res = await api.post(`/boards/${joinBoardId.trim()}/join`);
      navigate(`/board/${res.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to join board — check the ID and try again",
      );
    }
  };

  const renderBoardList = (list) => {
    if (list.length === 0) return <p style={{ color: "#888" }}>None yet.</p>;

    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {list.map((board) => (
          <li
            key={board._id}
            style={{
              padding: "1rem",
              border: "1px solid #ccc",
              marginBottom: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <div
              onClick={() => navigate(`/board/${board._id}`)}
              style={{ cursor: "pointer" }}
            >
              {board.name}
              <span
                style={{ float: "right", color: "#888", fontSize: "0.85rem" }}
              >
                {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#aaa",
                marginTop: "0.25rem",
              }}
            >
              ID: {board._id}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "3rem auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleCreateBoard} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="New board name"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Create New Board</button>
      </form>

      <form onSubmit={handleJoinBoard} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Paste a board ID to join"
          value={joinBoardId}
          onChange={(e) => setJoinBoardId(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem", width: "250px" }}
        />
        <button type="submit">Join Board</button>
      </form>

      <h3>Your Boards</h3>
      {renderBoardList(ownedBoards)}

      <h3 style={{ marginTop: "2rem" }}>Recently Joined</h3>
      {renderBoardList(joinedBoards)}
    </div>
  );
};

export default Dashboard;
