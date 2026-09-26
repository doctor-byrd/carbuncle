# RPG.md — Carbuncle RPG Reference Specification

## 1. Legacy Sources
- **Aegis Engine**: C++17 ECS with fixed-point math, message bus, and strict capacity limits (256 entities, 32 systems).
- **Persona 3 Dual**: NDS demake containing battle logic, view state machines, component systems, and `.jmap` text-based collision maps.

## 2. Aegis → Carbuncle Conversion Map
| Aegis Concept | New Implementation | Location |
|---|---|---|
| `engineBus` / `BroadcastEvent` | Typed `EventBus` over `GameEventType` | `libs/rpg/core/event-bus.ts` |
| `Engine::Tick` Pipeline | Galacean `Script.onUpdate` driver | `@org/game-engine` runtime |
| System Singletons | Backend services + client-side view systems | `apps/backend/src/rpg/*`, `libs/rpg/*` |
| Managers (IO/Audio/etc.) | AssetService, AudioService, RulesEngine RNG | Backend modules |
| Entity/Component Pools | Galacean entities; DTO-based composition | Frontend scenes |
| Fixed-point (`q20_12_t`) | Plain `number` with integer rounding rules | Shared |
| ViewState Router | Scene manager transitions (`SceneType`/`GameModeId`) | Game-engine scenes |
| `.jmap` tile collision grids | 3D colliders + trigger volumes in GLB stages (see §4) | Stage manifests |
| Tile-proximity interactions | Radius/facing checks against trigger registry | Client detect → server resolve |
| Shadow-tile surprise encounters | Overworld strike / enemy contact → entry-advantage roll (§4.3) | Encounter service |

## 3. Combat System
### Entry Advantages (from Overworld, see §4.3)
Initiative determined before turn order: party-initiative (stealth strike), backstab (rear hit), enemy-initiative (player touched by alert enemy), or neutral roll. Winning side acts first in round 1; backstab applies a one-time opening-strike damage modifier. These arrive as `EncounterDto.modifiers` and are applied during battle initialization only — they do not alter per-turn formulas below.
### Phases
`ChooseAction → ChooseSkill/Persona → ChooseTarget → ConfirmAllOutAttack → ShowAlert → EnemyTurn → Done`. Note: Current contract enum differs and requires reconciliation.

### Turn Order
Agility boost: `ag * (1.2 + rand()*0.2)`. Sort party/enemies separately. Advantages determine merge order. Fix legacy double-count bug on turn 1 re-calls.

### Damage Formulas
- **Party Base**: `floor( sqrt( movePower*15*atk / def.en ) * 2 * levelDiff * affinityMtp )`
- **Enemy Base**: `sqrt( power*6*atk / (8*def.en + def.armour.defense) ) * 9 * levelDiff * affinityMtp`
- **Final Attack**: `clamp(trunc(base * range/100), 1, 99999)` where `range = 95..105`.
- **Hit Rate**: `(attAg+200)/(defAg+200) * hitRate` clamped `[50,99]`.
- **Heal**: `floor((power + magicBoost(ma)) * teamMult) * range/100`.
- **All-Out**: `trunc( sqrt((weaponPower/2)*15*st / def.en) * 1.6 * levelDiff² * affinityMtp * participants ) * range/100`.
- **Level Multiplier**: Table indexed by `clamp(attLv-defLv,-13,10)+13`.
- **Affinity**: Weak 1.25, Resist 0.5, Null 0, Absorb -1, Repel -2 (unimplemented), Neutral 1.

### Mechanics
- **One More/Knockdown**: Weak affinity hit causes knockdown/extra turn unless guarding. Guard reduces damage ×0.4.
- **All-Out Attack**: Triggered when all alive enemies are knocked down.
- **Skill Costs**: Magic drains SP, Physical drains HP. Persona switch limited to once per turn.
- **AI**: Uniform random skill/target selection for v1.

### Data Model & Results
- Initialization order: Weapon→Skill→Armour→Shoe→Persona→EnemyProfile→CharacterProfile.
- `TurnResult` must become a DTO `{hit, hpDelta, oneMore, log}`.
- Backend emits structured DTOs; client renders accumulated alert logs (~120-frame expiry).

## 4. Exploration System (Free-Run / Honkai: Star Rail Model)
**Design shift**: The overworld is NOT tile-based. Legacy `.jmap` grids are used only as a migration source for level layout data; runtime exploration is a continuous 3D space with free movement, running, jumping/verticality, and player-initiated attacks on enemies and destructibles. New art assets are assumed throughout.

### 4.1 World Representation
- **Scenes**: Galacean GLB environments authored per stage (interior/exterior). No uniform tile grid at runtime.
- **Collision**: Engine-native colliders (mesh/box/capsule) exported from the DCC pipeline; navigation volumes defined separately from render meshes.
- **Verticality**: Multi-level traversal via ramps, platforms, ledges, jump pads, elevators, and optional double-jump/wall-interaction rules per stage. Height limits and fall-damage thresholds declared in stage metadata.
- **Trigger Volumes**: Axis-aligned or mesh triggers replace legacy tile types. Registry of typed triggers: `SavePoint`, `SceneTransition`, `NpcInteraction`, `EnemyPatrol`, `Destructible`, `Chest`, `DialogueZone`, `AmbushVolume`.
- **Stage Manifest**: JSON descriptor per stage `{ id, sceneRef, spawnPoints[], triggers[], navMeshRef, ambientAudio, encounterTableId }` — stored server-side, streamed to client.

### 4.2 Movement & Authority Model
- **Client-authoritative kinematics**: Position, velocity, sprint state, and jump physics run locally at frame rate for responsiveness (Galacean character controller). Server does NOT simulate per-frame movement.
- **Server-authoritative validation**: Client sends periodic state snapshots (`position, rotation, regionId, timestamp`) plus discrete action events. Server validates plausibility: max speed distance-per-interval, reachability against stage nav graph, teleport/clip heuristics. Violations → rubber-band correction message or session flag.
- **Rate limits**: Snapshot ~5 Hz; interaction actions event-driven. All throttled via existing NestJS Throttler.

### 4.3 Overworld Actions
- **Interact**: Proximity + facing check client-side; emits `INTERACT_REQUEST{triggerId}`. Server resolves outcome (dialogue, chest loot, save, transition) and returns authoritative DTO.
- **Attack start (enemy)**: Player strikes an overworld enemy entity → client emits `OVERWORLD_STRIKE{enemyInstanceId, element?, backstab?}`. Server computes entry advantage:
  - Strike on unaware enemy → party-initiative battle (legacy "surprise" inverted); strike from behind → backstab bonus; enemy detects and touches player first → enemy-initiative; simultaneous → neutral roll using backend seeded RNG.
  - Response: `EncounterDto { battleSeed, initiative, enemyGroup, modifiers }` which boots the combat state machine (§3).
- **Destructibles (crates etc.)**: Same request/response pattern → `DestructibleBrokenDto { drops[], sfxEvent }`. Drops go through inventory service; RNG server-owned.
- **Enemy AI (overworld)**: Patrol/sleep/alert/chase states simulated client-side for feel; only `enemy→player contact` is reported to server for authority. Chase ranges come from stage manifest so cheats can't extend them arbitrarily (validated against enemy archetype data).

### 4.4 Views & Rendering
- Third-person follow camera with orbit/zoom (replaces legacy ViewState router for exploration; combat may keep its own camera modes).
- Fresh asset pipeline: rigged character GLBs, animation state machines (idle/walk/run/jump/fall/attack/interact), PBR materials, baked lighting where possible.
- HUD minimal overlay; world-space damage/loot popups rendered client-side from server DTOs.

### 4.5 Contracts Additions (Exploration)
New enums/DTOs required in `@org/game-engine`:
- `enum TriggerType`, `enum OverworldEnemyState`, `enum EntryAdvantage { PartyInitiative, EnemyInitiative, Backstab, Neutral }`
- `interface StageManifestDto`, `PlayerSnapshotDto`, `InteractRequestDto`, `OverworldStrikeDto`, `EncounterDto`, `DestructibleBrokenDto`, `RubberBandDto`

## 4A. Client-Side Galacean Engine Amendments
The current `@org/game-engine` runtime scaffolding is a sound foundation but requires five targeted extensions to fully support the free-run RPG described in §4:

### 4A.1 Typed EventBus (Required)
- **Gap**: No event bus exists yet; legacy Aegis `engineBus`/`BroadcastEvent` has no client counterpart.
- **Change**: Implement a typed pub/sub `EventBus` keyed by `GameEventType` in `libs/rpg/core/event-bus.ts`, mirroring §8's event catalog. All scene systems, the snapshot sender, and UI HUD subscribe through it — never direct cross-module imports.

### 4A.2 Persistent Multi-Scene Management (Required)
- **Gap**: Current scene manager purges the full scene on transition. Free-run → battle transitions must preserve stage state (enemies alive, crates broken, player position) for return-to-overworld.
- **Change**: Support add/remove of scenes without global purge (Galacean multi-scene mode), with an explicit `StageStateCache` holding authoritative DTOs received from the server so re-entry restores exact world state.

### 4A.3 Typed Resource Loading (Required)
- **Gap**: Resource loading is untyped string-path based.
- **Change**: Wrap loader calls in typed helpers keyed to the asset taxonomy in `@org/shared-types` (GLB stages, rigged characters, animation clips, VFX prefabs, audio banks) so missing/misnamed assets fail fast at load time, not at render time.

### 4A.4 Extensible Scene IDs + Enter Parameters (Required)
- **Gap**: Scene IDs are hardcoded; no parameterization for entering a scene with context.
- **Change**: Extend the scene registry with dynamic IDs (`Stage:<id>`, `Battle:<encounterId>`) and a typed `EnterParams { spawnPoint?, snapshot?, encounterDto? }` contract so transitions carry server DTOs (§4.2, §4.3) into the new scene.

### 4A.5 Physics Integration (Required)
- **Gap**: No physics package wired in; free-run movement, jumping, verticality, and trigger volumes all depend on it.
- **Change**: Integrate `@galacean/engine-physics-lite` (or the PhysX-backed package if budget allows) for:
  - Character controller: capsule collider + grounded checks for run/jump/light platforming (see §4.1 verticality).
  - Trigger volumes: `onTriggerEnter/Exit` driving the §4.1 trigger registry (`SavePoint`, `EnemyPatrol`, `Destructible`, etc.).
  - Overworld strike detection: attack hitbox as short-lived trigger against enemy colliders → emits `OVERWORLD_STRIKE` per §4.3.
  - Destructibles: simple rigidbody break response is cosmetic only; loot/drops remain server-authoritative.

**Light platforming note**: With the character controller above, one-hop ledges, moving platforms (kinematic colliders authored in stage GLBs), and jump pads (trigger-driven velocity impulses declared in the stage manifest) are feasible without engine changes beyond 4A.5. Keep gaps within double-jump-free reach unless a stage opts into enhanced mobility via manifest flags.

## 5. Dialogue System
- Linked-node trees (`Dialogue` nodes with prev/next/selections).
- V1 port uses simple linked lists; future migration to node-graph DTOs.
- Contracts support richer requirements/nodes than legacy.

## 6. Numeric & Determinism
- Use doubles but preserve formula semantics (floor/trunc/clamp).
- Backend owns seeded RNG for gameplay determinism/replay; no client-side `Math.random()` for game logic.

## 7. Save System
- Migrate from local FAT SD saves to server-side TypeORM snapshots via REST.
- Client never persists authoritative state.

## 8. Event Catalog
Map legacy `EventID` to `GameEventType` (plus new free-run events):
- `ExecuteBattle` → `COMBAT_STARTED`
- `SwitchView` → `VIEW_SWITCHED`
- `WriteSave/ReadSave` → `GAME_SAVED/GAME_LOADED`
- New: `PLAYER_SNAPSHOT`, `INTERACT_REQUEST/RESOLVED`, `OVERWORLD_STRIKE`, `ENCOUNTER_LAUNCHED`, `DESTRUCTIBLE_BROKEN`, `ENEMY_STATE_CHANGED`, `RUBBER_BAND_APPLIED`, `STAGE_LOADED`
- Camera/UI events need new type definitions in contracts.

## 9. Contract Reconciliation Actions
1. Align `BattlePhase` enum with legacy 8-phase machine.
2. Convert `TurnResult` from enum to DTO.
3. Resolve element count mismatch (legacy 10 vs contracts 15); define canonical set.
4. Add missing enums: `TriggerType` (replaces legacy `TileType`), `EntryAdvantage`, `OverworldEnemyState`, `CameraMode`, `ViewPhase`, `ParticipantGuardState`.
5. Fix `QuestObjective` self-reference bug in shared database.
6. Add exploration DTOs per §4.5 (`StageManifestDto`, `PlayerSnapshotDto`, `InteractRequestDto`, `OverworldStrikeDto`, `EncounterDto`, `DestructibleBrokenDto`, `RubberBandDto`).
7. Extend position contracts from 2D tile coords to 3D world-space vectors `{x, y, z}` + rotation quaternion.

## 10. Implementation Roadmap
- **P0**: Contract reconciliation + new DTOs (§4.5, `EncounterDto`, `TurnResolvedDto`, etc.).
- **P1**: `libs/rpg/combat`: Pure `RulesEngine` unit-tested against legacy values; `BattleStateMachine`; entry-advantage modifiers from §4.3 feed battle initialization.
- **P2**: Backend `RpgModule`: Stage manifest service, snapshot validator (anti-cheat plausibility checks), interact/strike/destructible endpoints, encounter launcher, Redis battle sessions, save endpoints.
- **P3**: `libs/rpg/exploration`: Stage manifest schema + `.jmap`→trigger-volume migration tooling, client character controller (run/jump/verticality), trigger registry, overworld enemy AI states, snapshot sender. Engine prerequisites from §4A land here or earlier: EventBus (§4A.1) is a P1 dependency; physics integration (§4A.5) blocks this phase.
- **P4**: Frontend Galacean scenes: Free-run exploration scene (third-person camera, collision/navmesh), strike/destructible VFX feedback, Battle HUD, Dialogue renderer. Includes §4A.2 persistent multi-scene management, §4A.3 typed resource loading, and §4A.4 extensible scene IDs with enter parameters.
- **P5**: Content DBs as data seeds (JSON/Postgres): stage manifests, encounter tables, loot/drop tables, enemy archetype configs.
