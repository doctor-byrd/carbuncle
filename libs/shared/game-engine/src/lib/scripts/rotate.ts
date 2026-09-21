import { Script } from "@galacean/engine";

export class Rotate extends Script {
  // Public property that can be updated dynamically by other scripts or a GUI
  public rotationSpeed: number = 45; // Degrees per second

  // Runs automatically every frame within the engine's main loop
  override onUpdate(deltaTime: number): void {
    // Rotate around the Y-axis smoothly based on frame delta time
    this.entity.transform.rotate(0, this.rotationSpeed * deltaTime, 0);
  }
}
