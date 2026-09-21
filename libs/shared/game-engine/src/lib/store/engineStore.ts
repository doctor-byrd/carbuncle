import { Store } from '@tanstack/store';
import { WebGLEngine } from '@galacean/engine';
import { GUI } from '@galacean/gui';
import { SceneId } from "@org/shared-types";
import { GameScene } from '../types/scene.js';
import { loadingScene } from '../scenes/loadingScene.js';

interface EngineState {
  engine: WebGLEngine | null;
  gui: GUI | null;
  isReady: boolean;
  scenes: Record<SceneId, GameScene>;
  activeSceneId: SceneId | null;
}

export const engineStore = new Store<EngineState>({
  engine: null,
  gui: null,
  isReady: false,
  scenes: {} as Record<SceneId, GameScene>,
  activeSceneId: null,
});

export function getEngine(): WebGLEngine {
  const { engine } = engineStore.state;
  if (!engine) throw new Error("Engine not initialized.");
  return engine;
}

/**
 * Sweeps the canvas node architecture and runs raw configuration mounts.
 */
function purgeAndExecuteLoad(targetScene: GameScene, resources: any[] = []): void {
  const { engine, gui } = engineStore.state;
  if (!engine) return;

  if (gui) {
    gui.dispose();
    engineStore.setState((state) => ({ ...state, gui: null }));
  }

  const activeContext = engine.sceneManager.activeScene;
  for (let i = activeContext.rootEntitiesCount - 1; i >= 0; i--) {
    activeContext.getRootEntity(i)?.destroy();
  }

  targetScene.load(engine, resources);
  
  engineStore.setState((state) => ({
    ...state,
    activeSceneId: targetScene.id,
  }));
}

/**
 * Registers application game levels. Automatically triggers loading screen flows 
 * if the starting index targets heavy external asset records.
 */
export function registerScenes(sceneList: GameScene[]): void {
  if (sceneList.length === 0) return;

  engineStore.setState((state) => {
    const updatedScenes = { ...state.scenes };
    
    // 1. Manually lock the system loading setup into our registry pool
    updatedScenes[loadingScene.id] = loadingScene;

    // 2. Loop and map our incoming playable levels
    sceneList.forEach((s) => { 
      updatedScenes[s.id] = s; 
    });

    return { ...state, scenes: updatedScenes };
  });

  // 3. Command the machine to explicitly load the first playable game level
  if (!engineStore.state.activeSceneId) {
    switchScene(sceneList[0].id).catch(console.error);
  }
}

/**
 * Dynamic asynchronous scene routing manager.
 */
export async function switchScene(sceneId: SceneId): Promise<void> {
  const { engine, scenes, activeSceneId } = engineStore.state;
  if (!engine) throw new Error("Engine not initialized.");

  const targetScene = scenes[sceneId];
  if (!targetScene) throw new Error(`Scene "${sceneId}" not found.`);

  if (activeSceneId && scenes[activeSceneId]?.unload) {
    scenes[activeSceneId].unload!();
  }

  // RULE A: If target level has no assets, render it instantly bypass styles
  if (!targetScene.assets || targetScene.assets.length === 0) {
    purgeAndExecuteLoad(targetScene);
    return;
  }

  // RULE B: Target level requires assets down-wire! Display Loading Scene instantly
  const systemLoader = scenes[SceneId.LOADING];
  if (systemLoader) {
    purgeAndExecuteLoad(systemLoader);
  }

  // Stream binary targets into hardware thread pools
  let loadedResources: any[] = [];
  try {
    loadedResources = await engine.resourceManager.load(targetScene.assets);
  } catch (err) {
    throw new Error(`Asset preloading failed for ${sceneId}: ${err}`);
  }

  // Finalize assembly swap into the pre-warmed game world
  purgeAndExecuteLoad(targetScene, loadedResources);
}
