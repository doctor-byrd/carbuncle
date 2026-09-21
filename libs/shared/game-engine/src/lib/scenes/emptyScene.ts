import { SceneId } from "@org/shared-types";
import { GameScene} from "../types/scene.js";
import { Camera, Vector3 } from "@galacean/engine";

export const emptyScene: GameScene = {
  id: SceneId.EMPTY_SCENE,
  name: "Void Sandbox",
  load(engine) {
    const scene = engine.sceneManager.activeScene;
    const root = scene.createRootEntity("VoidRoot");

    const cam = root.createChild("Cam");
    cam.transform.setPosition(0, 5, 10);
    cam.transform.lookAt(new Vector3(0, 0, 0));
    cam.addComponent(Camera);
    // Left empty intentionally to act as a blank template slate
  }
};
