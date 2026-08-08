import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Whiteboard from "../components/Whiteboard";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={18}/> My Boards
          </Link>
          <span className="text-gray-300">|</span>
          <h2 className="text-sm font-mono text-gray-600">Board: {boardId}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span>{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-1.5 border border-red-400 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex justify-center p-8">
        <Whiteboard boardId={boardId} userName={user?.name} />
      </div>
    </div>
  );
};

export default BoardPage;
