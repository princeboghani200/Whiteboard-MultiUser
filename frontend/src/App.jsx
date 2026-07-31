import { useEffect, useState } from "react";
import socket from "./socket";
import Whiteboard from "./components/Whiteboard";

function App() {
  const [boardId, setBoardId] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    socket.connect();
    socket.emit("join-room", boardId);
    setJoined(true);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>WhiteBoard Socket test</h2>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Paste your board id here"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            style={{ width: "300px", marginRight: "1rem" }}
          />
          <button onClick={handleJoin}>Join Room</button>
        </div>
      ) : (
        <Whiteboard boardId={boardId} />
      )}
    </div>
  );
}

export default App;
