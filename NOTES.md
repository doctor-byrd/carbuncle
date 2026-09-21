# Mini App

### Basic Workflow

Creating a script
```ts
import { Script, Keys, Vector3 } from "@galacean/engine";

export class PlayerController extends Script {
  public moveSpeed: number = 5;
  private _tempVelocity = new Vector3();

  // Runs automatically every single frame inside the engine loop
  onUpdate(deltaTime: number): void {
    const inputManager = this.engine.inputManager;
    this._tempVelocity.set(0, 0, 0);

    // Grab standard imperative inputs
    if (inputManager.isKeyHeldDown(Keys.W)) this._tempVelocity.z -= 1;
    if (inputManager.isKeyHeldDown(Keys.S)) this._tempVelocity.z += 1;
    if (inputManager.isKeyHeldDown(Keys.A)) this._tempVelocity.x -= 1;
    if (inputManager.isKeyHeldDown(Keys.D)) this._tempVelocity.x += 1;

    if (this._tempVelocity.length() > 0) {
      this._tempVelocity.normalize().scale(this.moveSpeed * deltaTime);
      this.entity.transform.translate(this._tempVelocity);
    }
  }
}
```

Creating a scene:
```ts
import { GameScene, SceneId } from "../types/scene";
import { AssetType, Camera, DirectLight, Vector3 } from "@galacean/engine";

export const gltfScene: GameScene = {
  id: SceneId.SCENE_ONE,
  name: "Heavy GLTF Level",
  
  // State your asset needs explicitly
  assets: [
    {
      type: AssetType.GLTF,
      url: "https://alipayobjects.com",
    }
  ],

  load(engine, loadedResources) {
    const scene = engine.sceneManager.activeScene;
    const root = scene.createRootEntity("GLTFRoot");

    // Grab the pre-loaded GLTF asset directly from the typed array index!
    const gltfResource = loadedResources[0];
    const { defaultSceneRoot } = gltfResource;
    root.addChild(defaultSceneRoot);

    // Setup typical environment properties boilerplate
    const cam = root.createChild("Cam");
    cam.transform.setPosition(0, 5, 15);
    cam.transform.lookAt(new Vector3(0, 0, 0));
    cam.addComponent(Camera);

    const light = root.createChild("Light");
    light.addComponent(DirectLight);
    light.transform.lookAt(new Vector3(-1, -1, -1));
  }
};
```

### Advanced Workflow

We can use the `colyseus` schema to share server side and client side logic for managing player state in a shared library
```ts
// libs/shared/src/lib/PlayerState.ts
import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
}

export class GameRoomState extends Schema {
  // A synchronized map of all players currently inside the room
  @type({ map: PlayerState }) players = new Map<string, PlayerState>();
}
```

Inside NestJS Colyseus Room
```ts
// apps/backend/src/game/rooms/BattleRoom.ts
import { Room, Client } from "colyseus";
import { GameRoomState, PlayerState } from "@org/game-protocol";

export class BattleRoom extends Room<GameRoomState> {
  onCreate(options: any) {
    this.setState(new GameRoomState());

    // Listen for imperative input payloads from client scripts
    this.onMessage("move", (client, inputData: { x: number, z: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Authoritative server logic: validate and update position
        player.x += inputData.x * 0.1;
        player.z += inputData.z * 0.1;
      }
    });
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.id = client.sessionId;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
```

Within the client side engine store:
```ts
// apps/frontend/src/lib/games/store/engineStore.ts
// (Expand your existing store state)
import { Client, Room } from "colyseus.js";
import { GameRoomState } from "@org/game-protocol";

interface MultiplayerState {
  client: Client | null;
  activeRoom: Room<GameRoomState> | null;
}

// You can create a dedicated networkStore or add it to your engineStore
export const networkStore = new Store<MultiplayerState>({
  client: new Client("ws://localhost:2567"), // Point to your NestJS server port
  activeRoom: null,
});

export async function joinGameRoom(roomId: string) {
  const room = await networkStore.state.client!.joinOrCreate<GameRoomState>(roomId);
  networkStore.setState((state) => ({ ...state, activeRoom: room }));
  return room;
}
```

Inside our client side Galacean script
```ts
import { Script } from "@galacean/engine";
import { networkStore } from "../store/engineStore";

export class MultiplayerSyncScript extends Script {
  private _remoteEntities = new Map<string, any>();

  onStart() {
    const room = networkStore.state.activeRoom;
    if (!room) return;

    // Listen to players entering the server state
    room.state.players.onAdd((player, sessionId) => {
      // 1. Create a proxy 3D entity in the engine for this remote player
      const remoteCube = this.entity.createChild(sessionId);
      // ... Add MeshRenderer and Materials ...

      this._remoteEntities.set(sessionId, remoteCube);

      // 2. Listen to position mutations streamed from the NestJS backend
      player.onChange(() => {
        // Linearly interpolate (LERP) or snap to server coordinates
        remoteCube.transform.setPosition(player.x, player.y, player.z);
      });
    });

    room.state.players.onRemove((player, sessionId) => {
      const entity = this._remoteEntities.get(sessionId);
      entity?.destroy();
      this._remoteEntities.delete(sessionId);
    });
  }
}
```

### Web Client
Run frontend:
```sh
npx nx dev frontend
```
Build production frontend:
```sh
npx nx build frontend
```
Preview production build:
```sh
npx nx preview frontend
```

### Web Server
Run backend:
```sh
npx nx serve backend
```
Build production backend:
```sh
npx nx build backend
```
Preview production build:
```sh
npx nx preview backend
```

### Shared Libraries

Check project graph:
```sh
npx nx graph
```

Generate shared types, run at the top level of monorepo
```sh
npx nx g @nx/js:library shared-types --directory=libs/shared/shared-types --compiler=tsc --bundler=none
```

It is important to note, the shared-types library should be used as a data-only package, this is good for things like common interface definitions, data transfer objects, enumerators, or identifiers. Keep specific execution logic local to either the frontend or backend.

Generate shared game-engine library, this abstracts game engine logic and allows reuse across both web and mobile clients
```sh
npx nx g @nx/js:library game-engine --directory=libs/shared/game-engine --compiler=tsc --bundler=none
```

### Infrastructure

See active Nx projects:
```sh
npx nx show projects
```

Spin up containers:
```sh
docker compose -f infra/docker-compose.yml up -d
```

Stop containers:
```sh
docker compose -f infra/docker-compose.yml down
```

Wipe containers:
```sh
docker compose -f infra/docker-compose.yml down -v
```

Check containers:
```sh
docker ps
```

Check logs for container:
```sh
docker logs <container-name>
```

Default PG Admin runs on port `8080`
Username: `admin@domain.com`
Password: `admin_password`

On first setup be sure to connect to the dev db using the information specified in the `docker-compose.yml` file. You can do this by adding the postgres server.
Default Host: `postgres`
Default Port: `5432`
Default User: `dev_user`
Default Password: `dev_password`