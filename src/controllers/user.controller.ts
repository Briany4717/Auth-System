import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

class UserController {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: true,
          isEmailVerified: true,
          isMfaEnabled: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({ users, count: users.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: true,
          isEmailVerified: true,
          isMfaEnabled: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { firstName, lastName } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Soft delete - deactivate account
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isActive: false },
      });

      // Revoke all refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.userId },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
