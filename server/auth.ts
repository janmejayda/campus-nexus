import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getDatabase, hashPassword, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-nexus-secure-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: User['role'];
  name: string;
  department?: string;
  rollNumber?: string;
  staffId?: string;
  exp: number;
}

export function createToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
    rollNumber: user.rollNumber,
    staffId: user.staffId,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }

  // Ensure user still exists and is active in database
  const db = getDatabase();
  const dbUser = db.users.find(u => u.id === payload.userId);
  if (!dbUser || dbUser.status !== 'active') {
    res.status(403).json({ error: 'User account is suspended, inactive, or pending verification.' });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: Array<User['role']>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Authorized roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
      return;
    }

    next();
  };
}
