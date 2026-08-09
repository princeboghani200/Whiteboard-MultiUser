import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Whiteboard from "../components/Whiteboard";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";

const BoardPage = () => {
  const { boardId } = useParams();
  const { user, logout } = useAuth();

  const [activeUsers, setActiveUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [boardOwner, setBoardOwner] = useState(null);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", boardId, user?.name);

    return () => {
      socket.disconnect();
    };
  }, [boardId, user]);

  useEffect(() => {
    socket.on("user-joined", ({ name }) => {
      setToast(`${name} joined the board`);
      setTimeout(() => setToast(null), 3000);
    });

    socket.on("active-users", (users) => {
      setActiveUsers(users);
    });

    return () => {
      socket.off("user-joined");
      socket.off("active-users");
    };
  }, []);

  useEffect(() => {
    api.get(`/boards/${boardId}`).then((res) => {
      setBoardOwner(res.data.ownerId?.name);
    });
  }, [boardId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            ← My Boards
          </Link>
          <span className="text-gray-300">|</span>
          <h2 className="text-sm font-mono text-gray-600">
            Board: {boardId}{" "}
            {boardOwner && (
              <span className="text-gray-400">· by {boardOwner}</span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            {activeUsers.map((u, i) => (
              <div
                key={i}
                title={u.name}
                className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
              >
                {u.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>

          <button
            onClick={logout}
            className="px-4 py-1.5 border border-red-400 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {toast && (
          <div className="absolute top-full mt-2 right-6 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-pulse">
            {toast}
          </div>
        )}
      </header>
      <div className="flex justify-center p-8">
        <Whiteboard boardId={boardId} userName={user?.name} />
      </div>
    </div>
  );
};

export default BoardPage;
