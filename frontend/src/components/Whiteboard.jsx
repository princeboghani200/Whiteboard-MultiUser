import React from "react";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import socket from "../socket";

const Whiteboard = ({ boardId, userName }) => {
  const canvasElRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState("pencil");
  const activeToolRef = useRef("pencil");

  const setTool = (tool) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setActiveTool(tool);
    activeToolRef.current = tool;

    if (tool === "pencil") {
      canvas.isDrawingMode = true;
      canvas.selection = false;
    } else if (tool === "select") {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
    }
  };

  useEffect(() => {
    const addElementToCanvas = async (element) => {
      let shape;

      if (element.type === "path") {
        shape = await fabric.Path.fromObject(element.data);
      } else if (element.type === "rect") {
        shape = await fabric.Rect.fromObject(element.data);
      } else if (element.type === "circle") {
        shape = await fabric.Circle.fromObject(element.data);
      } else if (element.type === "text") {
        shape = await fabric.IText.fromObject(element.data);
      }

      if (shape) {
        shape.set("elementId", element.id);
        canvas.add(shape);
      }
    };

    if (fabricCanvasRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      isDrawingMode: true,
      width: 900,
      height: 600,
      backgroundColor: "#ffffff",
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#000000";

    fabricCanvasRef.current = canvas;

    canvas.on("path:created", (e) => {
      const path = e.path;

      const element = {
        id: uuidv4(),
        type: "path",
        data: path.toObject(),
      };

      path.set("elementId", element.id);

      socket.emit("element-add", { boardId, element });
    });

    canvas.on("mouse:down", (opt) => {
      const tool = activeToolRef.current;
      if (tool !== "rect" && tool !== "circle" && tool !== "text") return;

      const pointer = canvas.getViewportPoint(opt.e);
      let shape;

      if (tool === "rect") {
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 100,
          height: 60,
          fill: "transparent",
          stroke: "#000000",
          strokeWidth: 2,
        });
      } else if (tool === "circle") {
        shape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 40,
          fill: "transparent",
          stroke: "#000000",
          strokeWidth: 2,
        });
      } else if (tool === "text") {
        shape = new fabric.IText("Type here", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: "#000000",
        });
      }

      const elementId = uuidv4();
      shape.set("elementId", elementId);
      canvas.add(shape);

      const element = {
        id: elementId,
        type: tool,
        data: shape.toObject(),
      };
      socket.emit("element-add", { boardId, element });

      setTool("select");
    });

    socket.on("element-add", (element) => {
      addElementToCanvas(element);
    });

    socket.on("board-sync", (elements) => {
      elements.forEach((element) => addElementToCanvas(element));
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj || !obj.elementId) return;

      const element = {
        id: obj.elementId,
        type: obj.elementId ? obj.type : null,
        data: obj.toObject(),
      };

      socket.emit("element-update", { boardId, element });
    });

    socket.on("element-update", (element) => {
      const canvasObjects = canvas.getObjects();
      const target = canvasObjects.find((obj) => obj.elementId === element.id);

      if (target) {
        target.set(element.data);
        target.setCoords();
        canvas.requestRenderAll();
      }
    });

    let lastEmit = 0;
    const handleMouseMove = (opt) => {
      const now = Date.now();
      if (now - lastEmit < 50) return;
      lastEmit = now;

      const pointer = canvas.getViewportPoint(opt.e);
      socket.emit("cursor-move", {
        boardId,
        x: pointer.x,
        y: pointer.y,
        name: userName || "Anonymous",
      });
    };

    canvas.on("mouse:move", handleMouseMove);

    const cursorElement = {};

    socket.on("cursor-move", ({ socketId, x, y, name }) => {
      let el = cursorElement[socketId];

      if (!el) {
        el = document.createElement("div");
        el.style.position = "absolute";
        el.style.pointerEvents = "none";
        el.style.fontSize = "12px";
        el.style.background = "#4f46e5";
        el.style.color = "white";
        el.style.padding = "2px 6px";
        el.style.borderRadius = "4px";
        el.style.zIndex = 1000;
        el.innerText = name;
        canvasElRef.current.parentElement.appendChild(el);
        cursorElement[socketId] = el;
      }

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });

    socket.on("cursor-remove", ({ socketId }) => {
      const el = cursorElement[socketId];
      if (el) {
        el.remove();
        delete cursorElement[socketId];
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      socket.off("element-add");
      socket.off("board-sync");
      socket.off("cursor-move");
      socket.off("cursor-remove");
      Object.values(cursorElement).forEach((el) => el.remove());
    };
  }, [boardId]);

  return (
    <div className="flex flex-1 justify-center gap-12 ">
      <div className="flex flex-col gap-2 mb-3 bg-white p-2 rounded-lg border border-gray-200 w-fit">
        <ToolButton
          active={activeTool === "select"}
          onClick={() => setTool("select")}
          label="Select"
        />
        <ToolButton
          active={activeTool === "pencil"}
          onClick={() => setTool("pencil")}
          label="Pencil"
        />
        <ToolButton
          active={activeTool === "rect"}
          onClick={() => setTool("rect")}
          label="Rectangle"
        />
        <ToolButton
          active={activeTool === "circle"}
          onClick={() => setTool("circle")}
          label="Circle"
        />
        <ToolButton
          active={activeTool === "text"}
          onClick={() => setTool("text")}
          label="Text"
        />
      </div>

      <div className="border-2 flex justify-center ms-12">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
};

export default Whiteboard;
