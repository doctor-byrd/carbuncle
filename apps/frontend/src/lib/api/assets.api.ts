import { apiClient } from './index';
import {
  UploadAssetDto,
  PresignedUploadResponse,
  AssetMetadataResponse,
  ListAssetsQueryDto,
  PaginatedAssetsResponse,
  PresignedDownloadResponse,
  CharacterAssetRequestDto,
  AudioAssetRequestDto,
} from '@org/shared-types';

/**
 * Asset API endpoints for interacting with the backend assets service.
 */
export const assetsApi = {
  /**
   * Get a presigned upload URL for direct S3 upload.
   */
  async getUploadUrl(dto: UploadAssetDto): Promise<PresignedUploadResponse> {
    const response = await apiClient.post<PresignedUploadResponse>('/assets/upload-url', dto);
    return response.data;
  },

  /**
   * Upload a file directly to S3 using presigned URL.
   */
  async uploadToS3(uploadUrl: string, file: File, contentType: string): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    });
  },

  /**
   * Get asset metadata by ID.
   */
  async getAsset(assetId: string): Promise<AssetMetadataResponse> {
    const response = await apiClient.get<AssetMetadataResponse>(`/assets/${assetId}`);
    return response.data;
  },

  /**
   * List assets with filtering and pagination.
   */
  async listAssets(query?: ListAssetsQueryDto): Promise<PaginatedAssetsResponse> {
    const params = new URLSearchParams();
    if (query?.category) params.append('category', query.category);
    if (query?.subPath) params.append('subPath', query.subPath);
    if (query?.visibility) params.append('visibility', query.visibility);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await apiClient.get<PaginatedAssetsResponse>(
      `/assets${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get presigned download URL for private assets.
   */
  async getDownloadUrl(assetId: string, expiresIn?: number): Promise<PresignedDownloadResponse> {
    const params = expiresIn ? `?expiresIn=${expiresIn}` : '';
    const response = await apiClient.post<PresignedDownloadResponse>(
      `/assets/${assetId}/download-url${params}`,
    );
    return response.data;
  },

  /**
   * Delete an asset.
   */
  async deleteAsset(assetId: string): Promise<void> {
    await apiClient.delete(`/assets/${assetId}`);
  },

  /**
   * Get character asset by character ID and asset type.
   */
  async getCharacterAsset(dto: CharacterAssetRequestDto): Promise<AssetMetadataResponse> {
    const response = await apiClient.post<AssetMetadataResponse>(
      '/assets/character',
      dto,
    );
    return response.data;
  },

  /**
   * Get audio asset by type and track ID.
   */
  async getAudioAsset(dto: AudioAssetRequestDto): Promise<AssetMetadataResponse> {
    const response = await apiClient.post<AssetMetadataResponse>(
      '/assets/audio',
      dto,
    );
    return response.data;
  },

  /**
   * Get public asset URL directly (no API call needed).
   */
  getPublicUrl(assetKey: string): string {
    const s3Url = import.meta.env.VITE_S3_URL || 'http://localhost:9000';
    const bucket = import.meta.env.VITE_S3_BUCKET || 'carbuncle-assets';
    return `${s3Url}/${bucket}/${assetKey}`;
  },
};