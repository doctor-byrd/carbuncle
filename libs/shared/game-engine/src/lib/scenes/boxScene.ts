import { SceneId } from "@org/shared-types";
import { Camera, MeshRenderer, PrimitiveMesh, BlinnPhongMaterial, Vector3, Color } from "@galacean/engine";
import { GameScene } from "../types/scene.js";
import { Rotate } from "../scripts/rotate.js";
import { initGUI } from "../engine/galeaceanEngine.js";

export const boxScene: GameScene = {
  id: SceneId.SCENE_ONE,
  name: "Rotating Box Lab",
  load(engine) {
    const scene = engine.sceneManager.activeScene;
    const root = scene.createRootEntity("BoxRoot");

    // 1. Setup Camera Environment
    const cam = root.createChild("Cam");
    cam.transform.setPosition(0, 3, 6);
    cam.transform.lookAt(new Vector3(0, 0, 0));
    cam.addComponent(Camera);

    // 2. Setup Box Mesh & Material
    const box = root.createChild("MeshCube");
    const r = box.addComponent(MeshRenderer);
    r.mesh = PrimitiveMesh.createCuboid(engine, 1.5, 1.5, 1.5);
    const mat = new BlinnPhongMaterial(engine);
    mat.baseColor = new Color(0.1, 0.5, 0.9, 1);
    r.setMaterial(mat);

    // 3. Attach Custom Behavior Script
    const rotateScript = box.addComponent(Rotate);

    // 4. Initialize Data-Bound Debug GUI
    // The keys in this state object map to the bindPath settings below
    const guiState = {
      speed: rotateScript.rotationSpeed ?? 45, // Fallback baseline if unset on script
      scale: 1.0,
      boxColor: { r: 0.1, g: 0.5, b: 0.9, a: 1.0 }
    };

    const guiConfig = [
      {
        label: "Rotation Speed",
        bindPath: "speed",
        type: "Slider" as any,
        min: 0,
        max: 360,
        onChange(value: number) {
          // Mutate the live public variable inside your active Script component loop
          rotateScript.rotationSpeed = value;
        }
      },
      {
        label: "Uniform Scale",
        bindPath: "scale",
        type: "Slider" as any,
        min: 0.2,
        max: 3.0,
        dragStep: 0.1,
        onChange(value: number) {
          // Alter the 3D entity transform dimensions directly
          box.transform.setScale(value, value, value);
        }
      },
      {
        label: "Material Color",
        bindPath: "boxColor",
        type: "Color" as any,
        onChange(value: { r: number, g: number, b: number, a: number }) {
          // Push color alterations directly into the active material reference memory
          mat.baseColor.set(value.r, value.g, value.b, value.a);
        }
      }
    ];

    // Fire the controller to handle data linkage and DOM element generation automatically
    initGUI(guiState, guiConfig);
  }
};
