import React from "react";
import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import socket from "../socket";

const Whiteboard = ({ boardId }) => {
  const canvasElRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
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

      // Tag the path itself with our element id, so we can match it later if needed
      path.set("elementId", element.id);

      socket.emit("element-add", { boardId, element });
    });

    // Listen for elements drawn by OTHER users
    socket.on("element-add", (element) => {
      if (element.type === "path") {
        fabric.Path.fromObject(element.data).then((path) => {
          path.set("elementId", element.id);
          canvas.add(path);
        });
      }
    });

    // Handle initial board-sync (existing elements when joining)
    socket.on("board-sync", (elements) => {
      elements.forEach((element) => {
        if (element.type === "path") {
          fabric.Path.fromObject(element.data).then((path) => {
            path.set("elementId", element.id);
            canvas.add(path);
          });
        }
      });
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
        name: "You",
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
    <div style={{ border: "1px solid #ccc", display: "inline-block", position: "relative" }}>
      <canvas ref={canvasElRef} />
    </div>
  );
};

export default Whiteboard;
