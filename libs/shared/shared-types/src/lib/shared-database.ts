import { UserRole, UserStatus, FriendshipStatus, TeamRole, TournamentFormat, TournamentStatus, ChannelType } from './shared-types.js';
import { 
    Check,
    Entity, 
    Column, 
    OneToMany, 
    Index, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    DeleteDateColumn, 
    PrimaryColumn, 
    ManyToOne, 
    OneToOne,
    JoinColumn 
} from 'typeorm';
import { AchievementCategory, ArmorType, CharacterClass, CurrencyType, ElementType, EquipmentSlot, ItemRarity, ItemType, PartyRole, QuestDifficulty, QuestObjectiveType, QuestStatus, RelationshipLevel, SkillRace, SkillType, SocialLinkType, StatType, StatusEffectType, TargetType, WeaponType } from '@org/game-engine';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

// Core & Identity (UserModule)

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column({ length: 50 })
  username: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => UserSetting, (setting) => setting.user, { cascade: true })
  settings: UserSetting[];

  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Column({ name: 'reset_token_expires_at', type: 'timestamp', nullable: true })
  resetTokenExpiresAt: Date | null;
}

@Entity('user_settings')
export class UserSetting {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn({ length: 50 })
  key: string;

  @Column({ length: 255 })
  value: string;

  @ManyToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

// Social & Teams (SocialModule & TeamModule)

@Entity('friendships')
@Index(['requesterId', 'addresseeId'], { unique: true })
export class Friendship extends BaseEntity {
  @Column('uuid')
  requesterId: string;

  @Column('uuid')
  addresseeId: string;

  @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.PENDING })
  status: FriendshipStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addresseeId' })
  addressee: User;
}

@Entity('teams')
@Index(['name'], { unique: true })
@Index(['tag'], { unique: true })
export class Team extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 10 })
  tag: string;

  @Column('uuid')
  ownerId: string;

  @OneToMany(() => TeamMember, (member) => member.team)
  members: TeamMember[];
}

@Entity('team_members')
export class TeamMember {
  @PrimaryColumn('uuid')
  teamId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.MEMBER })
  role: TeamRole;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

// Tournaments (TournamentModule)

@Entity('tournaments')
@Check('TOURNAMENT_DATES', '"startDate" <= "endDate"')
export class Tournament extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  gameMode: string;

  @Column({ type: 'enum', enum: TournamentFormat })
  format: TournamentFormat;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'enum', enum: TournamentStatus, default: TournamentStatus.REGISTRATION })
  status: TournamentStatus;

  @Column({ type: 'int' })
  maxParticipants: number;

  @OneToMany(() => TournamentRegistration, (reg) => reg.tournament)
  registrations: TournamentRegistration[];
}

@Entity('tournament_registrations')
@Index(['tournamentId', 'userId'])
@Index(['tournamentId', 'teamId'])
// XOR Constraint: Exactly one of userId or teamId must be present
@Check('EXACTLY_ONE_PARTICIPANT', '("userId" IS NOT NULL AND "teamId" IS NULL) OR ("userId" IS NULL AND "teamId" IS NOT NULL)')
export class TournamentRegistration extends BaseEntity {
  @Column('uuid')
  tournamentId: string;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @Column('uuid', { nullable: true })
  teamId: string | null;

  @Column({ type: 'int', default: 0 })
  seed: number;

  @Column({ type: 'int', nullable: true })
  finalRank: number | null;

  @ManyToOne(() => Tournament, (t) => t.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team | null;
}

// Chat & Leaderboards (ChatModule & LeaderboardModule)

@Entity('chat_channels')
export class ChatChannel extends BaseEntity {
  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @Column({ length: 100, nullable: true })
  name: string | null; // Only used for GROUP channels

  @OneToMany(() => ChatMessage, (msg) => msg.channel)
  messages: ChatMessage[];
}

@Entity('chat_messages')
@Index(['channelId', 'timestamp'])
export class ChatMessage extends BaseEntity {
  @Column('uuid')
  channelId: string;

  @Column('uuid')
  senderId: string;

  @Column({ type: 'text', length: 2000 }) // Prevent massive payloads
  content: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => ChatChannel, (channel) => channel.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: ChatChannel;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;
}

@Entity('leaderboard_configs')
export class LeaderboardConfig extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  gameMode: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LeaderboardArchive, (archive) => archive.config)
  archives: LeaderboardArchive[];
}

@Entity('leaderboard_archives')
@Index(['configId', 'rank'])
export class LeaderboardArchive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  configId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  score: number;

  @Column({ type: 'timestamp' })
  archivedAt: Date;

  @ManyToOne(() => LeaderboardConfig, (config) => config.archives, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'configId' })
  config: LeaderboardConfig;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

// Storage & Assets (StorageModule)

@Entity('assets')
@Index(['ownerId'])
export class Asset extends BaseEntity {
  @Column('uuid', { nullable: true })
  ownerId: string | null; // Null for public/system assets

  @Column({ length: 255 })
  s3Key: string;

  @Column({ length: 500 })
  publicUrl: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner: User | null;

  @OneToMany(() => AssetMetadata, (meta) => meta.asset, { cascade: true })
  metadata: AssetMetadata[];
}

@Entity('asset_metadata')
export class AssetMetadata {
  @PrimaryColumn('uuid')
  assetId: string;

  @PrimaryColumn({ length: 50 })
  key: string;

  @Column({ length: 255 })
  value: string;

  @ManyToOne(() => Asset, (asset) => asset.metadata, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;
}

// ============================================================================
// USER & AUTHENTICATION ENTITIES
// ============================================================================

/**
 * User account entity for authentication and profile management.
 * Stored in PostgreSQL 'users' table.
 */
export class UserAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false }) // Never returned in API responses
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'jsonb', default: {} })
  preferences: UserPreferencesEntity;

  @OneToMany(() => PlayerProfileEntity, profile => profile.userAccount)
  profiles: PlayerProfileEntity[];

  @OneToMany(() => FriendshipEntity, friendship => friendship.player1)
  friendshipsSent: FriendshipEntity[];

  @OneToMany(() => FriendshipEntity, friendship => friendship.player2)
  friendshipsReceived: FriendshipEntity[];
}

/**
 * User preference settings entity.
 */
export class UserPreferencesEntity {
  @Column({ default: 'en-US' })
  language: string;

  @Column({ type: 'int', default: 80 })
  audioVolume: number;

  @Column({ type: 'int', default: 70 })
  musicVolume: number;

  @Column({ type: 'int', default: 90 })
  sfxVolume: number;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'ultra'], default: 'medium' })
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';

  @Column({ type: 'int', default: 50 })
  controllerSensitivity: number;

  @Column({ type: 'int', default: 3 }) // 1-5 scale
  textSpeed: number;

  @Column({ default: true })
  autoSaveEnabled: boolean;

  @Column({ type: 'jsonb', default: {} })
  accessibilityOptions: AccessibilityOptionsEntity;
}

/**
 * Accessibility options entity.
 */
export class AccessibilityOptionsEntity {
  @Column({ default: false })
  highContrastMode: boolean;

  @Column({ default: false })
  largeText: boolean;

  @Column({ default: false })
  colorBlindFriendly: boolean;

  @Column({ type: 'int', default: 14 })
  subtitleSize: number;

  @Column({ default: true })
  vibrationEnabled: boolean;

  @Column({ nullable: true })
  narratorVoice: string;
}

/**
 * Player profile entity linking user accounts to game characters.
 */
export class PlayerProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'int', default: 0 })
  totalPlayTime: number; // In seconds

  @Column({ type: 'int', default: 0 })
  achievementPoints: number;

  @Column({ type: 'jsonb', default: [] })
  unlockedTitles: string[];

  @Column({ type: 'jsonb', default: [] })
  unlockedAvatarFrames: string[];

  @ManyToOne(() => UserAccountEntity, user => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn()
  userAccount: UserAccountEntity;

  @Column()
  userAccountId: string;

  @OneToOne(() => CharacterEntity, character => character.profile)
  character: CharacterEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActiveAt: Date;
}

// ============================================================================
// CHARACTER & COMBAT ENTITIES
// ============================================================================

/**
 * Core character entity representing a player's avatar.
 */
export class CharacterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'enum', enum: CharacterClass })
  class: CharacterClass;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: 0 })
  experience: number;

  @OneToOne(() => PlayerProfileEntity, profile => profile.character)
  @JoinColumn()
  profile: PlayerProfileEntity;

  @Column()
  profileId: string;

  @Column({ type: 'jsonb' })
  stats: CharacterStatsEntity;

  @Column({ type: 'jsonb', default: {} })
  equipment: EquipmentSetEntity;

  @Column({ type: 'jsonb', default: [] })
  skills: CharacterSkillEntity[];

  @Column({ type: 'jsonb', default: [] })
  statusEffects: ActiveStatusEffectEntity[];

  @Column({ type: 'jsonb', default: { x: 0, y: 0, z: 0 } })
  position: Vector3Entity;

  @Column({ type: 'jsonb', default: { x: 0, y: 0, z: 0 } })
  rotation: Vector3Entity;

  @Column({ default: true })
  isAlive: boolean;

  @Column({ default: true })
  isControlledByPlayer: boolean;

  @Column({ type: 'enum', enum: PartyRole, nullable: true })
  partyRole?: PartyRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastCombatAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Character statistics entity.
 */
export class CharacterStatsEntity {
  @Column({ type: 'int', default: 10 })
  strength: number;

  @Column({ type: 'int', default: 10 })
  magic: number;

  @Column({ type: 'int', default: 10 })
  dexterity: number;

  @Column({ type: 'int', default: 10 })
  endurance: number;

  @Column({ type: 'int', default: 10 })
  luck: number;

  @Column({ type: 'int', default: 10 })
  agility: number;

  @Column({ type: 'int', default: 100 })
  maxHp: number;

  @Column({ type: 'int', default: 100 })
  currentHp: number;

  @Column({ type: 'int', default: 50 })
  maxMp: number;

  @Column({ type: 'int', default: 50 })
  currentMp: number;

  @Column({ type: 'int', default: 0 })
  maxSp: number;

  @Column({ type: 'int', default: 0 })
  currentSp: number;

  @Column({ type: 'int', default: 0 })
  attackPower: number;

  @Column({ type: 'int', default: 0 })
  magicPower: number;

  @Column({ type: 'int', default: 0 })
  defense: number;

  @Column({ type: 'int', default: 0 })
  magicDefense: number;

  @Column({ type: 'int', default: 0 })
  accuracy: number;

  @Column({ type: 'int', default: 0 })
  evasion: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.05 })
  criticalRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1.5 })
  criticalDamage: number;

  @Column({ type: 'int', default: 0 })
  speed: number;

  @Column({ type: 'jsonb', default: {} })
  resistances: Record<ElementType, number>;
}

/**
 * Equipment set entity.
 */
export class EquipmentSetEntity {
  @Column({ type: 'jsonb', nullable: true })
  mainHand?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  offHand?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  head?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  chest?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  legs?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  feet?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  hands?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  neck?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  ring1?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  ring2?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  trinket1?: EquipmentItemEntity;

  @Column({ type: 'jsonb', nullable: true })
  trinket2?: EquipmentItemEntity;
}

/**
 * Base item entity.
 */
export class BaseItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @Column({ type: 'enum', enum: ItemRarity })
  rarity: ItemRarity;

  @Column({ type: 'int', default: 0 })
  value: number;

  @Column({ type: 'int', default: 1 })
  stackSize: number;

  @Column({ type: 'int', default: 99 })
  maxStackSize: number;

  @Column()
  iconPath: string;

  @Column()
  modelPath: string;
}

/**
 * Equipment item entity.
 */
export class EquipmentItemEntity extends BaseItemEntity {
  @Column({ type: 'enum', enum: WeaponType, nullable: true })
  weaponType?: WeaponType;

  @Column({ type: 'enum', enum: ArmorType, nullable: true })
  armorType?: ArmorType;

  @Column({ type: 'enum', enum: EquipmentSlot })
  slot: EquipmentSlot;

  @Column({ type: 'int', nullable: true })
  attackPower?: number;

  @Column({ type: 'int', nullable: true })
  magicPower?: number;

  @Column({ type: 'int', nullable: true })
  defense?: number;

  @Column({ type: 'int', nullable: true })
  magicDefense?: number;

  @Column({ type: 'jsonb', default: {} })
  elementalBonuses: Record<ElementType, number>;

  @Column({ type: 'jsonb', default: {} })
  statBonuses: Partial<Record<StatType, number>>;

  @Column({ type: 'jsonb', default: [] })
  skillRequirements: { skillId: string; level: number }[];

  @Column({ type: 'int', default: 100 })
  durability: number;

  @Column({ type: 'int', default: 100 })
  maxDurability: number;
}

/**
 * Character skill entity.
 */
export class CharacterSkillEntity {
  @Column()
  skillId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: SkillType })
  type: SkillType;

  @Column({ type: 'enum', enum: SkillRace })
  race: SkillRace;

  @Column({ type: 'enum', enum: ElementType })
  elementType: ElementType;

  @Column({ type: 'int', default: 0 })
  basePower: number;

  @Column({ type: 'int', default: 0 })
  mpCost: number;

  @Column({ type: 'int', default: 0 })
  spCost: number;

  @Column({ type: 'int', default: 0 })
  cooldown: number;

  @Column({ type: 'int', default: 0 })
  currentCooldown: number;

  @Column({ type: 'int', nullable: true })
  maxUsesPerBattle: number;

  @Column({ type: 'int', nullable: true })
  usesRemaining: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 10 })
  maxLevel: number;

  @Column({ type: 'enum', enum: TargetType })
  targetType: TargetType;

  @Column({ type: 'int', default: 0 })
  range: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1.0 })
  accuracy: number;

  @Column({ type: 'jsonb', default: [] })
  effects: SkillEffectEntity[];

  @Column({ type: 'jsonb', default: [] })
  upgradeCosts: UpgradeCostEntity[];

  @Column({ type: 'int', default: 0 })
  learnedAtLevel: number;
}

/**
 * Skill effect entity.
 */
export class SkillEffectEntity {
  @Column({ type: 'enum', enum: StatusEffectType })
  type: StatusEffectType;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'int', default: 0 })
  intensity: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1.0 })
  chance: number;

  @Column({ default: false })
  isDebuff: boolean;

  @Column({ default: false })
  appliesToSelf: boolean;

  @Column({ default: false })
  appliesToTarget: boolean;
}

/**
 * Upgrade cost entity.
 */
export class UpgradeCostEntity {
  @Column({ type: 'enum', enum: CurrencyType })
  currencyType: CurrencyType;

  @Column({ type: 'int' })
  amount: number;
}

/**
 * Active status effect entity.
 */
export class ActiveStatusEffectEntity {
  @Column({ type: 'enum', enum: StatusEffectType })
  type: StatusEffectType;

  @Column({ type: 'int', default: 0 })
  remainingTurns: number;

  @Column({ type: 'int', default: 0 })
  intensity: number;

  @Column({ nullable: true })
  sourceCharacterId: string;

  @Column({ default: false })
  isPermanent: boolean;

  @Column({ type: 'int', default: 1 })
  stacks: number;

  @Column({ type: 'int', default: 1 })
  maxStacks: number;
}

// ============================================================================
// INVENTORY & ECONOMY ENTITIES
// ============================================================================

/**
 * Player inventory entity.
 */
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column({ type: 'jsonb', default: [] })
  items: InventoryItemEntity[];

  @Column({ type: 'jsonb', default: [] })
  equipmentSets: EquipmentSetEntity[];

  @Column({ type: 'int', default: 0 })
  activeEquipmentSet: number;

  @Column({ type: 'jsonb', default: {} })
  currency: Record<CurrencyType, number>;

  @Column({ type: 'int', default: 100 })
  maxCapacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
  weightLimit: number;

  @Column({ type: 'jsonb', default: [] })
  quickAccessSlots: QuickAccessSlotEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Inventory item instance entity.
 */
export class InventoryItemEntity {
  @Column()
  itemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  durability?: number;

  @Column({ type: 'int', nullable: true })
  charges?: number;

  @Column({ default: false })
  equipped: boolean;

  @Column({ default: false })
  favorite: boolean;

  @Column({ nullable: true })
  customName?: string;

  @Column({ type: 'text', nullable: true })
  customDescription?: string;

  @Column({ type: 'jsonb', default: [] })
  enchantments: EnchantmentEntity[];

  @Column({ type: 'jsonb', default: [] })
  temporaryEffects: TemporaryEffectEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date;
}

/**
 * Enchantment entity.
 */
export class EnchantmentEntity {
  @Column()
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  statBonuses: Partial<Record<StatType, number>>;

  @Column({ type: 'jsonb', default: {} })
  elementalBonuses: Record<ElementType, number>;

  @Column({ type: 'jsonb', default: [] })
  skillBonuses: { skillId: string; bonus: number }[];

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ default: false })
  isPermanent: boolean;
}

/**
 * Temporary effect entity.
 */
export class TemporaryEffectEntity {
  @Column({ type: 'enum', enum: StatusEffectType })
  type: StatusEffectType;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  intensity: number;

  @Column()
  source: string;
}

/**
 * Quick access slot entity.
 */
export class QuickAccessSlotEntity {
  @Column({ type: 'int' })
  slotIndex: number;

  @Column({ nullable: true })
  itemId?: string;

  @Column({ type: 'enum', enum: ['use_item', 'equip_weapon', 'cast_skill'] })
  boundAction: 'use_item' | 'equip_weapon' | 'cast_skill';

  @Column({ type: 'int', default: 0 })
  cooldown: number;
}

// ============================================================================
// QUEST & ACHIEVEMENT ENTITIES
// ============================================================================

/**
 * Quest entity.
 */
export class QuestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: QuestDifficulty })
  difficulty: QuestDifficulty;

  @Column({ type: 'enum', enum: ['main_story', 'side_quest', 'daily', 'weekly', 'event'] })
  category: 'main_story' | 'side_quest' | 'daily' | 'weekly' | 'event';

  @Column({ type: 'enum', enum: QuestStatus, default: QuestStatus.AVAILABLE })
  status: QuestStatus;

  @Column({ type: 'jsonb', default: [] })
  objectives: QuestObjectiveEntity[];

  @Column({ type: 'jsonb', default: [] })
  rewards: QuestRewardEntity[];

  @Column({ type: 'jsonb', default: [] })
  prerequisites: QuestPrerequisiteEntity[];

  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date;

  @Column({ default: false })
  repeatable: boolean;

  @Column({ type: 'int', default: 1 })
  maxCompletions: number;

  @Column({ type: 'int', default: 0 })
  currentCompletions: number;

  @Column({ type: 'jsonb', default: [] })
  reputationGains: ReputationGainEntity[];

  @Column({ type: 'jsonb', default: [] })
  achievementRewards: string[];

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ nullable: true })
  dialogueTreeId?: string;

  @Column({ type: 'jsonb', default: [] })
  npcInvolvement: QuestNPCInvolvementEntity[];

  @Column()
  playerId: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Quest objective entity.
 */
export class QuestObjectiveEntity {
  @Column()
  id: string;

  @Column({ type: 'enum', enum: QuestObjectiveType })
  type: QuestObjectiveType;

  @Column({ type: 'text' })
  description: string;

  @Column()
  target: string;

  @Column({ type: 'int', default: 1 })
  targetCount: number;

  @Column({ type: 'int', default: 0 })
  currentProgress: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  optional: boolean;

  @Column({ type: 'int', nullable: true })
  timer?: number;
}

/**
 * Quest reward entity.
 */
export class QuestRewardEntity {
  @Column({ type: 'enum', enum: ['item', 'currency', 'xp', 'skill', 'title', 'area_unlock', 'character_unlock'] })
  type: 'item' | 'currency' | 'xp' | 'skill' | 'title' | 'area_unlock' | 'character_unlock';

  @Column()
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ type: 'enum', enum: ItemRarity, nullable: true })
  quality?: ItemRarity;
}

/**
 * Quest prerequisite entity.
 */
export class QuestPrerequisiteEntity {
  @Column({ type: 'enum', enum: ['quest_completed', 'level_reached', 'item_owned', 'reputation_threshold'] })
  type: 'quest_completed' | 'level_reached' | 'item_owned' | 'reputation_threshold';

  @Column()
  parameter: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: string | number;
}

/**
 * Reputation gain entity.
 */
export class ReputationGainEntity {
  @Column()
  factionId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int', nullable: true })
  maxCap?: number;
}

/**
 * Quest NPC involvement entity.
 */
export class QuestNPCInvolvementEntity {
  @Column()
  npcId: string;

  @Column({ type: 'enum', enum: ['giver', 'helper', 'antagonist', 'reward_giver'] })
  role: 'giver' | 'helper' | 'antagonist' | 'reward_giver';

  @Column({ nullable: true })
  dialogueTreeId?: string;
}

/**
 * Achievement entity.
 */
export class AchievementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AchievementCategory })
  category: AchievementCategory;

  @Column({ type: 'enum', enum: ItemRarity })
  rarity: ItemRarity;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column()
  iconPath: string;

  @Column({ default: false })
  hidden: boolean;

  @Column({ default: false })
  secret: boolean;

  @Column({ type: 'jsonb', default: [] })
  requirements: AchievementRequirementEntity[];

  @Column({ type: 'jsonb', default: [] })
  rewards: AchievementRewardEntity[];

  @Column({ type: 'timestamp', nullable: true })
  unlockedAt?: Date;

  @Column({ type: 'int', default: 0 })
  unlockCount: number;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column()
  playerId: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ default: false })
  isCompleted: boolean;
}

/**
 * Achievement requirement entity.
 */
export class AchievementRequirementEntity {
  @Column({ type: 'enum', enum: ['quest_completed', 'battles_won', 'items_collected', 'levels_gained', 'distance_traveled'] })
  type: 'quest_completed' | 'battles_won' | 'items_collected' | 'levels_gained' | 'distance_traveled';

  @Column()
  parameter: string;

  @Column({ type: 'int' })
  targetValue: number;

  @Column({ type: 'int', default: 0 })
  currentValue: number;

  @Column({ type: 'text' })
  progressDescription: string;
}

/**
 * Achievement reward entity.
 */
export class AchievementRewardEntity {
  @Column({ type: 'enum', enum: ['title', 'avatar_frame', 'profile_icon', 'currency', 'special_item'] })
  type: 'title' | 'avatar_frame' | 'profile_icon' | 'currency' | 'special_item';

  @Column()
  id: string;

  @Column({ type: 'int' })
  amount: number;
}

// ============================================================================
// SOCIAL & PARTY ENTITIES
// ============================================================================

/**
 * Friendship entity.
 */
export class FriendshipEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfileEntity, player => player.userAccount.friendshipsSent)
  @JoinColumn({ name: 'player1_id' })
  player1: PlayerProfileEntity;

  @Column({ name: 'player1_id' })
  player1Id: string;

  @ManyToOne(() => PlayerProfileEntity, player => player.userAccount.friendshipsReceived)
  @JoinColumn({ name: 'player2_id' })
  player2: PlayerProfileEntity;

  @Column({ name: 'player2_id' })
  player2Id: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected', 'blocked'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';

  @Column({ type: 'enum', enum: RelationshipLevel, default: RelationshipLevel.ACQUAINTANCE })
  relationshipLevel: RelationshipLevel;

  @Column({ type: 'int', default: 0 })
  trustPoints: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastInteraction: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  blockedReason?: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * Social link entity for NPC relationships.
 */
export class SocialLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  npcId: string;

  @Column({ type: 'enum', enum: SocialLinkType })
  type: SocialLinkType;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'int', default: 10 })
  maxLevel: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  pointsRequiredForNextLevel: number;

  @Column({ type: 'jsonb', default: [] })
  unlockedAbilities: string[];

  @Column({ type: 'jsonb', default: [] })
  unlockedRewards: SocialLinkRewardEntity[];

  @Column({ type: 'jsonb', default: [] })
  specialEvents: SocialLinkEventEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastInteraction: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Social link reward entity.
 */
export class SocialLinkRewardEntity {
  @Column({ type: 'enum', enum: ['stat_bonus', 'skill', 'item', 'accessibility'] })
  type: 'stat_bonus' | 'skill' | 'item' | 'accessibility';

  @Column()
  id: string;

  @Column({ type: 'int' })
  amount: number;
}

/**
 * Social link event entity.
 */
export class SocialLinkEventEntity {
  @Column()
  eventId: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  choiceMade: string;

  @Column({ type: 'int' })
  impactOnRelationship: number;
}

// ============================================================================
// UTILITY ENTITIES
// ============================================================================

/**
 * 3D vector entity.
 */
export class Vector3Entity {
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  x: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  y: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  z: number;
}

/**
 * Note on Database Design:
 * 
 * The entities above are designed to be compatible with TypeORM decorators.
 * For production use, you would need to:
 * 1. Install @nestjs/typeorm and typeorm packages
 * 2. Configure the database connection in your NestJS module
 * 3. Register these entities in your TypeORM configuration
 * 4. Run migrations to create the database schema
 * 
 * Some complex JSONB fields (like equipment, skills, etc.) store nested objects
 * as JSON for flexibility. For high-performance queries on specific fields,
 * consider normalizing these into separate tables with foreign keys.
 */