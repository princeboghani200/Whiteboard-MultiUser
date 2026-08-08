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
      <ul className="board-list">
        {list.map((board) => (
          <li key={board._id} className="board-item">
            <div
              onClick={() => navigate(`/board/${board._id}`)}
              className="board-item-main"
            >
              {board.name}
              <span className="board-item-date">
                {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="board-item-id">ID: {board._id}</div>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleCreateBoard} className="inline-form">
        <input
          type="text"
          placeholder="New board name"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          className="form-input"
        />
        <button type="submit" className="btn">
          Create New Board
        </button>
      </form>

      <form onSubmit={handleJoinBoard} className="inline-form">
        <input
          type="text"
          placeholder="Paste a board ID to join"
          value={joinBoardId}
          onChange={(e) => setJoinBoardId(e.target.value)}
          className="form-input"
        />
        <button type="submit" className="btn">
          Join Board
        </button>
      </form>

      <h3>Your Boards</h3>
      {renderBoardList(ownedBoards)}

      <h3>Recently Joined</h3>
      {renderBoardList(joinedBoards)}
    </div>
  );
};

export default Dashboard;
