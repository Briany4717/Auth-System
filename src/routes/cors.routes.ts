import { Router } from 'express';
import {
  getAllOrigins,
  getOriginById,
  createOrigin,
  updateOrigin,
  deleteOrigin,
  toggleOriginStatus,
  refreshCorsCache,
  getCorsConfig,
} from '../controllers/cors.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/roleCheck.middleware';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(isAdmin);

// ============================================
// CORS Configuration & Cache Management
// ============================================

/**
 * @route   GET /api/admin/cors
 * @desc    Get current CORS cache configuration and stats
 * @access  Admin only
 */
router.get('/cors', getCorsConfig);

/**
 * @route   POST /api/admin/cors/refresh
 * @desc    Manually refresh CORS cache from database
 * @access  Admin only
 */
router.post('/cors/refresh', refreshCorsCache);

// ============================================
// Origins CRUD Endpoints
// ============================================

/**
 * @route   GET /api/admin/origins
 * @desc    Get all allowed origins from database
 * @access  Admin only
 */
router.get('/origins', getAllOrigins);

/**
 * @route   GET /api/admin/origins/:id
 * @desc    Get a specific origin by ID
 * @access  Admin only
 */
router.get('/origins/:id', getOriginById);

/**
 * @route   POST /api/admin/origins
 * @desc    Create a new allowed origin
 * @access  Admin only
 * @body    { url: string, description?: string }
 */
router.post('/origins', createOrigin);

/**
 * @route   PUT /api/admin/origins/:id
 * @desc    Update an existing origin
 * @access  Admin only
 * @body    { url?: string, description?: string, isActive?: boolean }
 */
router.put('/origins/:id', updateOrigin);

/**
 * @route   DELETE /api/admin/origins/:id
 * @desc    Delete an origin permanently
 * @access  Admin only
 */
router.delete('/origins/:id', deleteOrigin);

/**
 * @route   PATCH /api/admin/origins/:id/toggle
 * @desc    Toggle origin active/inactive status
 * @access  Admin only
 */
router.patch('/origins/:id/toggle', toggleOriginStatus);

export default router;
