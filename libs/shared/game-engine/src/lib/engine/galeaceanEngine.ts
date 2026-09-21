import { WebGLEngine } from "@galacean/engine";
import { GUI, type GUIItemConfig } from "@galacean/gui";
import { engineStore } from "../store/engineStore.js";

export async function initEngine(canvas: HTMLCanvasElement): Promise<WebGLEngine> {
  // If already initialized, return it immediately
  if (engineStore.state.engine) {
    return engineStore.state.engine;
  }

  const engine = await WebGLEngine.create({ canvas });
  engine.canvas.resizeByClientSize();
  engine.run();

  // Commit to global state
  engineStore.setState((state) => ({
    ...state,
    engine,
    isReady: true,
  }));

  return engine;
}

export function initGUI(initialData: Record<string, any>, config?: GUIItemConfig[]): GUI {
  // If an old GUI exists, dispose it first
  if (engineStore.state.gui) {
    engineStore.state.gui.dispose();
  }
  
  const gui = new GUI(initialData, config);
  gui.render();
  
  engineStore.setState((state) => ({
    ...state,
    gui,
  }));
  
  return gui;
}
