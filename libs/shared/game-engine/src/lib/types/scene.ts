import { WebGLEngine } from "@galacean/engine";
import { SceneId } from "@org/shared-types"

export interface AssetManifestItem {
  type: any; // e.g., AssetType.Texture, AssetType.GLTF
  url: string;
}

export interface GameScene {
  id: SceneId;
  name: string;
  /** List of network dependencies that must be ready before entering the scene */
  assets?: AssetManifestItem[];
  /** Fires when swapping into this scene. Pass the engine reference explicitly. */
  load: (engine: WebGLEngine, loadedResources: any[]) => void;
  /** Optional: Clean up custom intervals, listeners, or DOM elements before dropping the scene. */
  unload?: () => void;
}
