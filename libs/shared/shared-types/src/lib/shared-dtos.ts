import { UserRole, AssetCategory, AssetFormat, AssetVisibility, CharacterAssetType, AudioAssetType } from './shared-types.js';
import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ForgotPasswordDto {

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  readonly email: string;
}

export class ChangeUserRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

export class ResetUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

/**
 * Request DTO for uploading an asset.
 */
export interface UploadAssetDto {
  /** Asset category (e.g., 'characters', 'backgrounds') */
  category: AssetCategory;
  /** Sub-path within category (e.g., 'player/male/default') */
  subPath?: string;
  /** Original filename */
  filename: string;
  /** MIME type (e.g., 'image/png') */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response DTO containing presigned upload URL.
 */
export interface PresignedUploadResponse {
  /** Unique asset identifier */
  assetId: string;
  /** Presigned PUT URL for direct upload */
  uploadUrl: string;
  /** Public/final access URL after upload */
  accessUrl: string;
  /** Asset key in bucket */
  assetKey: string;
  /** Expiration time of presigned URL (ISO 8601) */
  expiresAt: string;
}

/**
 * Asset metadata entity stored in database.
 */
export interface AssetMetadata {
  /** UUID primary key */
  id: string;
  /** Asset category */
  category: AssetCategory;
  /** Full S3 key path */
  assetKey: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Visibility level */
  visibility: AssetVisibility;
  /** Owner/user ID who uploaded */
  ownerId?: string;
  /** Additional metadata tags */
  tags?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Response DTO for asset metadata queries.
 */
export interface AssetMetadataResponse extends Omit<AssetMetadata, 'ownerId'> {
  /** Public access URL */
  url: string;
  /** Presigned URL (if private and requested) */
  presignedUrl?: string;
}

/**
 * Query parameters for listing assets.
 */
export interface ListAssetsQueryDto {
  /** Filter by category */
  category?: AssetCategory;
  /** Filter by sub-path prefix */
  subPath?: string;
  /** Filter by visibility */
  visibility?: AssetVisibility;
  /** Pagination: page number (default: 1) */
  page?: number;
  /** Pagination: items per page (default: 20, max: 100) */
  limit?: number;
  /** Sort field (createdAt, filename, fileSize) */
  sortBy?: 'createdAt' | 'filename' | 'fileSize';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for asset listings.
 */
export interface PaginatedAssetsResponse {
  /** Array of asset metadata */
  items: AssetMetadataResponse[];
  /** Total count of matching assets */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Request DTO for generating presigned download URL.
 */
export interface PresignedDownloadRequestDto {
  /** Asset ID or key */
  assetId: string;
  /** Expiration in seconds (default: 3600) */
  expiresIn?: number;
}

/**
 * Response DTO with presigned download URL.
 */
export interface PresignedDownloadResponse {
  /** Presigned GET URL */
  downloadUrl: string;
  /** Expiration timestamp */
  expiresAt: string;
}

/**
 * DTO for character-specific asset requests.
 */
export interface CharacterAssetRequestDto {
  /** Character identifier (from shared-database) */
  characterId: string;
  /** Type of character asset needed */
  assetType: CharacterAssetType;
  /** Optional format preference */
  format?: AssetFormat;
}

/**
 * DTO for audio-specific asset requests.
 */
export interface AudioAssetRequestDto {
  /** Audio category (BGM, SE, etc.) */
  audioType: AudioAssetType;
  /** Track/sound identifier */
  trackId: string;
  /** Optional format preference */
  format?: AssetFormat;
}