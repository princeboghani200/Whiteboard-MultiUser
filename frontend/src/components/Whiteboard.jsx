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

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      socket.off("element-add");
      socket.off("board-sync");
    };
  }, [boardId]);

  return (
    <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
      <canvas ref={canvasElRef} />
    </div>
  );
};

export default Whiteboard;
