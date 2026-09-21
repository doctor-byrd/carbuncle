import { SceneId } from "@org/shared-types";
import { GameScene } from "../types/scene.js";
import { Camera, Vector3, Color } from "@galacean/engine";

export const loadingScene: GameScene = {
  id: SceneId.LOADING,
  name: "System Loading Screen",
  load(engine) {
    const scene = engine.sceneManager.activeScene;
    const root = scene.createRootEntity("LoadingScreenRoot");

    // Clear background to a solid slate gray while items process
    scene.background.solidColor = new Color(0.07, 0.09, 0.15, 1);

    const cam = root.createChild("LoadingCam");
    cam.transform.setPosition(0, 0, 5);
    cam.transform.lookAt(new Vector3(0, 0, 0));
    cam.addComponent(Camera);

    // Tip: You can instantiate a simple rotating custom loader script onto a lightweight 3D sprite or ring mesh here if you want visual motion!
    console.log("WebGL loading backdrop established.");
  }
};
