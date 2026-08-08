import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Whiteboard from "../components/Whiteboard";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const BoardPage = () => {
  const { boardId } = useParams();
  const { user, logout } = useAuth();

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", boardId);

    return () => {
      socket.disconnect();
    };
  }, [boardId]);

  return (
    <>
      <div className="board-page-header">
        <h2>Board: {boardId}</h2>
        <div className="board-page-nav">
          <span className="board-page-user">Logged in as {user?.name}</span>
          <Link to="/dashboard" className="board-page-link">
            ← My Boards
          </Link>
          <button className="btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      <Whiteboard boardId={boardId} userName={user?.name} />
    </>
  );
};

export default BoardPage;
