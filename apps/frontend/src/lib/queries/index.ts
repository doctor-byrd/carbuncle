import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { assetsApi } from '../api/assets.api';
import {
  AssetMetadataResponse,
  ListAssetsQueryDto,
  PaginatedAssetsResponse,
  UploadAssetDto,
  PresignedUploadResponse,
  PresignedDownloadResponse,
  AssetCategory,
} from '@org/shared-types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters: ListAssetsQueryDto) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (assetId: string) => [...assetKeys.details(), assetId] as const,
};

// ============================================================================
// ASSET QUERIES
// ============================================================================

/**
 * Fetch single asset metadata by ID.
 */
export function useAsset(assetId: string, options?: Omit<UseQueryOptions<AssetMetadataResponse, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<AssetMetadataResponse, Error>({
    queryKey: assetKeys.detail(assetId),
    queryFn: () => assetsApi.getAsset(assetId),
    enabled: !!assetId,
    ...options,
  });
}

/**
 * Fetch paginated list of assets with filtering.
 */
export function useAssets(
  query?: ListAssetsQueryDto,
  options?: Omit<UseQueryOptions<PaginatedAssetsResponse, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaginatedAssetsResponse, Error>({
    queryKey: assetKeys.list(query || {}),
    queryFn: () => assetsApi.listAssets(query),
    ...options,
  });
}

/**
 * Fetch assets by category.
 */
export function useAssetsByCategory(
  category: AssetCategory,
  options?: Omit<UseQueryOptions<PaginatedAssetsResponse, Error>, 'queryKey' | 'queryFn'>,
) {
  return useAssets({ category }, options);
}

// ============================================================================
// ASSET MUTATIONS
// ============================================================================

/**
 * Mutation to request upload URL and upload file.
 */
export function useUploadAsset(
  options?: Omit<UseMutationOptions<PresignedUploadResponse, Error, UploadAssetDto & { file: File }>, 'mutationFn'>,
) {
  return useMutation<PresignedUploadResponse, Error, UploadAssetDto & { file: File }>({
    mutationFn: async ({ file, ...dto }) => {
      // Step 1: Get presigned upload URL
      const response = await assetsApi.getUploadUrl(dto);
      
      // Step 2: Upload file directly to S3 using the url from the response
      await assetsApi.uploadToS3(response.uploadUrl, file, dto.mimeType);
      
      // Return the full response (including uploadUrl) to match PresignedUploadResponse
      return response;
    },
    ...options,
  });
}

/**
 * Mutation to delete an asset.
 */
export function useDeleteAsset(options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (assetId) => assetsApi.deleteAsset(assetId),
    onSuccess: () => {
      // Invalidate asset list queries
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    ...options,
  });
}

/**
 * Mutation to get presigned download URL.
 */
export function useGetDownloadUrl(
  options?: Omit<UseMutationOptions<PresignedDownloadResponse, Error, { assetId: string; expiresIn?: number }>, 'mutationFn'>,
) {
  return useMutation<PresignedDownloadResponse, Error, { assetId: string; expiresIn?: number }>({
    mutationFn: ({ assetId, expiresIn }) => assetsApi.getDownloadUrl(assetId, expiresIn),
    ...options,
  });
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to load and cache an asset URL.
 * Returns the public URL immediately if available, or fetches metadata first.
 */
export function useAssetUrl(assetId: string): string | undefined {
  const { data } = useAsset(assetId, {
    staleTime: Infinity, // Asset URLs don't change
    gcTime: Infinity,
  });

  return data?.url;
}

/**
 * Hook to preload multiple assets.
 */
export function usePreloadAssets(assetIds: string[]) {
  const queryClient = useQueryClient();

  const preload = async () => {
    await Promise.all(
      assetIds.map((id) =>
        queryClient.fetchQuery({
          queryKey: assetKeys.detail(id),
          queryFn: () => assetsApi.getAsset(id),
          staleTime: Infinity,
        }),
      ),
    );
  };

  return { preload };
}