import React, { useEffect, useRef } from "react";
import { initEngine, registerScenes, GameScene } from "@org/game-engine";

interface CanvasContainerProps {
  scenes: GameScene[];
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ scenes }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    initEngine(canvasRef.current)
      .then(() => {
        registerScenes(scenes);
      })
      .catch((err) => {
        console.error("Critical engine initialization breakdown:", err);
      });
  }, [scenes]); // Re-register if the scene array definition reference updates entirely

  return (
    <canvas 
      ref={canvasRef} 
      id="canvas" 
      style={{ width: "100%", height: "100%", display: "block" }} 
    />
  );
};
