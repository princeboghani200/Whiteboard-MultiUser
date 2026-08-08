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
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2>Board: {boardId}</h2>
          <div>
            <span style={{ marginRight: "1rem" }}>
              Logged in as {user?.name}
            </span>
            <button onClick={logout}>Logout</button>
            <Link to="/dashboard" style={{ marginRight: "1rem" }}>
              ← My Boards
            </Link>
          </div>
        </div>

        <Whiteboard boardId={boardId} userName={user?.name} />
      </div>
    </>
  );
};

export default BoardPage;
