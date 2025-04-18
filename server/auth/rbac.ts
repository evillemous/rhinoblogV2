import { UserRole } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

// Type for holding permissions
export type Permission = 
  | "create:post" 
  | "create:comment" 
  | "vote" 
  | "auto_publish:post"
  | "edit:any_post"
  | "delete:any_post" 
  | "moderate:content"
  | "generate:ai_post"
  | "access:analytics"
  | "manage:users"
  | "manage:roles"
  | "manage:system"
  | "impersonate:user";

// Role-based permissions mapping
export const rolePermissions: Record<string, Permission[]> = {
  [UserRole.SUPERADMIN]: [
    "create:post",
    "create:comment",
    "vote",
    "auto_publish:post",
    "edit:any_post",
    "delete:any_post",
    "moderate:content",
    "generate:ai_post",
    "access:analytics",
    "manage:users",
    "manage:roles",
    "manage:system",
    "impersonate:user",
  ],
  [UserRole.ADMIN]: [
    "create:post",
    "create:comment",
    "vote",
    "auto_publish:post",
    "edit:any_post",
    "delete:any_post",
    "moderate:content",
    "generate:ai_post",
  ],
  [UserRole.CONTRIBUTOR]: [
    "create:post",
    "create:comment",
    "vote",
    "auto_publish:post",
  ],
  [UserRole.USER]: [
    "create:post",
    "create:comment",
    "vote",
  ],
  [UserRole.GUEST]: [],
};

// Helper function to check if a user has a permission
export function hasPermission(userRole: string, permission: Permission): boolean {
  // Default to USER role if none provided
  const role = userRole || UserRole.USER;
  
  // Get permissions for the role
  const permissions = rolePermissions[role] || [];
  
  // Check if permission exists in the role's permissions
  return permissions.includes(permission);
}

// Middleware to check for specific permissions
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    // If user is not authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get the user's role from the request
    const userRole = req.user?.role || UserRole.USER;
    
    // Check if the user has the required permission
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    // If the user has the permission, proceed
    next();
  };
}

// Check if the user is a superadmin
export function isSuperAdmin(req: Request) {
  return req.user?.role === UserRole.SUPERADMIN;
}

// Check if the user is an admin or superadmin
export function isAdminOrSuperAdmin(req: Request) {
  return req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPERADMIN;
}

// Check if the user is a contributor or higher role
export function isContributorOrHigher(req: Request) {
  const role = req.user?.role || '';
  return role === UserRole.CONTRIBUTOR || role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
}

// Middleware to check if user is a superadmin
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!isSuperAdmin(req)) {
    return res.status(403).json({ message: "Superadmin privileges required" });
  }
  
  next();
}

// Middleware to check if user is an admin or superadmin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!isAdminOrSuperAdmin(req)) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  
  next();
}

// Middleware to check if user is a contributor or higher role
export function requireContributor(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!isContributorOrHigher(req)) {
    return res.status(403).json({ message: "Contributor privileges required" });
  }
  
  next();
}

// Middleware to check if user has one of the specified roles
export function hasRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userRole = req.user?.role || '';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Required role not found. You need one of these roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
}