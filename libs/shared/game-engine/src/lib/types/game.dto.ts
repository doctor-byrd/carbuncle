import { AchievementCategory, AIBehavior, ArmorType, BattlePhase, BattleStartCondition, CharacterClass, CombatActionType, CombatParticipantType, ComparisonOperator, CurrencyType, DialogueNodeType, DialogueRequirementType, ElementType, EquipmentSlot, FishingRodTier, FishType, GameEventType, ItemRarity, ItemType, MapType, NPCType, PartyRecruitmentStatus, PartyRole, PokerAction, PokerHandRank, PokerStage, QuestDifficulty, QuestObjectiveType, QuestStatus, RelationshipLevel, SkillRace, SkillType, SlotBonusType, SlotVariant, SocialLinkType, StatType, StatusEffectType, TargetType, TimePeriod, TriggerType, TurnResult, UserRole, WeaponType, WeatherType } from "./game.enums.js";

// ============================================================================
// USER & AUTHENTICATION DTOs
// ============================================================================

/**
 * User account information for authentication and profile management.
 */
export interface UserAccountDTO {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date;
  role: UserRole;
  isActive: boolean;
  preferences: UserPreferencesDTO;
}

/**
 * User preference settings for customization.
 */
export interface UserPreferencesDTO {
  language: string;
  audioVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  controllerSensitivity: number;
  textSpeed: number;
  autoSaveEnabled: boolean;
  accessibilityOptions: AccessibilityOptionsDTO;
}

/**
 * Accessibility options for inclusive gameplay.
 */
export interface AccessibilityOptionsDTO {
  highContrastMode: boolean;
  largeText: boolean;
  colorBlindFriendly: boolean;
  subtitleSize: number;
  vibrationEnabled: boolean;
  narratorVoice: string;
}

// ============================================================================
// CHARACTER & COMBAT DTOs
// ============================================================================

/**
 * Core character statistics and attributes.
 */
export interface CharacterStatsDTO {
  level: number;
  experience: number;
  experienceToNext: number;
  class: CharacterClass;
  
  // Primary stats
  strength: number;
  magic: number;
  dexterity: number;
  endurance: number;
  luck: number;
  agility: number;
  
  // Derived stats
  maxHp: number;
  currentHp: number;
  maxMp: number;
  currentMp: number;
  maxSp: number;
  currentSp: number;
  
  // Combat stats
  attackPower: number;
  magicPower: number;
  defense: number;
  magicDefense: number;
  accuracy: number;
  evasion: number;
  criticalRate: number;
  criticalDamage: number;
  speed: number;
  
  // Resistances
  fireResistance: number;
  iceResistance: number;
  windResistance: number;
  electricityResistance: number;
  lightResistance: number;
  darkResistance: number;
  earthResistance: number;
  waterResistance: number;
  physicalResistance: number;
  almightyResistance: number;
}

/**
 * Character entity with stats and progression data.
 */
export interface CharacterEntityDTO {
  id: string;
  name: string;
  class: CharacterClass;
  stats: CharacterStatsDTO;
  equipment: EquipmentSetDTO;
  skills: CharacterSkillDTO[];
  statusEffects: ActiveStatusEffectDTO[];
  position: Vector3DTO;
  rotation: Vector3DTO;
  isAlive: boolean;
  isControlledByPlayer: boolean;
  partyRole?: PartyRole;
}

/**
 * Equipment set containing all equipped items.
 */
export interface EquipmentSetDTO {
  mainHand?: EquipmentItemDTO;
  offHand?: EquipmentItemDTO;
  head?: EquipmentItemDTO;
  chest?: EquipmentItemDTO;
  legs?: EquipmentItemDTO;
  feet?: EquipmentItemDTO;
  hands?: EquipmentItemDTO;
  neck?: EquipmentItemDTO;
  ring1?: EquipmentItemDTO;
  ring2?: EquipmentItemDTO;
  trinket1?: EquipmentItemDTO;
  trinket2?: EquipmentItemDTO;
}

/**
 * Base equipment item with stats and properties.
 */
export interface EquipmentItemDTO extends BaseItemDTO {
  weaponType?: WeaponType;
  armorType?: ArmorType;
  slot: EquipmentSlot;
  attackPower?: number;
  magicPower?: number;
  defense?: number;
  magicDefense?: number;
  elementalBonuses: Record<ElementType, number>;
  statBonuses: Partial<Record<StatType, number>>;
  skillRequirements: { skillId: string; level: number }[];
  durability: number;
  maxDurability: number;
}

/**
 * Base item structure for all inventory items.
 */
export interface BaseItemDTO {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackSize: number;
  maxStackSize: number;
  iconPath: string;
  modelPath: string;
}

/**
 * Character skill with usage and cooldown data.
 */
export interface CharacterSkillDTO {
  skillId: string;
  name: string;
  description: string;
  type: SkillType;
  race: SkillRace;
  elementType: ElementType;
  basePower: number;
  mpCost: number;
  spCost: number;
  cooldown: number;
  currentCooldown: number;
  maxUsesPerBattle: number;
  usesRemaining: number;
  level: number;
  maxLevel: number;
  targetType: TargetType;
  range: number;
  accuracy: number;
  effects: SkillEffectDTO[];
  upgradeCosts: UpgradeCostDTO[];
  learnedAtLevel: number;
}

/**
 * Effect applied by skills and abilities.
 */
export interface SkillEffectDTO {
  type: StatusEffectType;
  duration: number;
  intensity: number;
  chance: number;
  isDebuff: boolean;
  appliesToSelf: boolean;
  appliesToTarget: boolean;
}

/**
 * Upgrade costs for skill enhancement.
 */
export interface UpgradeCostDTO {
  currencyType: CurrencyType;
  amount: number;
}

/**
 * Active status effect with remaining duration.
 */
export interface ActiveStatusEffectDTO {
  type: StatusEffectType;
  remainingTurns: number;
  intensity: number;
  sourceCharacterId: string;
  isPermanent: boolean;
  stacks: number;
  maxStacks: number;
}

// ============================================================================
// COMBAT SYSTEM DTOs
// ============================================================================

/**
 * Complete combat encounter definition.
 */
export interface CombatEncounterDTO {
  id: string;
  encounterName: string;
  participants: CombatParticipantDTO[];
  environment: CombatEnvironmentDTO;
  battleStartCondition: BattleStartCondition;
  victoryConditions: VictoryConditionDTO[];
  defeatConditions: DefeatConditionDTO[];
  rewards: CombatRewardDTO[];
  backgroundMusic: string;
  battleBackground: string;
  turnOrder: string[]; // Array of participant IDs in turn order
  currentPhase: BattlePhase;
  roundNumber: number;
  turnCounter: number;
}

/**
 * Combat participant with their current state.
 */
export interface CombatParticipantDTO {
  id: string;
  entityId: string;
  type: CombatParticipantType;
  team: 'player' | 'enemy';
  name: string;
  stats: CharacterStatsDTO;
  statusEffects: ActiveStatusEffectDTO[];
  currentAction?: CombatActionDTO;
  actionQueue: CombatActionDTO[];
  aiBehavior?: AIBehavior;
  targetPriority: string[]; // Priority list of target IDs
  threatTable: Record<string, number>; // Target ID -> Threat amount
  hasActedThisRound: boolean;
  isInCombat: boolean;
}

/**
 * Action taken by a combat participant.
 */
export interface CombatActionDTO {
  id: string;
  actorId: string;
  actionType: CombatActionType;
  skillId?: string;
  itemId?: string;
  targetIds: string[];
  calculatedDamage?: number;
  calculatedHealing?: number;
  statusEffectsApplied?: AppliedStatusEffectDTO[];
  success: boolean;
  result: TurnResult;
  description: string;
  timestamp: Date;
}

/**
 * Status effect applied during combat action.
 */
export interface AppliedStatusEffectDTO {
  type: StatusEffectType;
  duration: number;
  intensity: number;
  chance: number;
  appliedByActorId: string;
  targetId: string;
}

/**
 * Combat environment with battlefield modifiers.
 */
export interface CombatEnvironmentDTO {
  terrainType: string;
  weather: WeatherType;
  lighting: 'bright' | 'dim' | 'dark';
  terrainEffects: TerrainEffectDTO[];
  battlefieldHazards: BattlefieldHazardDTO[];
  turnModifiers: CombatModifierDTO[];
}

/**
 * Environmental effect on combat.
 */
export interface TerrainEffectDTO {
  affectedStat: StatType;
  modifier: number;
  appliesTo: 'player' | 'enemy' | 'both';
  duration: number;
}

/**
 * Hazardous battlefield condition.
 */
export interface BattlefieldHazardDTO {
  name: string;
  description: string;
  effect: StatusEffectType;
  chanceToTrigger: number;
  duration: number;
  damageType?: ElementType;
  damageAmount?: number;
  appliesTo: 'player' | 'enemy' | 'both';
}

/**
 * Combat modifier affecting participants.
 */
export interface CombatModifierDTO {
  statType: StatType;
  modifier: number;
  appliesTo: 'player' | 'enemy' | 'both';
  duration: number;
  stackable: boolean;
  maxStacks: number;
}

/**
 * Condition required for victory.
 */
export interface VictoryConditionDTO {
  type: 'defeat_all_enemies' | 'defeat_boss' | 'survive_x_rounds' | 'complete_objective';
  objective?: string;
  targetCount?: number;
  parameter?: string;
}

/**
 * Condition resulting in defeat.
 */
export interface DefeatConditionDTO {
  type: 'all_party_members_defeated' | 'timer_expired' | 'objective_failed';
  parameter?: string;
}

/**
 * Rewards granted upon combat victory.
 */
export interface CombatRewardDTO {
  experience: number;
  gold: number;
  items: RewardItemDTO[];
  currencies: RewardCurrencyDTO[];
  unlockables: UnlockableRewardDTO[];
  achievements: string[];
}

/**
 * Item reward from combat.
 */
export interface RewardItemDTO {
  itemId: string;
  quantity: number;
  chance: number;
}

/**
 * Currency reward from combat.
 */
export interface RewardCurrencyDTO {
  type: CurrencyType;
  amount: number;
}

/**
 * Unlockable content reward.
 */
export interface UnlockableRewardDTO {
  type: 'skill' | 'recipe' | 'area' | 'character';
  id: string;
  name: string;
}

// ============================================================================
// EXPLORATION & WORLD DTOs
// ============================================================================

/**
 * Game world map definition.
 */
export interface GameMapDTO {
  id: string;
  name: string;
  description: string;
  type: MapType;
  dimensions: Vector2DTO;
  spawnPoint: Vector3DTO;
  connectedMaps: ConnectedMapDTO[];
  npcs: NPCEntityDTO[];
  triggers: TriggerZoneDTO[];
  chests: ChestDTO[];
  environmentalHazards: EnvironmentalHazardDTO[];
  timeOfDay: TimePeriod;
  weather: WeatherType;
  musicTrack: string;
  ambientSound: string;
  lightingSettings: LightingSettingsDTO;
  fogSettings: FogSettingsDTO;
}

/**
 * Connection between maps.
 */
export interface ConnectedMapDTO {
  mapId: string;
  connectionPoint: Vector3DTO;
  transitionType: 'walk' | 'teleport' | 'fast_travel';
  requiredItems?: string[];
  requiredLevel?: number;
  lockedUntilQuest?: string;
}

/**
 * Non-player character with behavior and dialogue.
 */
export interface NPCEntityDTO {
  id: string;
  name: string;
  type: NPCType;
  position: Vector3DTO;
  rotation: Vector3DTO;
  dialogueTreeId: string;
  schedule: NPCTaskScheduleDTO[];
  behaviorPattern: AIBehavior;
  shopInventory?: ShopInventoryDTO;
  questIds: string[];
  relationshipLevel: RelationshipLevel;
  socialLinkType?: SocialLinkType;
  socialLinkLevel: number;
  isAvailable: boolean;
  availabilityConditions: AvailabilityConditionDTO[];
  modelPath: string;
  texturePath: string;
  voiceActor: string;
}

/**
 * NPC task schedule for dynamic behavior.
 */
export interface NPCTaskScheduleDTO {
  timePeriod: TimePeriod;
  task: string;
  location: Vector3DTO;
  destination: Vector3DTO;
}

/**
 * Condition for NPC availability.
 */
export interface AvailabilityConditionDTO {
  type: 'quest_status' | 'date_range' | 'weather' | 'time_period';
  parameter: string;
  value: string | number;
}

/**
 * Trigger zone for event activation.
 */
export interface TriggerZoneDTO {
  id: string;
  type: TriggerType;
  position: Vector3DTO;
  size: Vector3DTO;
  rotation: Vector3DTO;
  triggerEvent: GameEventType;
  eventData: any;
  activationConditions: ActivationConditionDTO[];
  repeatable: boolean;
  cooldown: number;
  visualEffect?: string;
}

/**
 * Condition for trigger activation.
 */
export interface ActivationConditionDTO {
  type: 'quest_status' | 'item_owned' | 'level_reached' | 'reputation_threshold';
  parameter: string;
  operator: ComparisonOperator;
  value: string | number;
}

/**
 * Interactive chest with loot.
 */
export interface ChestDTO {
  id: string;
  position: Vector3DTO;
  rotation: Vector3DTO;
  contents: ChestContentDTO[];
  isOpened: boolean;
  requiresKey?: string;
  lockLevel?: number;
  trapType?: StatusEffectType;
  trapDamage?: number;
  respawnTime?: number;
  isUnique: boolean;
}

/**
 * Content contained in a chest.
 */
export interface ChestContentDTO {
  itemId: string;
  quantity: number;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

/**
 * Environmental hazard in the world.
 */
export interface EnvironmentalHazardDTO {
  id: string;
  position: Vector3DTO;
  size: Vector3DTO;
  type: StatusEffectType;
  damagePerSecond: number;
  damageType: ElementType;
  triggerRadius: number;
  visualEffect: string;
  activeTime: { startTime: TimePeriod; endTime: TimePeriod };
}

/**
 * Lighting configuration for maps.
 */
export interface LightingSettingsDTO {
  ambientLight: ColorDTO;
  directionalLight: DirectionalLightDTO;
  pointLights: PointLightDTO[];
  shadowsEnabled: boolean;
  shadowDistance: number;
  shadowResolution: number;
}

/**
 * Directional light source.
 */
export interface DirectionalLightDTO {
  direction: Vector3DTO;
  color: ColorDTO;
  intensity: number;
  enabled: boolean;
}

/**
 * Point light source.
 */
export interface PointLightDTO {
  position: Vector3DTO;
  color: ColorDTO;
  intensity: number;
  range: number;
  enabled: boolean;
}

/**
 * Fog rendering settings.
 */
export interface FogSettingsDTO {
  enabled: boolean;
  color: ColorDTO;
  density: number;
  startDistance: number;
  endDistance: number;
  heightFog: boolean;
  heightDensity: number;
  heightScale: number;
}

// ============================================================================
// DIALOGUE SYSTEM DTOs
// ============================================================================

/**
 * Complete dialogue tree structure.
 */
export interface DialogueTreeDTO {
  id: string;
  title: string;
  rootNodeId: string;
  nodes: DialogueNodeDTO[];
  variables: Record<string, any>;
  requirements: DialogueRequirementDTO[];
  rewards: DialogueRewardDTO[];
  tags: string[];
}

/**
 * Individual dialogue node in the conversation tree.
 */
export interface DialogueNodeDTO {
  id: string;
  type: DialogueNodeType;
  speakerId?: string;
  speakerName?: string;
  text: string;
  choices?: DialogueChoiceDTO[];
  actions?: DialogueActionDTO[];
  nextNodeId?: string;
  requirements: DialogueRequirementDTO[];
  effects: DialogueEffectDTO[];
  delayBeforeDisplay?: number;
  duration?: number;
  branchLabel?: string;
  conditionalBranches?: ConditionalBranchDTO[];
}

/**
 * Player choice in dialogue.
 */
export interface DialogueChoiceDTO {
  id: string;
  text: string;
  nextNodeId: string;
  requirements: DialogueRequirementDTO[];
  effects: DialogueEffectDTO[];
  consequenceRating: number; // -1 to 1, affects relationship/faction standing
}

/**
 * Action triggered by dialogue node.
 */
export interface DialogueActionDTO {
  type: GameEventType;
  parameters: Record<string, any>;
  delay: number;
}

/**
 * Requirement for dialogue node access.
 */
export interface DialogueRequirementDTO {
  type: DialogueRequirementType;
  parameter: string;
  operator: ComparisonOperator;
  value: string | number;
  comparisonValue?: string | number;
}

/**
 * Effect applied by dialogue interaction.
 */
export interface DialogueEffectDTO {
  type: 'stat_change' | 'item_grant' | 'quest_update' | 'relationship_change' | 'flag_set';
  parameter: string;
  value: string | number;
  duration?: number;
}

/**
 * Conditional branch in dialogue tree.
 */
export interface ConditionalBranchDTO {
  condition: DialogueRequirementDTO;
  nodeId: string;
  elseNodeId?: string;
}

/**
 * Reward granted after completing dialogue.
 */
export interface DialogueRewardDTO {
  type: 'item' | 'currency' | 'xp' | 'relationship' | 'quest_progress';
  id: string;
  amount: number;
  target?: string; // Character ID for relationship changes
}

// ============================================================================
// QUEST SYSTEM DTOs
// ============================================================================

/**
 * Complete quest definition.
 */
export interface QuestDTO {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  category: 'main_story' | 'side_quest' | 'daily' | 'weekly' | 'event';
  status: QuestStatus;
  objectives: QuestObjectiveDTO[];
  rewards: QuestRewardDTO[];
  prerequisites: QuestPrerequisiteDTO[];
  expirationDate?: Date;
  repeatable: boolean;
  maxCompletions: number;
  currentCompletions: number;
  reputationGains: ReputationGainDTO[];
  achievementRewards: string[];
  tags: string[];
  dialogueTreeId?: string;
  npcInvolvement: QuestNPCInvolvementDTO[];
}

/**
 * Individual quest objective.
 */
export interface QuestObjectiveDTO {
  id: string;
  type: QuestObjectiveType;
  description: string;
  target: string; // Enemy type, item ID, location, etc.
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  optional: boolean;
  timer?: number; // Time limit in seconds
}

/**
 * Quest prerequisite condition.
 */
export interface QuestPrerequisiteDTO {
  type: 'quest_completed' | 'level_reached' | 'item_owned' | 'reputation_threshold';
  parameter: string;
  value: string | number;
}

/**
 * Rewards granted upon quest completion.
 */
export interface QuestRewardDTO {
  type: 'item' | 'currency' | 'xp' | 'skill' | 'title' | 'area_unlock' | 'character_unlock';
  id: string;
  amount: number;
  quantity?: number;
  quality?: ItemRarity;
}

/**
 * Reputation gain from quest completion.
 */
export interface ReputationGainDTO {
  factionId: string;
  amount: number;
  maxCap?: number;
}

/**
 * NPC involved in the quest.
 */
export interface QuestNPCInvolvementDTO {
  npcId: string;
  role: 'giver' | 'helper' | 'antagonist' | 'reward_giver';
  dialogueTreeId?: string;
}

// ============================================================================
// INVENTORY & ECONOMY DTOs
// ============================================================================

/**
 * Player inventory with all items and equipment.
 */
export interface InventoryDTO {
  id: string;
  playerId: string;
  items: InventoryItemDTO[];
  equipmentSets: EquipmentSetDTO[];
  activeEquipmentSet: number;
  currency: Record<CurrencyType, number>;
  maxCapacity: number;
  currentWeight: number;
  weightLimit: number;
  quickAccessSlots: QuickAccessSlotDTO[];
}

/**
 * Item instance in inventory with quantities and state.
 */
export interface InventoryItemDTO {
  itemId: string;
  quantity: number;
  durability?: number;
  charges?: number;
  equipped: boolean;
  favorite: boolean;
  customName?: string;
  customDescription?: string;
  enchantments: EnchantmentDTO[];
  temporaryEffects: TemporaryEffectDTO[];
  creationDate: Date;
  expirationDate?: Date;
}

/**
 * Enchantment applied to an item.
 */
export interface EnchantmentDTO {
  id: string;
  name: string;
  description: string;
  statBonuses: Partial<Record<StatType, number>>;
  elementalBonuses: Record<ElementType, number>;
  skillBonuses: { skillId: string; bonus: number }[];
  duration: number;
  isPermanent: boolean;
}

/**
 * Temporary effect on an item.
 */
export interface TemporaryEffectDTO {
  type: StatusEffectType;
  duration: number;
  intensity: number;
  source: string;
}

/**
 * Quick access slot for items.
 */
export interface QuickAccessSlotDTO {
  slotIndex: number;
  itemId?: string;
  boundAction: 'use_item' | 'equip_weapon' | 'cast_skill';
  cooldown: number;
}

/**
 * Shop inventory for merchants.
 */
export interface ShopInventoryDTO {
  items: ShopItemDTO[];
  restockSchedule: RestockScheduleDTO;
  discountFactors: Record<CurrencyType, number>;
  reputationDiscounts: Record<string, number>; // Faction ID -> Discount %
  specialOffers: SpecialOfferDTO[];
  operatingHours: OperatingHourDTO[];
}

/**
 * Item available for purchase in shops.
 */
export interface ShopItemDTO {
  itemId: string;
  basePrice: number;
  currencyType: CurrencyType;
  stock: number;
  maxStock: number;
  restockRate: number;
  minimumReputation?: { factionId: string; level: number };
  availableAfterQuest?: string;
  hiddenUntilQuest?: string;
}

/**
 * Shop restock schedule.
 */
export interface RestockScheduleDTO {
  type: 'daily' | 'weekly' | 'monthly' | 'on_quest_completion';
  interval: number;
  nextRestock: Date;
  restockPercentage: number;
}

/**
 * Special offer available in shops.
 */
export interface SpecialOfferDTO {
  id: string;
  itemIds: string[];
  originalPrice: number;
  discountedPrice: number;
  startDate: Date;
  endDate: Date;
  limitedStock: number;
  requiresMembership?: string;
}

/**
 * Operating hours for shops.
 */
export interface OperatingHourDTO {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: TimePeriod;
  closeTime: TimePeriod;
  closed: boolean;
}

// ============================================================================
// PARTY & SOCIAL DTOs
// ============================================================================

/**
 * Player party composition and settings.
 */
export interface PartyDTO {
  id: string;
  leaderId: string;
  members: PartyMemberDTO[];
  settings: PartySettingsDTO;
  recruitmentStatus: PartyRecruitmentStatus;
  reputation: Record<string, number>; // Faction ID -> Reputation
  sharedInventory?: SharedInventoryDTO;
  formation: PartyFormationDTO;
}

/**
 * Party member information.
 */
export interface PartyMemberDTO {
  playerId: string;
  characterId: string;
  role: PartyRole;
  joinedAt: Date;
  lastOnline: Date;
  isOnline: boolean;
  contributionScore: number;
  relationshipWithLeader: RelationshipLevel;
  permissions: PartyPermissionDTO[];
}

/**
 * Party permission settings.
 */
export interface PartyPermissionDTO {
  action: string;
  allowedRoles: PartyRole[];
}

/**
 * Party settings and configurations.
 */
export interface PartySettingsDTO {
  shareExperience: boolean;
  shareLoot: boolean;
  autoDistributeLoot: boolean;
  inviteOnly: boolean;
  crossplayAllowed: boolean;
  voiceChatEnabled: boolean;
  sharedQuestTracking: boolean;
  sharedMapDiscovery: boolean;
}

/**
 * Shared party inventory.
 */
export interface SharedInventoryDTO {
  items: InventoryItemDTO[];
  currency: Record<CurrencyType, number>;
  maxCapacity: number;
  weightLimit: number;
}

/**
 * Party formation affecting combat positioning.
 */
export interface PartyFormationDTO {
  type: 'line' | 'triangle' | 'circle' | 'custom';
  positions: FormationPositionDTO[];
  defensiveBonus: number;
  offensiveBonus: number;
  mobilityBonus: number;
}

/**
 * Position in party formation.
 */
export interface FormationPositionDTO {
  index: number;
  characterId: string;
  x: number;
  y: number;
  z: number;
  role: 'tank' | 'dps' | 'support' | 'buffer';
}

/**
 * Friendship/relationship data between players.
 */
export interface FriendshipDTO {
  id: string;
  player1Id: string;
  player2Id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  relationshipLevel: RelationshipLevel;
  trustPoints: number;
  lastInteraction: Date;
  notes: string;
  blockedReason?: string;
}

/**
 * Social link progress with NPCs.
 */
export interface SocialLinkDTO {
  id: string;
  playerId: string;
  npcId: string;
  type: SocialLinkType;
  level: number;
  maxLevel: number;
  points: number;
  pointsRequiredForNextLevel: number;
  unlockedAbilities: string[];
  unlockedRewards: SocialLinkRewardDTO[];
  specialEvents: SocialLinkEventDTO[];
  lastInteraction: Date;
}

/**
 * Reward from advancing social links.
 */
export interface SocialLinkRewardDTO {
  type: 'stat_bonus' | 'skill' | 'item' | 'accessibility';
  id: string;
  amount: number;
}

/**
 * Special event in social link progression.
 */
export interface SocialLinkEventDTO {
  eventId: string;
  date: Date;
  description: string;
  choiceMade: string;
  impactOnRelationship: number;
}

// ============================================================================
// ACHIEVEMENT SYSTEM DTOs
// ============================================================================

/**
 * Achievement definition and progress tracking.
 */
export interface AchievementDTO {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: ItemRarity; // COMMON to LEGENDARY based on difficulty
  points: number;
  iconPath: string;
  hidden: boolean;
  secret: boolean;
  requirements: AchievementRequirementDTO[];
  rewards: AchievementRewardDTO[];
  unlockedAt?: Date;
  unlockCount: number;
  tags: string[];
}

/**
 * Requirement for achievement completion.
 */
export interface AchievementRequirementDTO {
  type: 'quest_completed' | 'battles_won' | 'items_collected' | 'levels_gained' | 'distance_traveled';
  parameter: string;
  targetValue: number;
  currentValue: number;
  progressDescription: string;
}

/**
 * Reward granted upon achievement unlock.
 */
export interface AchievementRewardDTO {
  type: 'title' | 'avatar_frame' | 'profile_icon' | 'currency' | 'special_item';
  id: string;
  amount: number;
}

// ============================================================================
// MINIGAME DTOs
// ============================================================================

/**
 * Slot machine game state and configuration.
 */
export interface SlotGameDTO {
  id: string;
  variant: SlotVariant;
  playerId: string;
  currentBet: number;
  totalCoins: number;
  lineConfigurations: LineConfigurationDTO[];
  symbolMatrix: string[][]; // 3x5 or 5x3 grid of symbol IDs
  paytable: PaytableDTO;
  bonusFeatures: BonusFeatureDTO[];
  freeSpinsRemaining: number;
  multiplier: number;
  winHistory: SpinResultDTO[];
  totalWins: number;
  totalLosses: number;
  sessionStartTime: Date;
  autoPlaySettings?: AutoPlaySettingsDTO;
  statistics: SlotStatisticsDTO;
}

/**
 * Payline configuration for slot machines.
 */
export interface LineConfigurationDTO {
  id: string;
  positions: { row: number; col: number }[]; // Positions forming the payline
  active: boolean;
  payoutMultiplier: number;
}

/**
 * Paytable defining winning combinations.
 */
export interface PaytableDTO {
  symbolId: string;
  payouts: { count: number; multiplier: number }[];
}

/**
 * Bonus feature available in slot games.
 */
export interface BonusFeatureDTO {
  type: SlotBonusType;
  triggerSymbol: string;
  activationCount: number;
  rewards: BonusRewardDTO[];
  isActive: boolean;
  remainingActivations: number;
}

/**
 * Reward from bonus features.
 */
export interface BonusRewardDTO {
  type: 'coins' | 'free_spins' | 'multiplier' | 'jackpot';
  value: number;
  min?: number;
  max?: number;
}

/**
 * Result of a single slot spin.
 */
export interface SpinResultDTO {
  spinId: string;
  timestamp: Date;
  symbols: string[][];
  winningLines: WinningLineDTO[];
  totalWin: number;
  bonusTriggered: boolean;
  bonusType?: SlotBonusType;
  freeSpin: boolean;
  multiplierApplied: number;
}

/**
 * Winning combination from a spin.
 */
export interface WinningLineDTO {
  lineId: string;
  symbolId: string;
  count: number;
  payout: number;
  positions: { row: number; col: number }[];
}

/**
 * Auto-play settings for slot machines.
 */
export interface AutoPlaySettingsDTO {
  enabled: boolean;
  maxSpins: number;
  stopIfWin: number;
  stopIfLoss: number;
  balanceThreshold: number;
  lossLimit: number;
  winLimit: number;
}

/**
 * Statistics for slot game performance.
 */
export interface SlotStatisticsDTO {
  totalSpins: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  biggestLoss: number;
  averageWin: number;
  hitRate: number; // Percentage of winning spins
  returnToPlayer: number; // RTP percentage
  timePlayed: number; // In seconds
}

/**
 * Fishing minigame state and configuration.
 */
export interface FishingGameDTO {
  id: string;
  playerId: string;
  location: string;
  rod: FishingRodDTO;
  bait: BaitDTO;
  caughtFish: CaughtFishDTO[];
  sessionStartTime: Date;
  weather: WeatherType;
  timeOfDay: TimePeriod;
  waterConditions: WaterConditionDTO;
  statistics: FishingStatisticsDTO;
  achievements: FishingAchievementDTO[];
}

/**
 * Fishing rod equipment.
 */
export interface FishingRodDTO {
  id: string;
  name: string;
  tier: FishingRodTier;
  castDistance: number;
  sensitivity: number;
  durability: number;
  maxDurability: number;
  fishDetectionRange: number;
  hookStrength: number;
  reelSpeed: number;
  specialAbilities: RodAbilityDTO[];
}

/**
 * Bait used in fishing.
 */
export interface BaitDTO {
  id: string;
  name: string;
  effectiveness: number; // Attracts certain fish types better
  fishPreferences: FishType[];
  duration: number; // How long it lasts
  rarity: ItemRarity;
}

/**
 * Fish caught during fishing session.
 */
export interface CaughtFishDTO {
  id: string;
  fishType: FishType;
  size: number; // Weight or length
  value: number;
  caughtAt: Date;
  location: string;
  weather: WeatherType;
  timeOfDay: TimePeriod;
  specialProperties: string[]; // Legendary, rare, etc.
}

/**
 * Water conditions affecting fishing.
 */
export interface WaterConditionDTO {
  clarity: number; // 0-100, affects visibility
  temperature: number; // Affects fish activity
  currentStrength: number; // Affects casting
  waveHeight: number; // Affects sensitivity
  pollutionLevel: number; // Affects fish types available
}

/**
 * Fishing statistics tracking.
 */
export interface FishingStatisticsDTO {
  totalCasts: number;
  totalCaught: number;
  totalValue: number;
  biggestCatch: number;
  rarestFishCaught: FishType;
  timeSpentFishing: number;
  successRate: number;
  fishTypesCaught: Record<FishType, number>;
}

/**
 * Fishing-related achievement.
 */
export interface FishingAchievementDTO {
  achievementId: string;
  progress: number;
  completed: boolean;
  earnedAt?: Date;
}

/**
 * Special ability of fishing rod.
 */
export interface RodAbilityDTO {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effect: RodAbilityEffectDTO;
  unlockedAtTier: FishingRodTier;
}

/**
 * Effect of rod ability.
 */
export interface RodAbilityEffectDTO {
  type: 'detect_rare_fish' | 'increase_hook_strength' | 'reduce_fight_time' | 'attract_fish';
  duration: number;
  magnitude: number;
}

/**
 * Poker game state and configuration.
 */
export interface PokerGameDTO {
  id: string;
  gameId: string;
  stage: PokerStage;
  communityCards: CardDTO[];
  pot: number;
  currentBet: number;
  dealerPosition: number;
  currentPlayerIndex: number;
  players: PokerPlayerDTO[];
  deck: CardDTO[];
  blinds: BlindsDTO;
  sidePots: SidePotDTO[];
  gameHistory: PokerHandHistoryDTO[];
  statistics: PokerStatisticsDTO;
  settings: PokerGameSettingsDTO;
}

/**
 * Card representation.
 */
export interface CardDTO {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  visible: boolean;
}

/**
 * Poker player in the game.
 */
export interface PokerPlayerDTO {
  id: string;
  playerId: string;
  seatIndex: number;
  holeCards: CardDTO[];
  chips: number;
  currentBet: number;
  totalInvested: number;
  isFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  bestHand?: PokerHandRank;
  handCards?: CardDTO[];
  lastAction?: PokerAction;
  timeBank: number; // Remaining thinking time
  autoPlay: boolean;
  autoPlaySettings?: AutoPokerSettingsDTO;
}

/**
 * Blinds configuration.
 */
export interface BlindsDTO {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  increaseInterval: number; // Hands between increases
}

/**
 * Side pot created when players go all-in.
 */
export interface SidePotDTO {
  amount: number;
  eligiblePlayers: string[]; // Player IDs eligible for this pot
  ranking: number; // Order of creation
}

/**
 * History of poker hands played.
 */
export interface PokerHandHistoryDTO {
  handId: string;
  winnerIds: string[];
  potAmount: number;
  communityCards: CardDTO[];
  players: HandPlayerResultDTO[];
  timestamp: Date;
}

/**
 * Result of a player in a poker hand.
 */
export interface HandPlayerResultDTO {
  playerId: string;
  finalChips: number;
  chipsWon: number;
  handRank: PokerHandRank;
  handCards: CardDTO[];
  holeCards: CardDTO[];
  status: 'winner' | 'loser' | 'chop';
}

/**
 * Poker game settings.
 */
export interface PokerGameSettingsDTO {
  gameType: 'texas_holdem' | 'omaha' | 'seven_card_stud';
  maxPlayers: number;
  minBuyIn: number;
  maxBuyIn: number;
  timePerAction: number;
  enableAutoPlay: boolean;
  rakePercentage: number;
  allowSidePots: boolean;
}

/**
 * Auto-play settings for poker.
 */
export interface AutoPokerSettingsDTO {
  enabled: boolean;
  foldThreshold: number; // Hand strength below which to fold
  callThreshold: number; // Hand strength at which to call
  raiseThreshold: number; // Hand strength above which to raise
  aggressiveFactor: number; // Multiplier for bet sizing
}

/**
 * Poker statistics tracking.
 */
export interface PokerStatisticsDTO {
  handsPlayed: number;
  handsWon: number;
  totalChipsWon: number;
  biggestWin: number;
  biggestLoss: number;
  favoriteStartingHands: string[]; // Most successful hole card combinations
  winRate: number;
  averagePotSize: number;
  timePlayed: number;
}

// ============================================================================
// UTILITY DTOs
// ============================================================================

/**
 * 3D vector coordinate.
 */
export interface Vector3DTO {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D vector coordinate.
 */
export interface Vector2DTO {
  x: number;
  y: number;
}

/**
 * RGB color definition.
 */
export interface ColorDTO {
  r: number;
  g: number;
  b: number;
  a?: number; // Alpha channel
}