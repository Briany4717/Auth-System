import prisma from '../config/database';
import { config } from '../config/env';

const isDevelopment = config.node_env === 'development';

class CorsService {
  private allowedOriginsCache: Set<string> = new Set();
  private lastRefresh: Date | null = null;

  /**
   * Get all allowed origins from cache
   */
  getAllowedOrigins(): string[] {
    return Array.from(this.allowedOriginsCache);
  }

  /**
   * Check if an origin is allowed
   */
  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      return true;
    }

    return this.allowedOriginsCache.has(origin);
  }

  /**
   * Refresh CORS cache from database
   */
  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 Refreshing CORS cache...');

      // Fetch active origins from database
      const origins = await prisma.allowedOrigin.findMany({ 
        where: { isActive: true },
        select: { url: true },
      });

      // Clear current cache
      this.allowedOriginsCache.clear();

      // Add database origins
      origins.forEach((origin) => {
        this.allowedOriginsCache.add(origin.url);
      });

      // Add development origins if in development mode
      if (isDevelopment) {
        const devOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173', // Vite default
          'http://localhost:4200', // Angular default
          'http://127.0.0.1:3000',
        ];

        devOrigins.forEach((origin) => {
          this.allowedOriginsCache.add(origin);
        });
      }

      this.lastRefresh = new Date();
      console.log(
        `✅ CORS cache refreshed. ${this.allowedOriginsCache.size} origins loaded.`,
      );
      console.log('📋 Allowed origins:', this.getAllowedOrigins());
    } catch (error) {
      console.error('❌ Error refreshing CORS cache:', error);
      throw error;
    }
  }

  /**
   * Get all origins from database (including inactive)
   */
  async getAllOriginsFromDB() {
    return await prisma.allowedOrigin.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single origin by ID
   */
  async getOriginById(id: string) {
    return await prisma.allowedOrigin.findUnique({
      where: { id },
    });
  }

  /**
   * Add a new allowed origin
   */
  async addOrigin(url: string, description?: string) {
    const newOrigin = await prisma.allowedOrigin.create({
      data: {
        url,
        description,
      },
    });

    // Refresh cache after adding
    await this.refreshCache();

    return newOrigin;
  }

  /**
   * Update an existing origin
   */
  async updateOrigin(id: string, data: { url?: string; description?: string; isActive?: boolean }) {
    const updatedOrigin = await prisma.allowedOrigin.update({
      where: { id },
      data,
    });

    // Refresh cache after updating
    await this.refreshCache();

    return updatedOrigin;
  }

  /**
   * Delete an origin permanently
   */
  async deleteOrigin(id: string) {
    const deletedOrigin = await prisma.allowedOrigin.delete({
      where: { id },
    });

    // Refresh cache after deleting
    await this.refreshCache();

    return deletedOrigin;
  }

  /**
   * Remove an allowed origin (soft delete - mark as inactive)
   */
  async removeOrigin(url: string): Promise<void> {
    await prisma.allowedOrigin.updateMany({
      where: { url },
      data: { isActive: false },
    });

    // Refresh cache after removing
    await this.refreshCache();
  }

  /**
   * Toggle origin active status
   */
  async toggleOriginStatus(id: string) {
    const origin = await this.getOriginById(id);
    if (!origin) {
      throw new Error('Origin not found');
    }

    const updated = await prisma.allowedOrigin.update({
      where: { id },
      data: { isActive: !origin.isActive },
    });

    // Refresh cache after toggling
    await this.refreshCache();

    return updated;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalOrigins: this.allowedOriginsCache.size,
      lastRefresh: this.lastRefresh,
      origins: this.getAllowedOrigins(),
    };
  }
}

export default new CorsService();
