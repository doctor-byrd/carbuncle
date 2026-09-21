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

