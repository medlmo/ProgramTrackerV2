import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, type UserRole } from '@shared/schema';
import { eq } from 'drizzle-orm';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    role?: UserRole;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(username: string, password: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const isValid = await verifyPassword(password, user[0].passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user[0].id,
    username: user[0].username,
    role: user[0].role
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  (req as AuthenticatedRequest).user = {
    id: req.session.userId,
    username: req.session.username!,
    role: req.session.role!
  };

  next();
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}

export function requireEditor(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'editeur'])(req, res, next);
}

export function requireViewer(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'editeur', 'decideur'])(req, res, next);
}