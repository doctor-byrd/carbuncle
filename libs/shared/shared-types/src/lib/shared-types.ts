export function sharedTypes(): string {
  return 'shared-types';
}

/**
 * Single source of truth for all scene identifiers across the application.
 */
export enum SceneId {
  EMPTY_SCENE = "EMPTY",
  LOADING = "LOADING",
  SCENE_ONE = "SCENE_ONE",
  SCENE_TWO = "SCENE_TWO",
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PLAYER = 'player',
  PARTY_LEADER = 'party_leader',    // For multiplayer parties
  SPECTATOR = 'spectator',
}

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  IN_GAME = 'in_game',
}

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

export enum TournamentStatus {
  REGISTRATION = 'registration',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChannelType {
  DIRECT_MESSAGE = 'direct_message',
  GROUP = 'group',
  GLOBAL = 'global',
  TEAM = 'team',
}

// ============================================================================
// ASSET MANAGEMENT ENUMS
// ============================================================================

/**
 * Asset categories for organizing game resources in S3/MinIO.
 * Maps to bucket folder structure: carbuncle-assets/{category}/{subPath}
 */
export enum AssetCategory {
  CHARACTERS = 'characters',
  ENEMIES = 'enemies',
  BACKGROUNDS = 'backgrounds',
  UI = 'ui',
  AUDIO = 'audio',
  SPRITES = 'sprites',
  ANIMATIONS = 'animations',
  PARTICLES = 'particles',
  FONTS = 'fonts',
  MISC = 'misc',
}

/**
 * Specific character asset types for player/NPC sprites.
 */
export enum CharacterAssetType {
  PORTRAIT = 'portrait',
  SPRITE_SHEET = 'sprite_sheet',
  BATTLE_SPRITE = 'battle_sprite',
  THUMBNAIL = 'thumbnail',
  AVATAR = 'avatar',
}

/**
 * Audio asset types for music and sound effects.
 */
export enum AudioAssetType {
  BGM = 'bgm',              // Background music
  BATTLE_THEME = 'battle_theme',
  SE = 'se',                // Sound effect
  VOICE = 'voice',          // Voice clips
  AMBIENT = 'ambient',      // Environmental audio
}

/**
 * File formats supported by the asset pipeline.
 */
export enum AssetFormat {
  // Images
  PNG = 'png',
  JPG = 'jpg',
  WEBP = 'webp',
  SVG = 'svg',
  GIF = 'gif',
  
  // Audio
  MP3 = 'mp3',
  OGG = 'ogg',
  WAV = 'wav',
  
  // Animation/Sprite data
  JSON = 'json',
  ATLAS = 'atlas',
  
  // Fonts
  TTF = 'ttf',
  WOFF = 'woff',
  WOFF2 = 'woff2',
}

/**
 * Asset visibility levels for access control.
 */
export enum AssetVisibility {
  PUBLIC = 'public',        // Accessible without auth (presigned or anonymous)
  AUTHENTICATED = 'authenticated',  // Requires valid user session
  ADMIN_ONLY = 'admin_only',        // Restricted to admins
}

/**
 * AssetMetadata interface
 * Stores metadata about uploaded game assets in S3/MinIO.
 */
export interface IAssetMetadata {
  id: string;
  category: AssetCategory;
  assetKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  visibility: AssetVisibility;
  ownerId?: string;
  tags?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}