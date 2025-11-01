import { Request, Response } from 'express';
import corsService from '../services/cors.service';

/**
 * Get all allowed origins from database
 * @route GET /api/admin/origins
 * @access Admin only
 */
export const getAllOrigins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const origins = await corsService.getAllOriginsFromDB();

    res.status(200).json({
      message: 'Origins retrieved successfully',
      count: origins.length,
      data: origins,
    });
  } catch (error) {
    console.error('Error getting origins:', error);
    res.status(500).json({
      error: 'Failed to retrieve origins',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a single origin by ID
 * @route GET /api/admin/origins/:id
 * @access Admin only
 */
export const getOriginById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const origin = await corsService.getOriginById(id);

    if (!origin) {
      res.status(404).json({
        error: 'Not found',
        message: 'Origin not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Origin retrieved successfully',
      data: origin,
    });
  } catch (error) {
    console.error('Error getting origin by ID:', error);
    res.status(500).json({
      error: 'Failed to retrieve origin',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Refresh CORS cache from database
 * @route POST /api/admin/cors/refresh
 * @access Admin only
 */
export const refreshCorsCache = async (_req: Request, res: Response): Promise<void> => {
  try {
    await corsService.refreshCache();

    res.status(200).json({
      message: 'CORS cache refreshed successfully',
      stats: corsService.getCacheStats(),
    });
  } catch (error) {
    console.error('Error refreshing CORS cache:', error);
    res.status(500).json({
      error: 'Failed to refresh CORS cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get current CORS configuration and cache stats
 * @route GET /api/admin/cors
 * @access Admin only
 */
export const getCorsConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = corsService.getCacheStats();

    res.status(200).json({
      ...stats,
      message: 'CORS configuration retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting CORS config:', error);
    res.status(500).json({
      error: 'Failed to get CORS configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new allowed origin
 * @route POST /api/admin/origins
 * @access Admin only
 */
export const createOrigin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, description } = req.body;

    // Validate required field
    if (!url) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'URL is required',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid URL format. Must be a valid URL (e.g., https://example.com)',
      });
      return;
    }

    // Create origin and refresh cache
    const newOrigin = await corsService.addOrigin(url, description);

    res.status(201).json({
      message: 'Origin created successfully',
      data: newOrigin,
      stats: corsService.getCacheStats(),
    });
  } catch (error) {
    console.error('Error creating origin:', error);

    // Handle duplicate URL error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This URL already exists in the allowed origins',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to create origin',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update an existing origin
 * @route PUT /api/admin/origins/:id
 * @access Admin only
 */
export const updateOrigin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { url, description, isActive } = req.body;

    // Validate at least one field is provided
    if (!url && !description && isActive === undefined) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'At least one field (url, description, or isActive) must be provided',
      });
      return;
    }

    // Validate URL format if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid URL format',
        });
        return;
      }
    }

    // Update origin and refresh cache
    const updatedOrigin = await corsService.updateOrigin(id, {
      url,
      description,
      isActive,
    });

    res.status(200).json({
      message: 'Origin updated successfully',
      data: updatedOrigin,
      stats: corsService.getCacheStats(),
    });
  } catch (error) {
    console.error('Error updating origin:', error);

    // Handle not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({
        error: 'Not found',
        message: 'Origin not found',
      });
      return;
    }

    // Handle duplicate URL error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This URL already exists in the allowed origins',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to update origin',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete an origin permanently
 * @route DELETE /api/admin/origins/:id
 * @access Admin only
 */
export const deleteOrigin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete origin and refresh cache
    const deletedOrigin = await corsService.deleteOrigin(id);

    res.status(200).json({
      message: 'Origin deleted successfully',
      data: deletedOrigin,
      stats: corsService.getCacheStats(),
    });
  } catch (error) {
    console.error('Error deleting origin:', error);

    // Handle not found error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      res.status(404).json({
        error: 'Not found',
        message: 'Origin not found',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to delete origin',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Toggle origin active status
 * @route PATCH /api/admin/origins/:id/toggle
 * @access Admin only
 */
export const toggleOriginStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedOrigin = await corsService.toggleOriginStatus(id);

    res.status(200).json({
      message: `Origin ${updatedOrigin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedOrigin,
      stats: corsService.getCacheStats(),
    });
  } catch (error) {
    console.error('Error toggling origin status:', error);

    if (error instanceof Error && error.message === 'Origin not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'Origin not found',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to toggle origin status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
