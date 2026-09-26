import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import {
  type UploadAssetDto,
  PresignedUploadResponse,
  AssetMetadataResponse,
  type ListAssetsQueryDto,
  PaginatedAssetsResponse,
  PresignedDownloadResponse,
} from '@org/shared-types';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Request a presigned upload URL.
   * Client will use this URL to directly upload to S3/MinIO.
   */
  @Post('upload-url')
  @HttpCode(HttpStatus.CREATED)
  async getUploadUrl(@Body() dto: UploadAssetDto): Promise<PresignedUploadResponse> {
    return this.assetsService.generatePresignedUploadUrl(dto);
  }

  /**
   * Request a presigned download URL for private assets.
   */
  @Post(':assetId/download-url')
  async getDownloadUrl(
    @Param('assetId') assetId: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<PresignedDownloadResponse> {
    return this.assetsService.generatePresignedDownloadUrl(
      assetId,
      expiresIn ? parseInt(expiresIn, 10) : 3600,
    );
  }

  /**
   * Get asset metadata by ID.
   */
  @Get(':assetId')
  async getAsset(@Param('assetId') assetId: string): Promise<AssetMetadataResponse> {
    return this.assetsService.getAssetMetadata(assetId);
  }

  /**
   * List assets with optional filtering.
   */
  @Get()
  async listAssets(@Query() query: ListAssetsQueryDto): Promise<PaginatedAssetsResponse> {
    return this.assetsService.listAssets(query);
  }

  /**
   * Delete an asset.
   */
  @Delete(':assetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAsset(@Param('assetId') assetId: string): Promise<void> {
    return this.assetsService.deleteAsset(assetId);
  }
}