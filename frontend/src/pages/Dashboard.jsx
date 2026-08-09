import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";
import { FolderPlus, House, LogOut, Plus } from "lucide-react";

const Dashboard = () => {
  const [ownedBoards, setOwnedBoards] = useState([]);
  const [joinedBoards, setJoinedBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [joinBoardId, setJoinBoardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  // const renderBoardList = (list) => {
  //   if (list.length === 0) return <p style={{ color: "#888" }}>None yet.</p>;

  //   return (
  //     <ul className="board-list">
  //       {list.map((board) => (
  //         <li key={board._id} className="board-item">
  //           <div
  //             onClick={() => navigate(`/board/${board._id}`)}
  //             className="board-item-main"
  //           >
  //             {board.name}
  //             <span className="board-item-date">
  //               {new Date(board.updatedAt).toLocaleDateString()}
  //             </span>
  //           </div>
  //           <div className="board-item-id">ID: {board._id}</div>
  //         </li>
  //       ))}
  //     </ul>
  //   );
  // };

  if (loading) return <p className="p-8">Loading...</p>;

  const BoardSection = ({ title, boards, navigate }) => {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
        {boards.length === 0 ? (
          <p className="text-gray-400 text-sm">None yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/board/${board._id}`)}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{board.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID: {board._id}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(board.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-indigo-100 border-r border-gray-200 flex flex-col p-6 ">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg mb-10 ">
          <span className="w-12 h-12 rounded-full border-2 border-indigo-400 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="logo" className="w-full h-full object-cover" />
          </span>
          <h2 className="text-[26px]">WhiteBoard</h2>
        </div>

        <nav className="flex flex-col gap-1 text-sm text-gray-600">
          <span className="px-3 flex py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
            <House />
            <h4 className="ms-2 flex items-center">Dashboard</h4>
          </span>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <div className="w-8 h-8 ms-2 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="px-3 flex py-2 rounded-lg  font-medium">
              <LogOut />
              <h4 className="ms-2 flex items-center">Log out</h4>
            </span>
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-2xl font-bold text-indigo-600">
              {ownedBoards.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">My Boards</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-2xl font-bold text-indigo-600">
              {joinedBoards.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Joined Boards</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-2xl font-bold text-indigo-600">
              {ownedBoards.length + joinedBoards.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Total Boards</p>
          </div>
        </div>

        <div className="flex gap-4 mb-10">
          <form onSubmit={handleCreateBoard} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="New board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <FolderPlus size={18} />{" "}
              <h4 className="flex items-center ">New Board</h4>
            </button>
          </form>

          <form onSubmit={handleJoinBoard} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Paste a board ID to join"
              value={joinBoardId}
              onChange={(e) => setJoinBoardId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Plus size={18} />
              <h4 className="flex items-center ">Join</h4>
            </button>
          </form>
        </div>
        <BoardSection
          title="My Boards"
          boards={ownedBoards}
          navigate={navigate}
        />
        <BoardSection
          title="Recently Joined"
          boards={joinedBoards}
          navigate={navigate}
        />
      </main>
    </div>
  );
};

export default Dashboard;
