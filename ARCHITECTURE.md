# Carbuncle RPG Architecture

## Executive Summary

**Carbuncle RPG** is a standalone role-playing game featuring an explorable world, turn-based combat, dialogue systems, and integrated minigames (Slots, Fishing, Poker) accessible within the RPG environment. Built on **Galacean Engine** for rendering, **React** for Web, and **Expo React Native** for Mobile, the platform emphasizes backend-driven business logic, shared type safety, and seamless transitions between exploration, combat, and minigame modes without reloading.

The architecture adapts proven patterns from the Aegis Engine (Entity-Component-System design, Manager abstraction, Event Bus) used in Persona 3 Dual, reimagined for the Galacean Engine ecosystem and the Carbuncle universe. All content uses original IP with no references to existing franchises.

### Core Design Principles

1. **RPG-First Experience**: The primary experience is a full-featured RPG with exploration, combat, and narrative; minigames are integrated activities within this world.
2. **Single Client Session**: Users load the game client once; all game modes (Exploration, Combat, Dialogue, Minigames) are accessible within the same runtime context.
3. **Backend-Authoritative Logic**: All game state, rules, economy, and business logic reside in the NestJS backend; clients are thin rendering layers.
4. **Type Safety First**: Shared TypeScript types, enums, and DTOs ensure consistency across frontend, backend, and game systems.
5. **Unified Engine**: Galacean Engine powers all visual rendering (2D/3D) across exploration, combat, dialogue, and minigames.
6. **ECS-Inspired Architecture**: Entity-Component-System patterns adapted from Aegis Engine, implemented within Galacean's component model.
7. **Event-Driven Communication**: Pub/Sub event bus for decoupled inter-system communication.
8. **Asset Delivery via Object Storage**: Game assets (GLB models, PNG sprites) served from S3-compatible storage (MinIO for development).
9. **Multi-Platform Runtime**: Web (React + Vite) and Mobile (Expo React Native) share core logic via Nx monorepo libraries.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │   Web (React)       │  │  Mobile (Expo RN)   │  │  Shared UI Kit  │ │
│  │   + Galacean Canvas │  │  + Galacean Native  │  │  (Components)   │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  └────────┬────────┘ │
│             │                        │                       │         │
│             └────────────────────────┼───────────────────────┘         │
│                                      │                                  │
│  ┌───────────────────────────────────▼───────────────────────────────┐ │
│  │                    @carbuncle/game-engine                          │ │
│  │  • Entity-Component System (Galacean-adapted ECS)                 │ │
│  │  • Scene Manager (Exploration, Combat, Dialogue, Minigames)       │ │
│  │  • Event Bus (Pub/Sub for inter-system communication)             │ │
│  │  • Module Loader (Minigames: Slots, Fishing, Poker)               │ │
│  │  • Asset Pipeline (GLB models, PNG sprites from S3/MinIO)         │ │
│  │  • Input Handler (Touch, Mouse, Keyboard, Gamepad)                │ │
│  │  • State Sync (Colyseus Client + TanStack Store)                  │ │
│  └───────────────────────────────────┬───────────────────────────────┘ │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       │ WebSocket / HTTP
┌──────────────────────────────────────▼──────────────────────────────────┐
│                         SERVER LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    NestJS Backend                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │ │
│  │  │  RPG Core   │  │ Minigames   │  │  Economy    │  │  Auth    │ │ │
│  │  │  (Gateway)  │  │ (Gateway)   │  │  (Service)  │  │  (JWT)   │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │ │
│  │         │                │                │              │        │ │
│  │  ┌──────▼────────────────▼────────────────▼──────────────▼─────┐ │ │
│  │  │                 Core Services                                │ │ │
│  │  │  • Game State Machine  • Rule Engine  • Matchmaking          │ │ │
│  │  │  • Party Management    • Quest System • Notification         │ │ │
│  │  │  • Inventory Service   • Audit Log    • Asset Delivery (S3)  │ │ │
│  │  └──────┬───────────────────────────────────────────────────────┘ │ │
│  │         │                                                          │ │
│  │  ┌──────▼───────────────────────────────────────────────────────┐ │ │
│  │  │                  Colyseus Multiplayer Server                  │ │ │
│  │  │  • Room Management (Combat Arenas, Minigame Tables)          │ │ │
│  │  │  • Real-time State Synchronization (Schema-based)            │ │ │
│  │  │  • Authority & Anti-Cheat Validation                         │ │ │
│  │  └──────┬───────────────────────────────────────────────────────┘ │ │
│  └─────────┼──────────────────────────────────────────────────────────┘ │
│            │                                                            │
│  ┌─────────▼──────────────────────────────────────────────────────────┐ │
│  │                      Data Layer                                    │ │
│  │  • PostgreSQL (TypeORM + pgvector)  • Redis (Cache + Pub/Sub)     │ │
│  │  • BullMQ (Job Queues)            • TypeORM Entities               │ │
│  │  • MinIO (S3-compatible Asset Storage)                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
/workspace/
├── apps/
│   ├── backend/                 # NestJS server (RPG Core, Minigames, Economy, Auth)
│   ├── backend-e2e/             # Backend E2E tests
│   ├── frontend/                # React + Galacean (Web)
│   └── mobile/                  # Expo React Native + Galacean (Mobile) [FUTURE]
├── libs/
│   ├── shared/
│   │   ├── shared-types/        # CRITICAL: Enums, DTOs, Entities, Interfaces
│   │   └── game-engine/         # Galacean abstraction, ECS, Scene Manager, Event Bus
│   ├── rpg/
│   │   ├── exploration/         # Exploration mode logic (overworld, NPCs, triggers)
│   │   ├── combat/              # Turn-based combat system
│   │   ├── dialogue/            # Visual novel-style dialogue system
│   │   └── party/               # Party management, inventory, equipment
│   ├── minigames/
│   │   ├── slots/               # Slots minigame logic
│   │   ├── fishing/             # Fishing minigame logic
│   │   └── poker/               # Poker minigame logic
│   └── ui-kit/                  # Reusable React components (buttons, modals, HUD)
├── packages/                    # Publishable packages (future)
├── archive/                     # Reference implementations (Aegis Engine, Persona 3 Dual)
└── infra/                       # Docker Compose (PostgreSQL, Redis, MinIO, PGAdmin)
```

---

## Core Architectural Components

### 1. Shared Types Library (`@carbuncle/shared-types`)

**Purpose**: Single source of truth for all data structures, ensuring type safety across client, server, and game systems.

#### Key Categories:

**A. Global Enums**
```typescript
// Game Mode Identification
export enum GameModeId {
  RPG_EXPLORATION = 'rpg_exploration',
  RPG_COMBAT = 'rpg_combat',
  RPG_DIALOGUE = 'rpg_dialogue',
  MINIGAME_SLOTS = 'minigame_slots',
  MINIGAME_FISHING = 'minigame_fishing',
  MINIGAME_POKER = 'minigame_poker',
}

// Scene Types (Galacean Engine)
export enum SceneType {
  EXPLORATION = 'exploration',    // Overworld, towns, dungeons
  COMBAT = 'combat',              // Turn-based battle arena
  DIALOGUE = 'dialogue',          // Visual novel-style conversations
  SLOTS = 'slots',                // Slots minigame
  FISHING = 'fishing',            // Fishing minigame
  POKER = 'poker',                // Poker minigame
  LOADING = 'loading',            // Loading/transition scene
}

// Player Roles & Permissions
export enum UserRole {
  PLAYER = 'player',
  PARTY_LEADER = 'party_leader',  // For multiplayer parties
  SPECTATOR = 'spectator',
  ADMIN = 'admin',
}

// Game States
export enum GameState {
  IDLE = 'idle',
  LOADING = 'loading',
  EXPLORING = 'exploring',
  IN_COMBAT = 'in_combat',
  IN_DIALOGUE = 'in_dialogue',
  PLAYING_MINIGAME = 'playing_minigame',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

// Currency & Economy
export enum CurrencyType {
  GOLD = 'gold',        // Primary currency
  GEMS = 'gems',        // Premium currency
  TOKENS = 'tokens',    // Minigame-specific tokens
  REPUTATION = 'reputation', // Faction/trust currency
}

// Combat-related Enums
export enum CombatActionType {
  ATTACK = 'attack',
  SKILL = 'skill',
  ITEM = 'item',
  DEFEND = 'defend',
  FLEE = 'flee',
}

export enum TargetType {
  SINGLE_ENEMY = 'single_enemy',
  ALL_ENEMIES = 'all_enemies',
  SINGLE_ALLY = 'single_ally',
  ALL_ALLIES = 'all_allies',
  SELF = 'self',
}

// Character Classes/Archetypes
export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
  HEALER = 'healer',
  GUNNER = 'gunner',      // For minigame crossover
}
```

**B. Data Transfer Objects (DTOs)**
```typescript
// Universal Player DTO (used across all modes)
export interface PlayerDTO {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  experience: number;
  currencies: Record<CurrencyType, number>;
  currentMode?: GameModeId;
  currentScene?: SceneType;
  partyId?: string;
  lastActiveAt: Date;
}

// Character/Party Member DTO
export interface CharacterDTO {
  id: string;
  playerId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  stats: CharacterStatsDTO;
  equipment: EquipmentDTO;
  skills: SkillDTO[];
}

export interface CharacterStatsDTO {
  strength: number;
  magic: number;
  dexterity: number;
  endurance: number;
  luck: number;
}

export interface EquipmentDTO {
  weapon?: ItemDTO;
  armor?: ItemDTO;
  accessory?: ItemDTO;
}

export interface ItemDTO {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats?: Record<string, number>;
  effects?: string[];
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  KEY_ITEM = 'key_item',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface SkillDTO {
  id: string;
  name: string;
  description: string;
  cost: { type: CurrencyType | 'stamina' | 'mana'; amount: number };
  targetType: TargetType;
  effect: SkillEffectDTO;
  cooldown?: number; // in turns
}

export interface SkillEffectDTO {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status';
  value: number;
  duration?: number; // in turns
  statusEffect?: StatusEffectType;
}

export enum StatusEffectType {
  POISON = 'poison',
  PARALYSIS = 'paralysis',
  SLEEP = 'sleep',
  CONFUSION = 'confusion',
  BERSERK = 'berserk',
  SHIELD = 'shield',
  REGEN = 'regen',
}

// Combat Action DTO
export interface CombatActionDTO {
  characterId: string;
  actionType: CombatActionType;
  targetIds: string[];
  skillId?: string;
  itemId?: string;
}

// Exploration DTOs
export interface ExplorationStateDTO {
  currentMap: string;
  playerPosition: Vector2DTO;
  activeNPCs: NPCDTO[];
  activeTriggers: TriggerDTO[];
  discoveredAreas: string[];
  chestStates: Record<string, boolean>; // chestId -> opened
}

export interface Vector2DTO {
  x: number;
  y: number;
}

export interface NPCDTO {
  id: string;
  name: string;
  position: Vector2DTO;
  dialogueTreeId?: string;
  isInteractable: boolean;
}

export interface TriggerDTO {
  id: string;
  type: 'teleport' | 'event' | 'battle' | 'cutscene';
  position: Vector2DTO;
  radius: number;
  triggered: boolean;
  data: any;
}

// Dialogue DTOs
export interface DialogueStateDTO {
  dialogueTreeId: string;
  currentNodeId: string;
  participants: string[]; // character IDs
  choices: DialogueChoiceDTO[];
}

export interface DialogueChoiceDTO {
  id: string;
  text: string;
  nextNodeId: string;
  requirements?: DialogueRequirementDTO[];
}

export interface DialogueRequirementDTO {
  type: 'stat' | 'item' | 'reputation' | 'flag';
  key: string;
  value: number | string;
  comparison: 'equals' | 'greaterThan' | 'lessThan' | 'has';
}

// Minigame-specific DTOs will be added in their respective sections
```

**C. Database Entities (TypeORM)**
```typescript
// Base Entity (all entities extend this)
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// User Entity
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column('jsonb')
  currencies: Record<CurrencyType, number>;

  @Column()
  level: number;

  @Column()
  experience: number;

  @OneToMany(() => Character, (character) => character.owner)
  characters: Character[];

  @OneToMany(() => GameSession, (session) => session.player)
  gameSessions: GameSession[];
}

// Character Entity (Party Members)
@Entity('characters')
export class Character extends BaseEntity {
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.characters)
  owner: User;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CharacterClass })
  class: CharacterClass;

  @Column()
  level: number;

  @Column()
  experience: number;

  @Column()
  health: number;

  @Column()
  maxHealth: number;

  @Column()
  stamina: number;

  @Column()
  maxStamina: number;

  @Column('jsonb')
  stats: CharacterStatsDTO;

  @Column('jsonb')
  equipment: EquipmentDTO;

  @Column('jsonb')
  skills: SkillDTO[];

  @Column('jsonb')
  inventory: ItemDTO[];
}

// Party Entity
@Entity('parties')
export class Party extends BaseEntity {
  @Column()
  leaderId: string;

  @Column('jsonb')
  memberIds: string[]; // character IDs

  @Column()
  currentMap?: string;

  @Column('jsonb')
  sharedQuests: QuestProgressDTO[];
}

// Quest/Task Entity
@Entity('quests')
export class Quest extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column('jsonb')
  objectives: QuestObjectiveDTO[];

  @Column()
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';

  @Column('jsonb')
  rewards: {
    experience: number;
    gold: number;
    items?: ItemDTO[];
    reputation?: { factionId: string; amount: number };
  };
}

// Quest Progress Tracking
@Entity('quest_progress')
export class QuestProgress extends BaseEntity {
  @Column()
  questId: string;

  @Column()
  characterId: string;

  @Column('jsonb')
  objectiveProgress: Record<number, number>; // objectiveIndex -> progress

  @Column()
  status: 'active' | 'completed' | 'failed' | 'abandoned';

  @Column('jsonb')
  completedAt?: Date;
}

// Inventory/Item Storage
@Entity('inventories')
export class Inventory extends BaseEntity {
  @Column()
  ownerId: string; // character ID or party ID

  @Column()
  ownerType: 'character' | 'party' | 'account';

  @Column('jsonb')
  items: ItemDTO[];

  @Column()
  capacity: number;
}

// Game Session Tracking (for minigames and combat)
@Entity('game_sessions')
export class GameSession extends BaseEntity {
  @Column()
  modeId: GameModeId;

  @ManyToOne(() => User, (user) => user.gameSessions)
  player: User;

  @Column()
  roomId: string;

  @Column('jsonb')
  initialState: any;

  @Column('jsonb')
  finalState: any;

  @Column()
  result: 'win' | 'loss' | 'draw' | 'abandoned' | 'completed';

  @Column('jsonb')
  rewards: {
    experience: number;
    gold: number;
    items?: ItemDTO[];
  };
}

// NPC Entity
@Entity('npcs')
export class NPC extends BaseEntity {
  @Column()
  name: string;

  @Column()
  mapId: string;

  @Column('jsonb')
  position: Vector2DTO;

  @Column()
  dialogueTreeId?: string;

  @Column('jsonb')
  interactionData: any;
}

// Map/Area Entity
@Entity('maps')
export class GameMap extends BaseEntity {
  @Column()
  name: string;

  @Column()
  type: 'town' | 'dungeon' | 'overworld' | 'arena' | 'minigame';

  @Column()
  parentMapId?: string; // for nested areas

  @Column('jsonb')
  bounds: { x: number; y: number; width: number; height: number };

  @Column('jsonb')
  teleportPoints: TeleportPointDTO[];

  @Column('jsonb')
  triggerZones: TriggerZoneDTO[];
}
```

**D. Minigame-Specific DTOs**

*Note: These minigames are integrated activities within the RPG world, accessible at specific locations (casinos, fishing spots, card tables).*

*Slots Minigame:*
```typescript
export enum SlotVariant {
  LUCKY_CARBY = 'lucky_carby',      // Classic 3-reel, 5 paylines
  SEVEN_SEAS = 'seven_seas',        // 5-reel, 20 paylines, pirate theme
  CRYSTAL_FORTUNE = 'crystal_fortune', // 5-reel, 25 paylines, gem theme
  DRAGON_WHEEL = 'dragon_wheel',    // Bonus wheel feature
}

export interface SpinRequestDTO {
  variant: SlotVariant;
  betAmount: number;
  currency: CurrencyType;
  autoSpinCount?: number;
}

export interface SpinResultDTO {
  spinId: string;
  reels: number[][];           // [reelIndex][rowIndex] = symbolId
  paylines: PaylineResultDTO[];
  totalWin: number;
  bonusTriggered?: BonusGameDTO;
  newState: SlotMachineStateDTO;
}

export interface PaylineResultDTO {
  paylineId: number;
  symbolId: number;
  count: number;
  winAmount: number;
  positions: { reel: number; row: number }[];
}

export interface BonusGameDTO {
  type: 'wheel' | 'free_spins' | 'pick_em';
  initialSpins?: number;
  multiplier?: number;
}

export interface SlotMachineStateDTO {
  variant: SlotVariant;
  currentCredits: number;
  lastWin: number;
  inBonusRound: boolean;
  freeSpinsRemaining: number;
}
```

*Fishing Minigame:*
```typescript
export enum FishType {
  SMALL_FISH = 'small_fish',
  MEDIUM_FISH = 'medium_fish',
  LARGE_FISH = 'large_fish',
  BOSS_FISH = 'boss_fish',
  SPECIAL_FISH = 'special_fish',  // Bomb, Lightning, etc.
  RARE_FISH = 'rare_fish',        // Collectible rare species
}

export interface ShootRequestDTO {
  weaponId: number;
  angle: number;
  power: number;
  targetPosition?: { x: number; y: number };
}

export interface FishSpawnDTO {
  fishId: string;
  typeId: FishType;
  health: number;
  speed: number;
  path: Vector2DTO[];
  rewardMultiplier: number;
}

export interface CatchResultDTO {
  fishId: string;
  catcherId: string;
  damageDealt: number;
  reward: number;
  isKill: boolean;
  fishCollected?: boolean; // For rare fish collection
}

export interface FishingArenaStateDTO {
  arenaId: string;
  players: string[]; // player IDs
  activeFish: FishSpawnDTO[];
  timeRemaining: number;
  leaderboard: { playerId: string; score: number }[];
}
```

*Poker Minigame:*
```typescript
export enum PokerStage {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown',
}

export enum PokerAction {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  RAISE = 'raise',
  ALL_IN = 'all_in',
}

export interface CardDTO {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  faceUp: boolean;
}

export interface PokerRoomStateDTO {
  stage: PokerStage;
  dealerIndex: number;
  currentPlayerIndex: number;
  communityCards: CardDTO[];
  players: PokerPlayerStateDTO[];
  pot: { main: number; sidePots: SidePotDTO[] };
  currentBet: number;
  smallBlind: number;
  bigBlind: number;
}

export interface PokerPlayerStateDTO {
  playerId: string;
  hand: CardDTO[];
  chips: number;
  currentRoundBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  lastAction?: PokerAction;
  seatIndex: number;
}

export interface SidePotDTO {
  amount: number;
  eligiblePlayerIds: string[];
}
```

---
### 2. Game Engine Library (`@carbuncle/game-engine`)

**Purpose**: Galacean Engine abstraction layer providing ECS-inspired architecture, scene management, event bus, module loading, asset handling, and state synchronization. Adapts patterns from Aegis Engine for the Galacean environment.

#### Core Architectural Patterns (from Aegis Engine)

The game engine implements a hybrid Entity-Component-System architecture inspired by the Aegis Engine:

1. **Entity**: Lightweight identifier containing Components (Galacean Entity)
2. **Component**: Pluggable logic nodes attached to Entities (Galacean Script/Component)
3. **System**: Singletons handling game rules/state logic using Pub/Sub events
4. **Manager**: Hardware abstraction layer for heavy computation/memory management
5. **Event Bus**: ETL-based Pub/Sub for inter-module communication

#### Execution Sequence
```
Poll Input → Update Systems → Update Components → Process Managers → Compute
```

#### Core Modules:

**A. Entity-Component System**
```typescript
// Entity - Lightweight identifier wrapper around Galacean Entity
export class CarbuncleEntity {
  readonly id: string;
  private galaceanEntity: Entity;
  private components: Map<string, Component> = new Map();

  constructor(entity: Entity);
  
  addComponent<T extends Component>(component: T): T;
  getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
  removeComponent(componentType: string): void;
  hasComponent(componentType: string): boolean;
}

// Base Component - Attachable logic node
export abstract class CarbuncleComponent {
  entity: CarbuncleEntity | null = null;
  name: string;

  onAttach(entity: CarbuncleEntity): void;
  onDetach(): void;
  onUpdate?(deltaTime: number): void;
  onFixedUpdate?(): void;
}

// System - Singleton handling game rules with Pub/Sub
export abstract class CarbuncleSystem {
  readonly systemId: string;
  protected eventBus: EventBus;

  constructor(eventBus: EventBus);
  
  initialize(): void;
  update(deltaTime: number): void;
  onEvent<T>(eventType: string, handler: (data: T) => void): void;
  emitEvent<T>(eventType: string, data: T): void;
}

// Manager - Heavy computation and resource management
export abstract class ResourceManager {
  readonly managerId: string;
  protected memoryPool: MemoryPool;

  allocate(size: number): MemoryBlock;
  free(block: MemoryBlock): void;
  processBatch(items: any[]): any[];
}
```

**B. Event Bus (Pub/Sub)**
```typescript
// Event definition
export interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string; // system/component ID
}

// Event Bus - Central pub/sub hub
export class EventBus {
  private subscribers: Map<string, Set<(event: GameEvent) => void>> = new Map();

  subscribe<T>(eventType: string, handler: (event: GameEvent<T>) => void): () => void;
  publish<T>(eventType: string, payload: T, source?: string): void;
  clear(): void;
}

// Common Event Types
export enum GameEventType {
  // Exploration
  PLAYER_MOVED = 'player_moved',
  NPC_INTERACTED = 'npc_interacted',
  TRIGGER_ENTERED = 'trigger_entered',
  TRIGGER_EXITED = 'trigger_exited',
  CHEST_OPENED = 'chest_opened',
  
  // Combat
  COMBAT_STARTED = 'combat_started',
  TURN_STARTED = 'turn_started',
  ACTION_EXECUTED = 'action_executed',
  DAMAGE_DEALT = 'damage_dealt',
  STATUS_APPLIED = 'status_applied',
  ENEMY_DEFEATED = 'enemy_defeated',
  COMBAT_ENDED = 'combat_ended',
  
  // Dialogue
  DIALOGUE_STARTED = 'dialogue_started',
  DIALOGUE_CHOICE_MADE = 'dialogue_choice_made',
  DIALOGUE_ENDED = 'dialogue_ended',
  
  // Minigames
  MINIGAME_STARTED = 'minigame_started',
  MINIGAME_ACTION = 'minigame_action',
  MINIGAME_RESULT = 'minigame_result',
  MINIGAME_ENDED = 'minigame_ended',
  
  // Economy
  ITEM_ACQUIRED = 'item_acquired',
  ITEM_USED = 'item_used',
  CURRENCY_CHANGED = 'currency_changed',
  QUEST_UPDATED = 'quest_updated',
}
```

**C. Scene Manager**
```typescript
// Scene Configuration
export interface SceneConfig {
  sceneId: SceneType;
  prefabPath: string;           // Galacean prefab JSON
  assetManifest: AssetManifest;
  onLoad?: (scene: Scene) => Promise<void>;
  onUnload?: (scene: Scene) => Promise<void>;
}

// Scene Manager Service
export class SceneManager {
  private currentScene: Scene | null = null;
  private sceneRegistry: Map<SceneType, SceneConfig> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus);

  registerScene(config: SceneConfig): void;
  async loadScene(sceneId: SceneType): Promise<void>;
  async unloadScene(): Promise<void>;
  getCurrentScene(): Scene | null;
  getSceneType(): SceneType | null;
}
```

**D. Module Loader (Minigame System)**
```typescript
// Game Module Interface - For minigames within RPG
export interface MinigameModule {
  modeId: GameModeId;
  sceneId: SceneType;

  // Lifecycle
  initialize(engine: GameEngine): Promise<void>;
  start(roomId: string, initialState: any): Promise<void>;
  update(deltaTime: number): void;
  pause(): void;
  resume(): void;
  destroy(): Promise<void>;

  // Input Handling
  handleInput(input: InputEvent): void;

  // Network Sync
  onStateSync(newState: any): void;
  sendAction(action: GameActionRequest): void;
}

// Module Registry
export class ModuleLoader {
  private modules: Map<GameModeId, MinigameModule> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus);

  registerModule(module: MinigameModule): void;
  getModule(modeId: GameModeId): MinigameModule | undefined;
  async switchModule(targetModeId: GameModeId, roomId?: string): Promise<void>;
}
```

**E. Asset Pipeline (S3/MinIO Integration)**
```typescript
// Asset Manifest Structure
export interface AssetManifest {
  sprites: AssetEntry[];      // PNG sprites
  models: AssetEntry[];       // GLB models
  animations: AssetEntry[];
  audio: AssetEntry[];
  fonts: AssetEntry[];
  shaders: AssetEntry[];
}

export interface AssetEntry {
  id: string;
  path: string;               // S3 key / MinIO path
  type: 'sprite' | 'model' | 'animation' | 'audio' | 'font' | 'shader';
  format: 'png' | 'glb' | 'mp3' | 'ogg' | 'ttf';
  preload: boolean;
  bundle?: string;            // For lazy loading
  size?: number;              // File size in bytes
}

// Asset Loader Service with S3/MinIO support
export class AssetLoader {
  private loadedAssets: Map<string, any> = new Map();
  private manifest: AssetManifest;
  private s3Client: S3Client;
  private bucketName: string;

  constructor(manifest: AssetManifest, s3Config: S3Config);

  preload(bundle?: string): Promise<void>;
  getAsset<T>(assetId: string): T;
  unload(assetId: string): void;
  unloadBundle(bundle: string): void;
  downloadAsset(assetId: string): Promise<void>;
}

// S3 Configuration
export interface S3Config {
  endpoint: string;           // MinIO URL for dev, S3 for prod
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  useSSL: boolean;
}
```

**D. State Synchronization**
```typescript
// TanStack Store Integration
import { createStore } from '@tanstack/store';

export interface GameStateStore<T> {
  store: ReturnType<typeof createStore<T>>;
  subscribe(selector: (state: T) => any, callback: (value: any) => void): () => void;
  setState(updater: (state: T) => Partial<T>): void;
}

// Colyseus Client Wrapper
export class NetworkSync {
  private colyseusClient: Client;
  private rooms: Map<GameModuleId, Room> = new Map();

  constructor(serverUrl: string);

  async joinRoom<T>(moduleId: GameModuleId, roomId: string): Promise<Room<T>>;
  leaveRoom(moduleId: GameModuleId): void;
  sendAction(moduleId: GameModuleId, action: GameActionRequest): void;
  onStateChange(moduleId: GameModuleId, callback: (state: any) => void): void;
}
```

**E. Input Handler**
```typescript
export enum InputType {
  TOUCH_START = 'touch_start',
  TOUCH_MOVE = 'touch_move',
  TOUCH_END = 'touch_end',
  MOUSE_DOWN = 'mouse_down',
  MOUSE_MOVE = 'mouse_move',
  MOUSE_UP = 'mouse_up',
  KEY_DOWN = 'key_down',
  KEY_UP = 'key_up',
  GAMEPAD_BUTTON = 'gamepad_button',
  GAMEPAD_AXIS = 'gamepad_axis',
}

export interface InputEvent {
  type: InputType;
  position?: Vector2;
  delta?: Vector2;
  key?: string;
  button?: number;
  axis?: number;
  value?: number;
  pointerId?: number;
}

export class InputHandler {
  private listeners: Map<InputType, Set<(event: InputEvent) => void>> = new Map();

  on(type: InputType, callback: (event: InputEvent) => void): () => void;
  off(type: InputType, callback: (event: InputEvent) => void): void;
  getPointerPosition(pointerId: number): Vector2;
  isKeyDown(key: string): boolean;
}
```

---

### 3. Backend Architecture (NestJS)

**Purpose**: Authoritative game logic, state management, persistence, and real-time synchronization.

#### Module Structure:

```
apps/backend/src/
├── auth/                    # JWT authentication, Passport strategies
├── user/                    # User management, profiles, inventories
├── economy/                 # Currency, transactions, shop, rewards
├── games/
│   ├── slots/
│   │   ├── slots.gateway.ts      # WebSocket gateway
│   │   ├── slots.service.ts      # Business logic (RNG, paylines, bonuses)
│   │   ├── slots.room.ts         # Colyseus room definition
│   │   ├── dto/                  # DTOs (already in shared-types, re-exported)
│   │   └── utils/                # Payline calculators, RNG helpers
│   ├── fishing/
│   │   ├── fishing.gateway.ts
│   │   ├── fishing.service.ts
│   │   ├── fishing.room.ts
│   │   ├── entities/             # Fish, Weapon, Arena entities
│   │   └── utils/                # Pathfinding, collision detection
│   └── poker/
│       ├── poker.gateway.ts
│       ├── poker.service.ts      # Hand evaluation, blind management
│       ├── poker.room.ts         # Colyseus room with state schema
│       ├── utils/                # Deck, hand evaluator, side pot calc
│       └── dto/
├── matchmaking/             # Room creation, player matching
├── notification/            # Push notifications, in-game messages
└── audit/                   # Game history, anti-fraud logging
```

#### Colyseus Room Pattern:

```typescript
// Example: Poker Room Schema
export class PokerRoomState extends Schema {
  @Type("string") roomId: string;
  @Type("number") stage: number;  // PokerStage enum
  @Type("number") dealerIndex: number;
  @Type("number") currentPlayerIndex: number;

  @Type([Card]) communityCards: Card[];
  @Type([PokerPlayer]) players: PokerPlayer[];

  @Type(Pot) pot: Pot;
  @Type("number") currentBet: number;
  @Type("number") smallBlind: number;
  @Type("number") bigBlind: number;
}

export class PokerRoom extends Room<PokerRoomState> {
  onCreate(options: any) {
    this.setState(new PokerRoomState());
    this.state.roomId = this.roomId;

    // Initialize game logic
    this.gameService.initialize(this.state, options);
  }

  onJoin(player: Player, options: any) {
    // Add player to room state
    this.gameService.addPlayer(this.state, player);
  }

  onMessage(player: Player, message: GameActionRequest) {
    // Validate and process action
    const response = this.gameService.processAction(
      this.state,
      player,
      message
    );

    // Broadcast state update
    if (response.success) {
      this.broadcastState();
    } else {
      player.send('error', { message: response.errorMessage });
    }
  }

  onLeave(player: Player, consented: boolean) {
    // Handle disconnection (reconnect window, AI takeover, or fold)
    this.gameService.handleDisconnect(this.state, player);
  }

  onDispose() {
    // Cleanup, save results to DB
    this.gameService.finalize(this.state);
  }
}
```

#### Key Backend Services:

**A. Game State Machine Service**
- Manages transitions between game states (IDLE → PLAYING → GAME_OVER)
- Validates state transitions per module rules
- Handles timeouts and auto-actions

**B. Rule Engine**
- Encapsulates game-specific rules (poker hand rankings, slot paylines, fish health)
- Provides pure functions for rule evaluation
- Easily testable and auditable

**C. Economy Service**
- Manages currency transactions (bets, wins, purchases)
- Implements atomic transactions to prevent race conditions
- Tracks all transactions for audit purposes

**D. Matchmaking Service**
- Creates and manages game rooms
- Matches players based on skill, stakes, preferences
- Handles room lifecycle (creation, full, cleanup)

**E. Audit & Anti-Fraud Service**
- Logs all game actions with timestamps
- Detects suspicious patterns (unusual win rates, collusion)
- Generates reports for compliance

---

### 4. Frontend Architecture (React + Galacean)

**Purpose**: Rendering, input handling, UI composition, and network communication.

#### Component Hierarchy:

```
apps/frontend/src/
├── main.tsx                    # App entry, Galacean canvas initialization
├── App.tsx                     # Root component, module router
├── components/
│   ├── CanvasWrapper.tsx       # Galacean canvas React component
│   ├── ModuleLoader.tsx        # Dynamic module switching
│   ├── ui/                     # Reusable UI components (buttons, modals)
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── HUD.tsx
│   │   └── ...
│   └── screens/
│       ├── LobbyScreen.tsx     # Game selection, room browser
│       ├── LoadingScreen.tsx
│       └── ...
├── hooks/
│   ├── useGameState.ts         # TanStack Store subscription
│   ├── useNetworkSync.ts       # Colyseus room hook
│   └── ...
├── stores/
│   ├── globalStore.ts          # App-wide state (user, settings)
│   ├── slotsStore.ts           # Slots-specific state
│   ├── fishingStore.ts
│   └── pokerStore.ts
└── modules/
    ├── slots/
    │   ├── SlotsModule.ts      # GameModule implementation
    │   ├── scenes/             # Galacean scene configs
    │   ├── scripts/            # Galacean scripts (reels, paylines)
    │   └── components/         # React UI overlays
    ├── fishing/
    └── poker/
```

#### Canvas Wrapper Pattern:

```tsx
// CanvasWrapper.tsx
import { useEffect, useRef } from 'react';
import { GameEngine } from '@carbuncle/game-engine';

interface CanvasWrapperProps {
  moduleId: GameModuleId;
  onModuleReady?: (module: GameModule) => void;
}

export function CanvasWrapper({ moduleId, onModuleReady }: CanvasWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Galacean Engine
    const engine = new GameEngine({
      canvas: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    engineRef.current = engine;

    // Load and start module
    engine.loadModule(moduleId).then((module) => {
      onModuleReady?.(module);
    });

    // Start game loop
    engine.start();

    // Cleanup
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [moduleId]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
```

#### State Management Pattern:

```tsx
// stores/slotsStore.ts
import { createStore } from '@tanstack/store';
import { SpinResultDTO, SlotMachineStateDTO } from '@carbuncle/shared-types';

interface SlotsState {
  currentVariant: SlotVariant | null;
  machineState: SlotMachineStateDTO | null;
  lastSpinResult: SpinResultDTO | null;
  isSpinning: boolean;
  balance: number;
}

const initialSlotsState: SlotsState = {
  currentVariant: null,
  machineState: null,
  lastSpinResult: null,
  isSpinning: false,
  balance: 0,
};

export const slotsStore = createStore(initialSlotsState);

// Custom hook for components
export function useSlotsStore<T>(selector: (state: SlotsState) => T) {
  return useStore(slotsStore, selector);
}
```

---

## Game Module Specifications

### 1. Slots Module

**Architecture:**
- **Backend**: RNG generation, payline calculation, bonus trigger logic, balance updates
- **Frontend**: Reel animation, symbol rendering, win line highlighting, bonus game UI
- **Sync**: Spin request → Backend validates → Returns result → Frontend animates to match

**Key Entities:**
- `SlotMachine`: Configuration (reels, rows, symbols, paylines)
- `SpinRecord`: Database record of each spin (bet, result, win amount)
- `BonusGame`: State for free spins, wheel bonuses, pick-em games

**Data Flow:**
```
Player clicks "Spin"
  → Frontend sends SpinRequestDTO
  → Backend validates bet, generates RNG result
  → Backend calculates paylines, bonuses, new balance
  → Backend returns SpinResultDTO
  → Frontend animates reels to match result
  → Frontend highlights winning lines
  → Frontend updates balance display
```

**Migration Tasks:**
1. Extract symbol IDs, payline patterns, bonus triggers from Cocos code
2. Define TypeScript types for all slot variants (TH, TP, VQMM, PhongThan)
3. Implement backend RNG and payline calculator
4. Create Galacean scripts for reel spinning and stopping
5. Build bonus game scenes (wheel, free spins, pick-em)
6. Migrate audio and sprite assets from Cocos to web formats

---

### 2. Fishing Module

**Architecture:**
- **Backend**: Fish spawning, movement paths, health/damage calculation, reward distribution
- **Frontend**: Fish rendering, bullet trajectory, collision visualization, catch effects
- **Sync**: Shoot request → Backend calculates hit → Returns damage/reward → Frontend shows impact

**Key Entities:**
- `Fish`: Type, health, speed, path, reward multiplier
- `Weapon`: Damage, spread, cost, special effects
- `Arena`: Room configuration, spawn rates, player limit
- `CatchRecord`: Database record of each catch (fish, player, damage, reward)

**Data Flow:**
```
Player aims and shoots
  → Frontend sends ShootRequestDTO (angle, power, weapon)
  → Backend spawns bullet, calculates trajectory
  → Backend checks collisions with fish
  → Backend applies damage, updates fish health
  → If fish dies: calculate reward, distribute to players
  → Backend broadcasts FishUpdateDTO (position, health changes)
  → Frontend renders bullet, impacts, fish deaths, rewards
```

**Migration Tasks:**
1. Extract fish types, behaviors, paths from Cocos code
2. Define TypeScript types for fish, weapons, arenas
3. Implement backend pathfinding and collision detection
4. Create Galacean scripts for fish swimming, bullet flight
5. Build boss battle mechanics (multi-phase, special attacks)
6. Migrate fish sprites, animations, and effects from Cocos

---

### 3. Poker Module

**Architecture:**
- **Backend**: Deck management, hand evaluation, blind rotation, betting rounds, side pots
- **Frontend**: Card rendering, chip stacks, action buttons, hand history, animations
- **Sync**: Player action → Backend validates → Updates state → Broadcasts to all players

**Key Entities:**
- `Deck`: 52 cards, shuffle state, dealt cards
- `Hand`: Player's 2 hole cards
- `CommunityCards`: 5 shared cards (flop, turn, river)
- `Pot`: Main pot + side pots
- `RoundResult`: Winner, winning hand, pot distribution

**Data Flow:**
```
Player selects action (fold, check, call, raise)
  → Frontend sends PokerActionRequestDTO
  → Backend validates action (is it player's turn? valid bet amount?)
  → Backend updates game state (chips, cards, stage)
  → Backend checks for round completion, advances stage
  → Backend evaluates hands at showdown
  → Backend distributes pot, updates balances
  → Backend broadcasts PokerRoomStateDTO to all players
  → Frontend updates UI, plays animations
```

**Migration Tasks:**
1. Port hand evaluation algorithms from legacy code
2. Implement side pot calculation logic
3. Define Colyseus schema for poker room state
4. Create Galacean scripts for card dealing, chip movement
5. Build UI for action buttons, bet sliders, hand history
6. Migrate card designs, table textures, chip models from Unity

---

## Cross-Cutting Concerns

### 1. Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (PLAYER, DEALER, ADMIN)
- **Session management** with automatic reconnection
- **Secure WebSocket connections** (WSS)

### 2. Economy & Monetization

- **Multi-currency system** (Coins, Gems, Tickets)
- **Atomic transactions** to prevent race conditions
- **Purchase history** and receipt validation (for mobile IAP)
- **Bonus systems** (daily rewards, achievements, tournaments)

### 3. Networking & Synchronization

- **Colyseus for authoritative state** (game rooms)
- **Socket.IO for general pub/sub** (chat, notifications)
- **Optimistic UI updates** with rollback on rejection
- **Reconnection handling** with state resync

### 4. Performance Optimization

- **Asset bundling and lazy loading** per module
- **Object pooling** for frequently spawned entities (bullets, fish, cards)
- **Level of detail (LOD)** for 3D models
- **Server-side rate limiting** and action throttling

### 5. Security & Anti-Cheat

- **Server-authoritative logic** (client never trusts itself)
- **Input validation** on all actions
- **Pattern detection** for collusion, botting, exploits
- **Audit logging** for compliance and dispute resolution

### 6. Analytics & Telemetry

- **Event tracking** (game starts, actions, outcomes)
- **Performance metrics** (FPS, latency, load times)
- **User behavior analytics** (retention, engagement, monetization)
- **Error reporting** with stack traces and context

---

## Migration Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Complete `@carbuncle/shared-types` library (all DTOs, entities, enums)
- [ ] Set up Galacean project structure in `@carbuncle/game-engine`
- [ ] Implement Scene Manager and Module Loader
- [ ] Create basic asset pipeline and manifest system
- [ ] Establish Colyseus integration pattern

### Phase 2: Slots Migration (Weeks 5-10)
- [ ] Extract slot configurations from Cocos code
- [ ] Implement backend slots service (RNG, paylines, bonuses)
- [ ] Create Colyseus room for slots
- [ ] Build Galacean reel animation scripts
- [ ] Develop bonus game scenes (wheel, free spins)
- [ ] Migrate assets (sprites, audio) from Cocos
- [ ] Integrate React UI overlays
- [ ] End-to-end testing and optimization

### Phase 3: Fishing Migration (Weeks 11-18)
- [ ] Extract fish behaviors and paths from Cocos code
- [ ] Implement backend fishing service (spawning, collision, rewards)
- [ ] Create Colyseus room for fishing arenas
- [ ] Build Galacean fish swimming and bullet scripts
- [ ] Implement boss battle mechanics
- [ ] Migrate fish sprites, animations, effects
- [ ] Integrate React UI for weapons, scores
- [ ] Multiplayer stress testing

### Phase 4: Poker Migration (Weeks 19-28)
- [ ] Port hand evaluation and side pot logic
- [ ] Implement backend poker service (deck, blinds, betting)
- [ ] Create Colyseus room with full state schema
- [ ] Build Galacean card dealing and chip scripts
- [ ] Develop UI for actions, bet controls, hand history
- [ ] Migrate card designs, table assets from Unity
- [ ] Implement tournament and cash game modes
- [ ] Disconnection/reconnection handling

### Phase 5: Unification & Polish (Weeks 29-32)
- [ ] Implement module switching without reload
- [ ] Create unified lobby screen
- [ ] Add cross-module features (friends, chat, achievements)
- [ ] Performance optimization across all modules
- [ ] Mobile responsiveness testing (Expo)
- [ ] Security audit and penetration testing
- [ ] Documentation and developer onboarding

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | React 18 + Vite | UI framework, build tool |
| **Frontend (Mobile)** | Expo React Native | Cross-platform mobile runtime |
| **Game Engine** | Galacean Engine | 2D/3D rendering, physics, animation |
| **State Management** | TanStack Store + Query | Client state, data fetching |
| **Backend** | NestJS v11 | Server framework, dependency injection |
| **Real-time** | Colyseus + Socket.IO | Multiplayer sync, pub/sub |
| **Database** | PostgreSQL 17 + pgvector | Relational data, vector search |
| **Cache** | Redis 7 | Session cache, pub/sub, queues |
| **Queues** | BullMQ | Background jobs, scheduled tasks |
| **ORM** | TypeORM | Database abstraction |
| **Validation** | class-validator + class-transformer | DTO validation, transformation |
| **Auth** | Passport + JWT + bcryptjs | Authentication, password hashing |
| **Monorepo** | Nx | Task orchestration, dependency graph |
| **Infrastructure** | Docker Compose | Local development environment |

---

## Glossary

- **Carbuncle**: The unified gaming platform name
- **Game Module**: A self-contained game experience (Slots, Fishing, Poker)
- **Scene**: A Galacean Engine scene containing visual elements for a module
- **Room**: A Colyseus multiplayer instance for a specific game session
- **Authoritative Server**: Backend holds true game state, client is a view
- **DTO (Data Transfer Object)**: Type-safe data structure for API communication
- **Entity**: Database model representing a domain object
- **Payline**: A winning combination pattern in slots
- **Side Pot**: Additional pots in poker when players go all-in with different amounts
- **Asset Manifest**: JSON file declaring all assets required by a scene/module

---

## Document Control

- **Version**: 1.0
- **Last Updated**: $(date +%Y-%m-%d)
- **Maintained By**: Core Architecture Team
- **Review Cycle**: Quarterly or upon major architectural changes

---

## Appendix A: Example File Structure

```
libs/shared/shared-types/src/
├── index.ts                    # Barrel exports
├── enums/
│   ├── game-module-id.enum.ts
│   ├── user-role.enum.ts
│   ├── game-state.enum.ts
│   └── currency-type.enum.ts
├── dtos/
│   ├── player.dto.ts
│   ├── room-config.dto.ts
│   ├── game-action.dto.ts
│   ├── slots/
│   │   ├── spin-request.dto.ts
│   │   ├── spin-result.dto.ts
│   │   └── ...
│   ├── fishing/
│   │   ├── shoot-request.dto.ts
│   │   ├── fish-spawn.dto.ts
│   │   └── ...
│   └── poker/
│       ├── card.dto.ts
│       ├── poker-action.dto.ts
│       └── ...
└── entities/
    ├── user.entity.ts
    ├── game-session.entity.ts
    ├── slots/
    │   ├── slot-machine.entity.ts
    │   └── spin-record.entity.ts
    ├── fishing/
    │   ├── fish.entity.ts
    │   └── catch-record.entity.ts
    └── poker/
        ├── deck.entity.ts
        └── round-result.entity.ts

libs/games/slots/src/
├── index.ts
├── slots.module.ts             # GameModule implementation
├── configs/
│   ├── th.config.ts            # Tien Hiep configuration
│   ├── tp.config.ts            # Than Tai configuration
│   └── ...
├── utils/
│   ├── payline-calculator.ts
│   └── bonus-trigger.ts
└── scenes/
    ├── slots.scene.json        # Galacean scene prefab
    └── bonus-wheel.scene.json

apps/backend/src/games/slots/
├── slots.gateway.ts
├── slots.service.ts
├── slots.room.ts
├── dto/                        # Re-exports from shared-types
└── utils/
    ├── rng-generator.ts
    └── payline-evaluator.ts

apps/frontend/src/modules/slots/
├── SlotsModule.ts
├── scenes/
│   └── slots.scene.json
├── scripts/
│   ├── reel-controller.ts
│   ├── payline-highlighter.ts
│   └── bonus-wheel-controller.ts
├── components/
│   ├── BetControls.tsx
│   ├── WinDisplay.tsx
│   └── AutoSpinToggle.tsx
└── stores/
    └── slotsStore.ts
```

---

## Appendix B: Colyseus Schema Example (Poker)

```typescript
import { Schema, Type, ArraySchema, MapSchema } from "@colyseus/schema";

export class Card extends Schema {
  @Type("string") suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  @Type("string") rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  @Type("boolean") faceUp: boolean;
}

export class PokerPlayer extends Schema {
  @Type("string") playerId: string;
  @Type("string") username: string;
  @Type([Card]) hand: ArraySchema<Card>;
  @Type("number") chips: number;
  @Type("number") currentRoundBet: number;
  @Type("boolean") hasFolded: boolean;
  @Type("boolean") isAllIn: boolean;
  @Type("string") lastAction?: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  @Type("number") seatIndex: number;
}

export class SidePot extends Schema {
  @Type("number") amount: number;
  @Type(["string"]) eligiblePlayerIds: ArraySchema<string>;
}

export class Pot extends Schema {
  @Type("number") main: number;
  @Type([SidePot]) sidePots: ArraySchema<SidePot>;
}

export class PokerRoomState extends Schema {
  @Type("string") roomId: string;
  @Type("number") stage: 0 | 1 | 2 | 3 | 4;  // preflop, flop, turn, river, showdown
  @Type("number") dealerIndex: number;
  @Type("number") currentPlayerIndex: number;
  @Type([Card]) communityCards: ArraySchema<Card>;
  @Type([PokerPlayer]) players: ArraySchema<PokerPlayer>;
  @Type(Pot) pot: Pot;
  @Type("number") currentBet: number;
  @Type("number") smallBlind: number;
  @Type("number") bigBlind: number;
  @Type("number") minRaise: number;
  @Type("string") gameId: string;
}
```

---

This architecture document serves as the authoritative reference for the Carbuncle platform migration. All development teams must adhere to these specifications to ensure consistency, maintainability, and scalability across all game modules.