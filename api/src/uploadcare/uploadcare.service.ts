import { Injectable, Logger } from '@nestjs/common';
import { UploadcareSimpleAuthSchema, deleteFile } from '@uploadcare/rest-client';

@Injectable()
export class UploadcareService {
  private readonly logger = new Logger(UploadcareService.name);
  private authSchema: UploadcareSimpleAuthSchema | null = null;

  constructor() {
    const publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    const secretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!publicKey || !secretKey) {
      this.logger.warn('Uploadcare keys not configured. Image deletion will be skipped.');
      return;
    }

    // Initialiser le schéma d'authentification Uploadcare
    this.authSchema = new UploadcareSimpleAuthSchema({
      publicKey,
      secretKey,
    });
  }

  /**
   * Extraire l'UUID de l'image depuis l'URL Uploadcare
   * Ex: https://ucarecdn.com/abc123-456-789/image.jpg -> abc123-456-789
   * Ex: https://xxx.ucarecdn.com/abc123-456-789/ -> abc123-456-789
   */
  private extractUuidFromUrl(imageUrl: string): string | null {
    try {
      // Regex flexible pour capturer l'UUID depuis différents formats d'URL Uploadcare
      const match = imageUrl.match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\//i);
      return match ? match[1] : null;
    } catch (error) {
      this.logger.error(`Error extracting UUID from URL: ${imageUrl}`, error);
      return null;
    }
  }

  /**
   * Supprimer une image sur Uploadcare
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.authSchema) {
      this.logger.warn('Uploadcare auth not initialized. Skipping deletion.');
      return false;
    }

    if (!imageUrl) {
      return true;
    }

    const uuid = this.extractUuidFromUrl(imageUrl);
    if (!uuid) {
      this.logger.warn(`Could not extract UUID from image URL: ${imageUrl}`);
      return false;
    }

    try {
      await deleteFile({ uuid }, { authSchema: this.authSchema });
      this.logger.log(`Successfully deleted image: ${uuid}`);
      return true;
    } catch (error) {
      // Ne pas bloquer l'opération si la suppression échoue
      this.logger.error(`Failed to delete image ${uuid}:`, error);
      return false;
    }
  }

  /**
   * Supprimer plusieurs images
   */
  async deleteImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const deletePromises = imageUrls
      .filter(url => url) // Filtrer les URLs vides
      .map(url => this.deleteImage(url));

    await Promise.allSettled(deletePromises);
  }
}

