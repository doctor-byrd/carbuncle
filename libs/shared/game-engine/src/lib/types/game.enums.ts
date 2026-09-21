// ============================================================================
// GAME MODE & SCENE IDENTIFICATION
// ============================================================================

/**
 * Identifies the current game mode the player is engaged in.
 * Used for state management, UI transitions, and backend routing.
 */
export enum GameModeId {
  RPG_EXPLORATION = 'rpg_exploration',
  RPG_COMBAT = 'rpg_combat',
  RPG_DIALOGUE = 'rpg_dialogue',
  MINIGAME_SLOTS = 'minigame_slots',
  MINIGAME_FISHING = 'minigame_fishing',
  MINIGAME_POKER = 'minigame_poker',
}

/**
 * Scene types for Galacean Engine scene management.
 * Each scene type corresponds to a specific rendering context.
 */
export enum SceneType {
  EXPLORATION = 'exploration',      // Overworld, towns, dungeons
  COMBAT = 'combat',                // Turn-based battle arena
  DIALOGUE = 'dialogue',            // Visual novel-style conversations
  SLOTS = 'slots',                  // Slots minigame
  FISHING = 'fishing',              // Fishing minigame
  POKER = 'poker',                  // Poker minigame
  LOADING = 'loading',              // Loading/transition scene
  MAIN_MENU = 'main_menu',          // Title screen
  PAUSE_MENU = 'pause_menu',        // In-game pause overlay
}

/**
 * Player roles and permissions within game sessions.
 */
export enum UserRole {
  PLAYER = 'player',
  PARTY_LEADER = 'party_leader',    // For multiplayer parties
  SPECTATOR = 'spectator',
  ADMIN = 'admin',
}

/**
 * Current state of the game session.
 */
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

// ============================================================================
// CHARACTER & COMBAT ENUMS
// ============================================================================

/**
 * Character classes/archetypes defining playstyle and stat growth.
 */
export enum CharacterClass {
  WARRIOR = 'warrior',      // High STR/END, melee focused
  MAGE = 'mage',            // High MAG, spell caster
  ROGUE = 'rogue',          // High DEX/LUK, critical focused
  HEALER = 'healer',        // Support, healing and buffs
  GUNNER = 'gunner',        // Ranged physical attacker
  PALADIN = 'paladin',      // Tank with holy abilities
  DARK_KNIGHT = 'dark_knight', // High risk/high reward
  BARD = 'bard',            // Buffer/debuffer specialist
}

/**
 * Primary attribute types for character stats.
 */
export enum StatType {
  STRENGTH = 'strength',      // Physical damage, carry capacity
  MAGIC = 'magic',            // Spell power, mana pool
  DEXTERITY = 'dexterity',    // Accuracy, evasion, critical rate
  ENDURANCE = 'endurance',    // HP, defense, status resistance
  LUCK = 'luck',              // Drop rates, critical damage, rare events
  AGILITY = 'agility',        // Turn order, movement speed
}

/**
 * Combat action types available during battle.
 */
export enum CombatActionType {
  ATTACK = 'attack',          // Basic weapon attack
  SKILL = 'skill',            // Special ability/spell
  ITEM = 'item',              // Use inventory item
  DEFEND = 'defend',          // Reduce incoming damage
  FLEE = 'flee',              // Attempt to escape combat
  SWITCH = 'switch',          // Change active character/persona
  ULTIMATE = 'ultimate',      // Special ultimate ability
}

/**
 * Target selection types for skills and abilities.
 */
export enum TargetType {
  SINGLE_ENEMY = 'single_enemy',
  ALL_ENEMIES = 'all_enemies',
  SINGLE_ALLY = 'single_ally',
  ALL_ALLIES = 'all_allies',
  SELF = 'self',
  RANDOM_ENEMY = 'random_enemy',
  LOWEST_HP_ENEMY = 'lowest_hp_enemy',
  HIGHEST_THREAT_ENEMY = 'highest_threat_enemy',
}

/**
 * Elemental affinity types for damage calculation and resistances.
 * Based on Persona 3 Dual's element system, adapted for Carbuncle.
 */
export enum ElementType {
  FIRE = 'fire',
  ICE = 'ice',
  WIND = 'wind',
  ELECTRICITY = 'electricity',
  LIGHT = 'light',
  DARK = 'dark',
  EARTH = 'earth',
  WATER = 'water',
  HOLY = 'holy',
  SHADOW = 'shadow',
  PHYSICAL_STRIKE = 'physical_strike',
  PHYSICAL_SLASH = 'physical_slash',
  PHYSICAL_PIERCE = 'physical_pierce',
  ALMIGHTY = 'almighty',      // Ignores resistances
  HEALING = 'healing',
}

/**
 * Affinity levels determining how elements interact with targets.
 */
export enum AffinityLevel {
  WEAK = 'weak',          // Takes increased damage
  NORMAL = 'normal',      // Standard damage
  RESIST = 'resist',      // Takes reduced damage
  NULLIFY = 'nullify',    // Immune to damage
  ABSORB = 'absorb',      // Heals from damage
  REPEL = 'repel',        // Reflects damage back
}

/**
 * Skill classification for categorization and filtering.
 */
export enum SkillType {
  REGULAR_ATTACK = 'regular_attack',
  ACTIVE_DAMAGE = 'active_damage',
  ACTIVE_HEAL = 'active_heal',
  ACTIVE_BUFF = 'active_buff',
  ACTIVE_DEBUFF = 'active_debuff',
  PASSIVE_STAT_BOOST = 'passive_stat_boost',
  PASSIVE_RESISTANCE = 'passive_resistance',
  PASSIVE_COUNTER = 'passive_counter',
  ULTIMATE = 'ultimate',
  ALL_OUT_ATTACK = 'all_out_attack',
}

/**
 * Skill damage category (physical vs magical).
 */
export enum SkillRace {
  PHYSICAL = 'phys',
  MAGICAL = 'mag',
  TRUE = 'true',          // Ignores defense calculations
}

/**
 * Status effects that can be applied to characters/enemies.
 */
export enum StatusEffectType {
  // Damage over time
  POISON = 'poison',
  BURN = 'burn',
  FREEZE = 'freeze',
  SHOCK = 'shock',
  
  // Control effects
  PARALYSIS = 'paralysis',    // Chance to skip turn
  SLEEP = 'sleep',            // Cannot act, wake on damage
  CONFUSION = 'confusion',    // Random target selection
  CHARM = 'charm',            // Attack allies
  FEAR = 'fear',              // Cannot attack source
  STUN = 'stun',              // Skip next turn
  
  // Stat modifications
  BERSERK = 'berserk',        // Increased ATK, decreased DEF
  SHIELD = 'shield',          // Damage absorption barrier
  REGEN = 'regen',            // HP regeneration
  BARRIER = 'barrier',        // Magic damage reduction
  REFLECT = 'reflect',        // Reflect projectiles/skills
  
  // Special states
  INVINCIBLE = 'invincible',  // Temporary immunity
  INVISIBLE = 'invisible',    // Cannot be targeted
  SILENCED = 'silenced',      // Cannot use skills
  DISABLED = 'disabled',      // Cannot use items
  MARKED = 'marked',          // Takes increased damage
}

/**
 * Weapon categories for equipment and skill requirements.
 */
export enum WeaponType {
  ONE_HANDED_SWORD = 'one_handed_sword',
  TWO_HANDED_SWORD = 'two_handed_sword',
  DAGGER = 'dagger',
  AXE = 'axe',
  SPEAR = 'spear',
  BOW = 'bow',
  GUN = 'gun',
  STAFF = 'staff',
  WAND = 'wand',
  FISTS = 'fists',
  CLAWS = 'claws',
  WHIP = 'whip',
  THROWING = 'throwing',
  SHIELD = 'shield',
  OFF_HAND = 'off_hand',
}

/**
 * Armor categories for equipment slots and restrictions.
 */
export enum ArmorType {
  CLOTH = 'cloth',
  LEATHER = 'leather',
  CHAIN_MAIL = 'chain_mail',
  PLATE = 'plate',
  ROBE = 'robe',
  LIGHT_ARMOR = 'light_armor',
  HEAVY_ARMOR = 'heavy_armor',
  ACCESSORY_HEAD = 'accessory_head',
  ACCESSORY_NECK = 'accessory_neck',
  ACCESSORY_RING = 'accessory_ring',
  ACCESSORY_TRINKET = 'accessory_trinket',
}

/**
 * Equipment slot identifiers.
 */
export enum EquipmentSlot {
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  HEAD = 'head',
  CHEST = 'chest',
  LEGS = 'legs',
  FEET = 'feet',
  HANDS = 'hands',
  NECK = 'neck',
  RING_1 = 'ring_1',
  RING_2 = 'ring_2',
  TRINKET_1 = 'trinket_1',
  TRINKET_2 = 'trinket_2',
}

// ============================================================================
// ECONOMY & INVENTORY ENUMS
// ============================================================================

/**
 * Currency types used throughout the game economy.
 */
export enum CurrencyType {
  GOLD = 'gold',              // Primary currency
  GEMS = 'gems',              // Premium currency
  TOKENS = 'tokens',          // Minigame-specific tokens
  REPUTATION = 'reputation',  // Faction/trust currency
  ARENA_POINTS = 'arena_points',
  EVENT_CURRENCY = 'event_currency',
}

/**
 * Item categories for inventory organization and filtering.
 */
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  KEY_ITEM = 'key_item',
  QUEST_ITEM = 'quest_item',
  TREASURE = 'treasure',
  CRAFTING_RECIPE = 'crafting_recipe',
  CARD = 'card',              // For card collection system
}

/**
 * Item rarity tiers affecting stats, drop rates, and value.
 */
export enum ItemRarity {
  COMMON = 'common',          // White
  UNCOMMON = 'uncommon',      // Green
  RARE = 'rare',              // Blue
  EPIC = 'epic',              // Purple
  LEGENDARY = 'legendary',    // Orange
  MYTHIC = 'mythic',          // Red
  UNIQUE = 'unique',          // One-of-a-kind items
}

/**
 * Consumable item subcategories for effect application.
 */
export enum ConsumableType {
  HEALTH_POTION = 'health_potion',
  MANA_POTION = 'mana_potion',
  STAMINA_POTION = 'stamina_potion',
  BUFF_POTION = 'buff_potion',
  ANTIDOTE = 'antidote',
  REVIVAL = 'revival',
  FOOD = 'food',
  SCROLL = 'scroll',
  BOMB = 'bomb',
  TRAP = 'trap',
}

// ============================================================================
// EXPLORATION & WORLD ENUMS
// ============================================================================

/**
 * Map/area types for navigation and encounter rules.
 */
export enum MapType {
  TOWN = 'town',              // Safe zone, no random encounters
  OVERWORLD = 'overworld',    // Open world with random encounters
  DUNGEON = 'dungeon',        // Instanced area with bosses
  ARENA = 'arena',            // PvP or challenge area
  MINIGAME_ZONE = 'minigame_zone',
  INSTANCE = 'instance',      // Story-critical instanced area
  HUB = 'hub',                // Central connecting area
  SECRET = 'secret',          // Hidden/unlocked areas
}

/**
 * Trigger zone types for event activation.
 */
export enum TriggerType {
  TELEPORT = 'teleport',      // Transport to another map
  EVENT = 'event',            // Start cutscene or dialogue
  BATTLE = 'battle',          // Initiate combat encounter
  CUTSCENE = 'cutscene',      // Play cinematic
  SHOP = 'shop',              // Open merchant interface
  INN = 'inn',                // Rest and recover
  SAVE_POINT = 'save_point',  // Manual save location
  CHEST = 'chest',            // Loot container
  NPC_INTERACT = 'npc_interact',
  QUEST_START = 'quest_start',
  QUEST_END = 'quest_end',
  ZONE_ENTRY = 'zone_entry',
  ZONE_EXIT = 'zone_exit',
}

/**
 * NPC behavior patterns and interaction modes.
 */
export enum NPCType {
  STANDARD = 'standard',      // Basic dialogue NPC
  MERCHANT = 'merchant',      // Buy/sell items
  INNKEEPER = 'innkeeper',    // Rest services
  QUEST_GIVER = 'quest_giver',
  GUIDE = 'guide',            // Tutorial hints
  COMPANION = 'companion',    // Party member NPC
  ENEMY = 'enemy',            // Hostile NPC
  BOSS = 'boss',
  SPECIAL = 'special',        // Unique story NPCs
}

/**
 * Time periods affecting gameplay mechanics.
 */
export enum TimePeriod {
  DAWN = 'dawn',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  DUSK = 'dusk',
  NIGHT = 'night',
  MIDNIGHT = 'midnight',
}

/**
 * Weather conditions affecting exploration and combat.
 */
export enum WeatherType {
  CLEAR = 'clear',
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  STORMY = 'stormy',
  SNOWY = 'snowy',
  FOGGY = 'foggy',
  SANDSTORM = 'sandstorm',
}

// ============================================================================
// QUEST & PROGRESSION ENUMS
// ============================================================================

/**
 * Quest difficulty ratings.
 */
export enum QuestDifficulty {
  TUTORIAL = 'tutorial',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Quest completion status tracking.
 */
export enum QuestStatus {
  AVAILABLE = 'available',    // Can be accepted
  ACTIVE = 'active',          // Currently in progress
  COMPLETED = 'completed',    // Finished successfully
  FAILED = 'failed',          // Failed conditions
  ABANDONED = 'abandoned',    // Player gave up
  UNAVAILABLE = 'unavailable', // Prerequisites not met
}

/**
 * Objective types for quest design.
 */
export enum QuestObjectiveType {
  KILL_ENEMY = 'kill_enemy',
  COLLECT_ITEM = 'collect_item',
  DELIVER_ITEM = 'deliver_item',
  REACH_LOCATION = 'reach_location',
  INTERACT_NPC = 'interact_npc',
  COMPLETE_DUNGEON = 'complete_dungeon',
  DEFEAT_BOSS = 'defeat_boss',
  WIN_BATTLE = 'win_battle',
  WIN_BATTLES_COUNT = 'win_battles_count',
  REACH_LEVEL = 'reach_level',
  ACQUIRE_SKILL = 'acquire_skill',
  OBTAIN_EQUIPMENT = 'obtain_equipment',
  EARN_CURRENCY = 'earn_currency',
  TIME_LIMIT = 'time_limit',
  DIALOGUE_CHOICE = 'dialogue_choice',
}

/**
 * Achievement categories for tracking and rewards.
 */
export enum AchievementCategory {
  STORY = 'story',
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  COLLECTION = 'collection',
  SOCIAL = 'social',
  MINIGAME = 'minigame',
  CHALLENGE = 'challenge',
  SECRET = 'secret',
}

// ============================================================================
// DIALOGUE SYSTEM ENUMS
// ============================================================================

/**
 * Dialogue node types for branching conversation trees.
 */
export enum DialogueNodeType {
  TEXT = 'text',              // Standard dialogue text
  CHOICE = 'choice',          // Player decision point
  CONDITIONAL = 'conditional', // Branch based on conditions
  ACTION = 'action',          // Trigger game action
  END = 'end',                // Conversation terminator
  JUMP = 'jump',              // Jump to another node
  WAIT = 'wait',              // Timed pause
  ANIMATION = 'animation',    // Play character animation
  CAMERA = 'camera',          // Change camera angle
  EFFECT = 'effect',          // Visual/audio effect
}

/**
 * Dialogue requirement types for conditional branching.
 */
export enum DialogueRequirementType {
  STAT_CHECK = 'stat_check',
  ITEM_CHECK = 'item_check',
  REPUTATION_CHECK = 'reputation_check',
  FLAG_CHECK = 'flag_check',
  QUEST_STATUS = 'quest_status',
  CLASS_CHECK = 'class_check',
  LEVEL_CHECK = 'level_check',
  PREVIOUS_CHOICE = 'previous_choice',
  TIME_OF_DAY = 'time_of_day',
  PARTY_MEMBER = 'party_member',
}

/**
 * Comparison operators for requirement evaluation.
 */
export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_OR_EQUAL = 'greater_or_equal',
  LESS_OR_EQUAL = 'less_or_equal',
  HAS = 'has',
  DOES_NOT_HAVE = 'does_not_have',
  CONTAINS = 'contains',
}

// ============================================================================
// PARTY & SOCIAL ENUMS
// ============================================================================

/**
 * Party member roles and responsibilities.
 */
export enum PartyRole {
  LEADER = 'leader',
  MEMBER = 'member',
  SUB_LEADER = 'sub_leader',
  RECRUITER = 'recruiter',
}

/**
 * Party recruitment settings visibility.
 */
export enum PartyRecruitmentStatus {
  OPEN = 'open',
  INVITE_ONLY = 'invite_only',
  CLOSED = 'closed',
  FULL = 'full',
}

/**
 * Relationship levels between characters.
 */
export enum RelationshipLevel {
  STRANGER = 'stranger',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  CLOSE_FRIEND = 'close_friend',
  BEST_FRIEND = 'best_friend',
  ROMANTIC = 'romantic',
  RIVAL = 'rival',
  ENEMY = 'enemy',
}

/**
 * Social link arcana/types (Persona-inspired).
 */
export enum SocialLinkType {
  FOOL = 'fool',
  MAGICIAN = 'magician',
  PRIESTESS = 'priestess',
  EMPRESS = 'empress',
  EMPEROR = 'emperor',
  HIEROPHANT = 'hierophant',
  LOVERS = 'lovers',
  CHARIOT = 'chariot',
  JUSTICE = 'justice',
  HERMIT = 'hermit',
  FORTUNE = 'fortune',
  STRENGTH = 'strength',
  HANGED_MAN = 'hanged_man',
  DEATH = 'death',
  TEMPERANCE = 'temperance',
  DEVIL = 'devil',
  TOWER = 'tower',
  STAR = 'star',
  MOON = 'moon',
  SUN = 'sun',
  JUDGEMENT = 'judgement',
  WORLD = 'world',
}

// ============================================================================
// COMBAT SYSTEM ENUMS (EXTENDED)
// ============================================================================

/**
 * Battle phase/stage indicators for turn management.
 */
export enum BattlePhase {
  INITIALIZATION = 'initialization',
  TURN_ORDER_CALCULATION = 'turn_order_calculation',
  PLAYER_TURN_SELECT = 'player_turn_select',
  PLAYER_TURN_ACTION = 'player_turn_action',
  PLAYER_TURN_CONFIRM = 'player_turn_confirm',
  ENEMY_TURN_SELECT = 'enemy_turn_select',
  ENEMY_TURN_ACTION = 'enemy_turn_action',
  ACTION_RESOLUTION = 'action_resolution',
  DAMAGE_CALCULATION = 'damage_calculation',
  STATUS_EFFECT_RESOLUTION = 'status_effect_resolution',
  TURN_END_CHECK = 'turn_end_check',
  VICTORY_CHECK = 'victory_check',
  DEFEAT_CHECK = 'defeat_check',
  REWARD_DISTRIBUTION = 'reward_distribution',
  BATTLE_END = 'battle_end',
}

/**
 * Battle start conditions affecting turn order.
 */
export enum BattleStartCondition {
  NORMAL = 'normal',          // Standard initiative
  FIRST_STRIKE = 'first_strike',      // Player advantage
  ENEMY_AMBUSH = 'enemy_ambush',      // Enemy advantage
  SURROUNDED = 'surrounded',  // Severe enemy advantage
  BACK_ATTACK = 'back_attack', // Player rear attack bonus
}

/**
 * Participant types in combat.
 */
export enum CombatParticipantType {
  PLAYER = 'player',
  PARTY_MEMBER = 'party_member',
  ALLY_NPC = 'ally_npc',
  ENEMY = 'enemy',
  BOSS = 'boss',
  SUMMON = 'summon',
  PET = 'pet',
  MERCENARY = 'mercenary',
}

/**
 * Turn result outcomes for action resolution.
 */
export enum TurnResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  MISS = 'miss',
  DODGED = 'dodged',
  BLOCKED = 'blocked',
  PARRIED = 'parried',
  CRITICAL = 'critical',
  WEAK_HIT = 'weak_hit',
  IMMUNE = 'immune',
  ABSORBED = 'absorbed',
  REFLECTED = 'reflected',
  COUNTERED = 'countered',
  INTERRUPTED = 'interrupted',
}

/**
 * AI behavior patterns for enemies.
 */
export enum AIBehavior {
  AGGRESSIVE = 'aggressive',      // Always attack
  DEFENSIVE = 'defensive',        // Prioritize defense/healing
  BALANCED = 'balanced',          // Mixed strategy
  SMART = 'smart',                // Exploit weaknesses
  RANDOM = 'random',              // Unpredictable
  PROTECT_WEAK = 'protect_weak',  // Guard low-HP allies
  TARGET_LOW_HP = 'target_low_hp', // Focus wounded targets
  TARGET_HIGH_THREAT = 'target_high_threat', // Focus DPS
  FLEE_WHEN_WEAK = 'flee_when_weak',
  BOSS_PHASE_1 = 'boss_phase_1',
  BOSS_PHASE_2 = 'boss_phase_2',
  BOSS_PHASE_3 = 'boss_phase_3',
  ENRAGED = 'enraged',
}

// ============================================================================
// GAMBA SYSTEM ENUMS (MINIGAME INTEGRATION)
// ============================================================================

/**
 * Gamba machine variants (Slots).
 */
export enum SlotVariant {
  LUCKY_CARBY = 'lucky_carby',        // Classic 3-reel, 5 paylines
  SEVEN_SEAS = 'seven_seas',          // 5-reel, 20 paylines, pirate theme
  CRYSTAL_FORTUNE = 'crystal_fortune', // 5-reel, 25 paylines, gem theme
  DRAGON_WHEEL = 'dragon_wheel',      // Bonus wheel feature
  CARBUNCLE_JACKPOT = 'carbuncle_jackpot', // Progressive jackpot
}

/**
 * Bonus game types for slot machines.
 */
export enum SlotBonusType {
  FREE_SPINS = 'free_spins',
  PICK_EM = 'pick_em',
  WHEEL_SPIN = 'wheel_spin',
  CASCADE = 'cascade',
  EXPANDING_WILDS = 'expanding_wilds',
  MULTIPLIER_BONUS = 'multiplier_bonus',
}

/**
 * Fish types for fishing minigame.
 */
export enum FishType {
  SMALL_FISH = 'small_fish',
  MEDIUM_FISH = 'medium_fish',
  LARGE_FISH = 'large_fish',
  BOSS_FISH = 'boss_fish',
  SPECIAL_FISH = 'special_fish',    // Bomb, Lightning, etc.
  RARE_FISH = 'rare_fish',          // Collectible species
  LEGENDARY_FISH = 'legendary_fish',
  TREASURE_CHEST = 'treasure_chest', // Rare catch
}

/**
 * Fishing rod/equipment tiers.
 */
export enum FishingRodTier {
  BASIC = 'basic',
  IMPROVED = 'improved',
  ADVANCED = 'advanced',
  MASTER = 'master',
  LEGENDARY = 'legendary',
}

/**
 * Poker game stages.
 */
export enum PokerStage {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown',
}

/**
 * Poker actions available to players.
 */
export enum PokerAction {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  RAISE = 'raise',
  ALL_IN = 'all_in',
  RE_RAISE = 're_raise',
}

/**
 * Poker hand rankings.
 */
export enum PokerHandRank {
  HIGH_CARD = 'high_card',
  ONE_PAIR = 'one_pair',
  TWO_PAIR = 'two_pair',
  THREE_OF_A_KIND = 'three_of_a_kind',
  STRAIGHT = 'straight',
  FLUSH = 'flush',
  FULL_HOUSE = 'full_house',
  FOUR_OF_A_KIND = 'four_of_a_kind',
  STRAIGHT_FLUSH = 'straight_flush',
  ROYAL_FLUSH = 'royal_flush',
}

// ============================================================================
// ENGINE & ECS ENUMS
// ============================================================================

/**
 * Event types for the pub/sub event bus.
 */
export enum GameEventType {
  // Exploration Events
  PLAYER_MOVED = 'player_moved',
  PLAYER_POSITION_UPDATED = 'player_position_updated',
  NPC_INTERACTED = 'npc_interacted',
  TRIGGER_ENTERED = 'trigger_entered',
  TRIGGER_EXITED = 'trigger_exited',
  CHEST_OPENED = 'chest_opened',
  CHEST_LOOTED = 'chest_looted',
  MAP_DISCOVERED = 'map_discovered',
  AREA_ENTERED = 'area_entered',
  AREA_EXITED = 'area_exited',
  FAST_TRAVEL_USED = 'fast_travel_used',
  
  // Combat Events
  COMBAT_STARTED = 'combat_started',
  COMBAT_ENCOUNTER_TRIGGERED = 'combat_encounter_triggered',
  TURN_STARTED = 'turn_started',
  TURN_ENDED = 'turn_ended',
  ACTION_SELECTED = 'action_selected',
  ACTION_EXECUTED = 'action_executed',
  ACTION_RESOLVED = 'action_resolved',
  DAMAGE_DEALT = 'damage_dealt',
  DAMAGE_RECEIVED = 'damage_received',
  HEALING_APPLIED = 'healing_applied',
  STATUS_APPLIED = 'status_applied',
  STATUS_REMOVED = 'status_removed',
  STATUS_TICK = 'status_tick',
  ENEMY_DEFEATED = 'enemy_defeated',
  ENEMY_SPAWNED = 'enemy_spawned',
  PARTICIPANT_ADDED = 'participant_added',
  PARTICIPANT_REMOVED = 'participant_removed',
  COMBAT_VICTORY = 'combat_victory',
  COMBAT_DEFEAT = 'combat_defeat',
  COMBAT_ENDED = 'combat_ended',
  EXPERIENCE_GAINED = 'experience_gained',
  LEVEL_UP = 'level_up',
  LOOT_DROPPED = 'loot_dropped',
  LOOT_PICKED_UP = 'loot_picked_up',
  
  // Dialogue Events
  DIALOGUE_STARTED = 'dialogue_started',
  DIALOGUE_NODE_ADVANCED = 'dialogue_node_advanced',
  DIALOGUE_CHOICE_MADE = 'dialogue_choice_made',
  DIALOGUE_BRANCH_TAKEN = 'dialogue_branch_taken',
  DIALOGUE_ENDED = 'dialogue_ended',
  RELATIONSHIP_CHANGED = 'relationship_changed',
  
  // Quest Events
  QUEST_ACCEPTED = 'quest_accepted',
  QUEST_OBJECTIVE_COMPLETED = 'quest_objective_completed',
  QUEST_PROGRESS_UPDATED = 'quest_progress_updated',
  QUEST_COMPLETED = 'quest_completed',
  QUEST_FAILED = 'quest_failed',
  QUEST_ABANDONED = 'quest_abandoned',
  QUEST_TRACKED = 'quest_tracked',
  QUEST_UNTRACKED = 'quest_untracked',
  
  // Inventory & Economy Events
  ITEM_ACQUIRED = 'item_acquired',
  ITEM_LOST = 'item_lost',
  ITEM_USED = 'item_used',
  ITEM_EQUIPPED = 'item_equipped',
  ITEM_UNEQUIPPED = 'item_unequipped',
  ITEM_STACK_CHANGED = 'item_stack_changed',
  CURRENCY_CHANGED = 'currency_changed',
  GOLD_GAINED = 'gold_gained',
  GOLD_SPENT = 'gold_spent',
  SHOP_PURCHASE = 'shop_purchase',
  SHOP_SOLD = 'shop_sold',
  CRAFTING_STARTED = 'crafting_started',
  CRAFTING_COMPLETED = 'crafting_completed',
  
  // Party & Social Events
  PARTY_CREATED = 'party_created',
  PARTY_DISBANDED = 'party_disbanded',
  PARTY_MEMBER_JOINED = 'party_member_joined',
  PARTY_MEMBER_LEFT = 'party_member_left',
  PARTY_MEMBER_KICKED = 'party_member_kicked',
  PARTY_LEADER_CHANGED = 'party_leader_changed',
  PARTY_FORMATION_CHANGED = 'party_formation_changed',
  FRIEND_REQUEST_SENT = 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  FRIEND_REQUEST_DECLINED = 'friend_request_declined',
  FRIEND_REMOVED = 'friend_removed',
  SOCIAL_LINK_ADVANCED = 'social_link_advanced',
  
  // Minigame Events
  MINIGAME_STARTED = 'minigame_started',
  MINIGAME_ACTION = 'minigame_action',
  MINIGAME_RESULT = 'minigame_result',
  MINIGAME_SCORE_UPDATED = 'minigame_score_updated',
  MINIGAME_ROUND_ENDED = 'minigame_round_ended',
  MINIGAME_ENDED = 'minigame_ended',
  MINIGAME_REWARD_CLAIMED = 'minigame_reward_claimed',
  
  // System Events
  GAME_LOADED = 'game_loaded',
  GAME_SAVED = 'game_saved',
  SETTINGS_CHANGED = 'settings_changed',
  AUDIO_VOLUME_CHANGED = 'audio_volume_changed',
  GRAPHICS_SETTINGS_CHANGED = 'graphics_settings_changed',
  INPUT_BINDING_CHANGED = 'input_binding_changed',
  SCENE_LOADED = 'scene_loaded',
  SCENE_UNLOADED = 'scene_unloaded',
  TRANSITION_STARTED = 'transition_started',
  TRANSITION_COMPLETED = 'transition_completed',
  PAUSE_TOGGLED = 'pause_toggled',
  QUIT_REQUESTED = 'quit_requested',
  ERROR_OCCURRED = 'error_occurred',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  NOTIFICATION_RECEIVED = 'notification_received',
}

/**
 * Component types for ECS entity composition.
 */
export enum ComponentType {
  // Transform & Physics
  TRANSFORM = 'transform',
  MOVEMENT = 'movement',
  COLLIDER = 'collider',
  RIGIDBODY = 'rigidbody',
  NAVIGATION = 'navigation',
  
  // Rendering
  MESH_RENDERER = 'mesh_renderer',
  SPRITE_RENDERER = 'sprite_renderer',
  ANIMATOR = 'animator',
  PARTICLE_SYSTEM = 'particle_system',
  LIGHT = 'light',
  CAMERA = 'camera',
  
  // Gameplay
  CHARACTER_STATS = 'character_stats',
  COMBAT_ENTITY = 'combat_entity',
  INVENTORY = 'inventory',
  INTERACTABLE = 'interactable',
  TRIGGER_ZONE = 'trigger_zone',
  DIALOGUE_ACTOR = 'dialogue_actor',
  QUEST_GIVER = 'quest_giver',
  MERCHANT = 'merchant',
  
  // AI
  AI_CONTROLLER = 'ai_controller',
  PATROL_PATH = 'patrol_path',
  AGGRO_ZONE = 'aggro_zone',
  
  // Audio
  AUDIO_SOURCE = 'audio_source',
  AUDIO_LISTENER = 'audio_listener',
  
  // UI
  CANVAS_ELEMENT = 'canvas_element',
  UI_TEXT = 'ui_text',
  UI_BUTTON = 'ui_button',
  UI_IMAGE = 'ui_image',
  
  // Network
  NETWORK_SYNC = 'network_sync',
  REPLICATION = 'replication',
}

/**
 * System priority levels for update ordering.
 */
export enum SystemPriority {
  HIGHEST = 0,
  INPUT = 100,
  NETWORK = 200,
  PHYSICS = 300,
  AI = 400,
  GAMEPLAY = 500,
  ANIMATION = 600,
  RENDERING = 700,
  AUDIO = 800,
  UI = 900,
  LOWEST = 1000,
}