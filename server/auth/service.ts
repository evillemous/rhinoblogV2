import jwt from "jsonwebtoken";
import { User, UserRole } from "@shared/schema";
import { storage } from "../storage";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "rhinoplastyblogs-jwt-secret";

// Token expiry time
const TOKEN_EXPIRY = "7d";

// Type for JWT payload
interface JwtPayload {
  id: number;
  username: string;
  role: string;
  contributorType?: string;
  isAdmin: boolean; // Keep for backward compatibility
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role || UserRole.USER,
    isAdmin: user.isAdmin || user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN,
  };
  
  // Add contributor type if present
  if (user.contributorType) {
    payload.contributorType = user.contributorType;
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate a user by username and password
 */
export async function authenticateUser(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const user = await storage.getUserByUsername(username);
    
    // If user doesn't exist or password doesn't match
    if (!user || user.password !== password) {
      return null;
    }
    
    // Generate token
    const token = generateToken(user);
    
    return { user, token };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData: any): Promise<{ user: User; token: string } | null> {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    
    if (existingUser) {
      return null;
    }
    
    // Set default role if not provided
    if (!userData.role) {
      userData.role = UserRole.USER;
    }
    
    // Create the user
    const user = await storage.createUser(userData);
    
    // Generate token
    const token = generateToken(user);
    
    return { user, token };
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}