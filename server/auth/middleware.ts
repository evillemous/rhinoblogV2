import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./service";
import { UserRole } from "@shared/schema";

/**
 * Authentication middleware
 * Verifies JWT token and sets user data in request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  
  // Extract token from header
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }
  
  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  // Set user data in request
  req.user = payload;
  
  next();
}

/**
 * Admin role middleware
 * Checks if user has admin or superadmin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user exists and has admin role
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userRole = req.user.role;
  
  if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN || req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
}

/**
 * Superadmin role middleware
 * Checks if user has superadmin role
 */
export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user exists and has superadmin role
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (req.user.role === UserRole.SUPERADMIN) {
    next();
  } else {
    return res.status(403).json({ message: "Superadmin access required" });
  }
}

/**
 * Contributor role middleware
 * Checks if user has contributor, admin, or superadmin role
 */
export function isContributor(req: Request, res: Response, next: NextFunction) {
  // Check if user exists and has appropriate role
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const role = req.user.role;
  
  if (
    role === UserRole.CONTRIBUTOR || 
    role === UserRole.ADMIN || 
    role === UserRole.SUPERADMIN ||
    req.user.isAdmin
  ) {
    next();
  } else {
    return res.status(403).json({ message: "Contributor access required" });
  }
}

/**
 * Resource ownership middleware
 * Checks if user owns the resource or has admin privileges
 */
export function isOwnerOrAdmin(getUserIdFn: (req: Request) => Promise<number | null> | number | null) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Admin users can access any resource
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPERADMIN || req.user.isAdmin) {
      return next();
    }
    
    // Get the resource owner ID
    const ownerId = await getUserIdFn(req);
    
    // Check if user is the owner
    if (ownerId !== null && ownerId === req.user.id) {
      return next();
    }
    
    return res.status(403).json({ message: "Not authorized to access this resource" });
  };
}