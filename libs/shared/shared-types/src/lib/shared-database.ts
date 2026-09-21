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
    JoinColumn 
} from 'typeorm';


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
