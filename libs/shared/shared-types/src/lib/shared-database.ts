import { UserRole, UserStatus, FriendshipStatus, AssetCategory, AssetVisibility, } from './shared-types.js';
import { 
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
    JoinColumn,
    Unique, 
} from 'typeorm';
import { AchievementCategory, ArmorType, CharacterClass, ElementType, EquipmentSlot, FishType, ItemRarity, ItemType, PartyRole, QuestDifficulty, QuestStatus, SkillType, SlotVariant, SocialLinkType, StatType, StatusEffectType, TargetType, TimePeriod, WeaponType, WeatherType } from '@org/game-engine';

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

  @OneToOne(() => PlayerProfile, (profile) => profile.user, { cascade: true })
  profile: PlayerProfile;

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

@Entity({ name: 'asset_metadata' })
export class AssetMetadata extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 50,
  })
  category!: AssetCategory | string;

  @Column({ name: 'asset_key', unique: true })
  assetKey!: string;

  @Column()
  filename!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: AssetVisibility.PUBLIC,
  })
  visibility!: AssetVisibility | string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: Record<string, unknown>;
}

@Entity('player_profiles')
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 100 })
  audioVolume: number;

  @Column({ default: 100 })
  musicVolume: number;

  @Column({ default: 100 })
  sfxVolume: number;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'ultra'], default: 'medium' })
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';

  @Column({ default: 50 })
  controllerSensitivity: number;

  @Column({ default: 3 })
  textSpeed: number;

  @Column({ default: true })
  autoSaveEnabled: boolean;

  // Accessibility Flags
  @Column({ default: false })
  highContrastMode: boolean;

  @Column({ default: false })
  largeText: boolean;

  @Column({ default: false })
  colorBlindFriendly: boolean;

  @OneToMany(() => Character, (character) => character.owner, { cascade: true })
  characters: Character[];

  @OneToMany(() => Friendship, (friendship) => friendship.player1)
  sentFriendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.player2)
  receivedFriendships: Friendship[];
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CharacterClass })
  class: CharacterClass;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @ManyToOne(() => PlayerProfile, (profile) => profile.characters, { nullable: true })
  @JoinColumn()
  owner?: PlayerProfile;

  // Relations to normalized sub-tables
  @OneToOne(() => CharacterStats, (stats) => stats.character, { cascade: true })
  stats: CharacterStats;

  @OneToMany(() => EquipmentInstance, (eq) => eq.character)
  equipment: EquipmentInstance[];

  @OneToMany(() => CharacterSkill, (skill) => skill.character)
  skills: CharacterSkill[];

  @OneToMany(() => ActiveStatusEffect, (effect) => effect.targetCharacter)
  activeEffects: ActiveStatusEffect[];

  @Column({ type: 'float', default: 0 })
  positionX: number;

  @Column({ type: 'float', default: 0 })
  positionY: number;

  @Column({ type: 'float', default: 0 })
  positionZ: number;

  @Column({ default: true })
  isAlive: boolean;
}

@Entity('character_stats')
export class CharacterStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Character, (char) => char.stats)
  @JoinColumn()
  character: Character;

  // Primary Stats
  @Column({ default: 10 })
  strength: number;

  @Column({ default: 10 })
  magic: number;

  @Column({ default: 10 })
  dexterity: number;

  @Column({ default: 10 })
  endurance: number;

  @Column({ default: 10 })
  luck: number;

  @Column({ default: 10 })
  agility: number;

  // Derived Stats (Cached or Calculated)
  @Column({ default: 100 })
  maxHp: number;

  @Column({ default: 100 })
  currentHp: number;

  @Column({ default: 50 })
  maxMp: number;

  @Column({ default: 50 })
  currentMp: number;

  @Column({ default: 0 })
  maxSp: number;

  @Column({ default: 0 })
  currentSp: number;

  // Combat Stats
  @Column({ default: 10 })
  attackPower: number;

  @Column({ default: 10 })
  magicPower: number;

  @Column({ default: 10 })
  defense: number;

  @Column({ default: 10 })
  magicDefense: number;

  @Column({ default: 95 })
  accuracy: number;

  @Column({ default: 5 })
  evasion: number;

  @Column({ default: 5 })
  criticalRate: number;

  @Column({ default: 150 })
  criticalDamage: number;

  @Column({ default: 10 })
  speed: number;

  // Resistances (Normalized Columns)
  @Column({ default: 0 })
  fireResistance: number;

  @Column({ default: 0 })
  iceResistance: number;

  @Column({ default: 0 })
  windResistance: number;

  @Column({ default: 0 })
  electricityResistance: number;

  @Column({ default: 0 })
  lightResistance: number;

  @Column({ default: 0 })
  darkResistance: number;
}

@Entity('character_skills')
export class CharacterSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, (char) => char.skills)
  @JoinColumn()
  character: Character;

  @Column()
  skillId: string; // Reference to static skill definition

  @Column()
  name: string;

  @Column({ type: 'enum', enum: SkillType })
  type: SkillType;

  @Column({ type: 'enum', enum: ElementType })
  elementType: ElementType;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 1 })
  maxLevel: number;

  @Column({ default: 0 })
  currentCooldown: number;

  @Column({ default: -1 })
  usesRemaining: number; // -1 for unlimited

  @Column({ type: 'enum', enum: TargetType })
  targetType: TargetType;
}

@Entity('active_status_effects')
export class ActiveStatusEffect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, (char) => char.activeEffects)
  @JoinColumn()
  targetCharacter: Character;

  @Column({ type: 'enum', enum: StatusEffectType })
  type: StatusEffectType;

  @Column()
  remainingTurns: number;

  @Column({ default: 1 })
  intensity: number;

  @Column({ nullable: true })
  sourceCharacterId: string;

  @Column({ default: false })
  isPermanent: boolean;

  @Column({ default: 1 })
  stacks: number;
}


@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PlayerProfile)
  @JoinColumn()
  owner: PlayerProfile;

  @Column({ default: 100 })
  maxCapacity: number;

  @Column({ default: 0 })
  currentWeight: number;

  @OneToMany(() => InventoryItem, (item) => item.inventory, { cascade: true })
  items: InventoryItem[];

  @Column({ default: 0 })
  gold: number;
  
  @Column({ default: 0 })
  gems: number;
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, (inv) => inv.items)
  @JoinColumn()
  inventory: Inventory;

  @Column()
  itemId: string; // Template ID

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @Column({ type: 'enum', enum: ItemRarity })
  rarity: ItemRarity;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  durability: number;

  @Column({ nullable: true })
  charges: number;

  @Column({ default: false })
  equipped: boolean;

  @Column({ default: false })
  favorite: boolean;

  @Column({ nullable: true })
  customName: string;

  @CreateDateColumn()
  acquisitionDate: Date;

  @OneToMany(() => Enchantment, (enc) => enc.item)
  enchantments: Enchantment[];
}

@Entity('equipment_instances')
export class EquipmentInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, (char) => char.equipment)
  @JoinColumn()
  character: Character;

  @Column()
  itemId: string;

  @Column({ type: 'enum', enum: EquipmentSlot })
  slot: EquipmentSlot;

  @Column({ nullable: true, type: 'enum', enum: WeaponType })
  weaponType: WeaponType;

  @Column({ nullable: true, type: 'enum', enum: ArmorType })
  armorType: ArmorType;

  @Column({ default: 100 })
  durability: number;

  @Column({ default: 100 })
  maxDurability: number;

  @Column({ default: 0 })
  attackPowerBonus: number;

  @Column({ default: 0 })
  defenseBonus: number;
}

@Entity('enchantments')
export class Enchantment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryItem, (item) => item.enchantments)
  @JoinColumn()
  item: InventoryItem;

  @Column()
  enchantmentId: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  statBonusValue: number;
  
  @Column({ type: 'enum', enum: StatType, nullable: true })
  statBonusType: StatType;

  @Column({ type: 'enum', enum: ElementType, nullable: true })
  elementalBonusType: ElementType;

  @Column({ default: 0 })
  elementalBonusValue: number;

  @Column({ nullable: true })
  expiresAt: Date;
}

@Entity('quest_instances')
export class QuestInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile)
  @JoinColumn()
  player: PlayerProfile;

  @Column()
  questId: string; // Template ID

  @Column()
  title: string;

  @Column({ type: 'enum', enum: QuestStatus, default: QuestStatus.ACTIVE })
  status: QuestStatus;

  @Column({ type: 'enum', enum: QuestDifficulty })
  difficulty: QuestDifficulty;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  completionCount: number;

  @OneToMany(() => QuestObjective, (obj) => obj.questInstance, { cascade: true })
  objectives: QuestObjective[];
}

@Entity('quest_objectives')
export class QuestObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuestInstance, (q) => q.objectives)
  @JoinColumn()
  questInstance: QuestInstance;

  @Column()
  objectiveId: string;

  @Column({ type: 'enum', enum: QuestObjective })
  type: QuestObjective;

  @Column()
  description: string;

  @Column()
  targetCount: number;

  @Column({ default: 0 })
  currentProgress: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isOptional: boolean;
}

@Entity('player_achievements')
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile)
  @JoinColumn()
  player: PlayerProfile;

  @Column()
  achievementId: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: AchievementCategory })
  category: AchievementCategory;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 100 })
  targetValue: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ nullable: true })
  unlockedAt: Date;
}

@Entity('friendships')
@Unique(['player1', 'player2']) 
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile, (profile) => profile.sentFriendships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player1_id' })
  player1: PlayerProfile;

  @ManyToOne(() => PlayerProfile, (profile) => profile.receivedFriendships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player2_id' })
  player2: PlayerProfile;

  @Column({ type: 'enum', enum: FriendshipStatus })
  status: FriendshipStatus;

  @Column({ default: 0 })
  trustPoints: number;

  @Column({ nullable: true })
  lastInteraction: Date;
}

@Entity('social_links')
export class SocialLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile)
  @JoinColumn()
  player: PlayerProfile;

  @Column()
  npcId: string;

  @Column({ type: 'enum', enum: SocialLinkType })
  type: SocialLinkType;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  pointsToNextLevel: number;

  @Column({ default: new Date() })
  lastInteraction: Date;
}

@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character)
  @JoinColumn()
  leader: Character;

  @Column({ default: false })
  inviteOnly: boolean;

  @Column({ default: true })
  shareExperience: boolean;

  @OneToMany(() => PartyMember, (member) => member.party, { cascade: true })
  members: PartyMember[];
}

@Entity('party_members')
export class PartyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Party, (party) => party.members)
  @JoinColumn()
  party: Party;

  @ManyToOne(() => Character)
  @JoinColumn()
  character: Character;

  @Column({ type: 'enum', enum: PartyRole })
  role: PartyRole;

  @Column({ default: 0 })
  contributionScore: number;
}

@Entity('slot_sessions')
export class SlotSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile)
  @JoinColumn()
  player: PlayerProfile;

  @Column({ type: 'enum', enum: SlotVariant })
  variant: SlotVariant;

  @Column({ default: 0 })
  totalCoins: number;

  @Column({ default: 0 })
  totalWins: number;

  @Column({ default: 0 })
  totalLosses: number;

  @Column({ default: 0 })
  freeSpinsRemaining: number;

  @Column({ default: 1 })
  currentMultiplier: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sessionStart: Date;
}

@Entity('fishing_sessions')
export class FishingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlayerProfile)
  @JoinColumn()
  player: PlayerProfile;

  @Column()
  locationId: string;

  @Column({ type: 'enum', enum: WeatherType })
  weather: WeatherType;

  @Column({ type: 'enum', enum: TimePeriod })
  timeOfDay: TimePeriod;

  @Column({ default: 0 })
  totalCasts: number;

  @Column({ default: 0 })
  totalValue: number;

  @OneToMany(() => CaughtFish, (fish) => fish.session)
  caughtFish: CaughtFish[];
}

@Entity('caught_fish')
export class CaughtFish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FishingSession, (session) => session.caughtFish)
  @JoinColumn()
  session: FishingSession;

  @Column({ type: 'enum', enum: FishType })
  fishType: FishType;

  @Column({ type: 'float' })
  size: number;

  @Column()
  value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  caughtAt: Date;

  @Column({ default: false })
  isRecord: boolean;
}