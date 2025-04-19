import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertTagSchema,
  insertPostTagSchema,
  insertCommentSchema,
  insertVoteSchema,
  insertTopicSchema
} from "@shared/schema";
import { generatePost, generateCustomContent } from "./openai";
import jwt from "jsonwebtoken";
import cron from "node-cron";

// Declare global types for schedule
declare global {
  var postSchedule: {
    enabled: boolean;
    cronExpression: string;
  } | undefined;
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "rhinoplastyblogs-jwt-secret";

// Add type definition for the request with user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware for authentication
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Admin middleware
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Role-based middleware
const hasRole = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
};

// Check if user is superadmin
const isSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ message: "Superadmin access required" });
  }
  next();
};

// Contributor middleware (contributor, admin, or superadmin)
const isContributor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || 
      (req.user.role !== 'contributor' && 
       req.user.role !== 'admin' && 
       req.user.role !== 'superadmin')) {
    return res.status(403).json({ message: "Contributor access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());
  
  // Import UserRole and ContributorType
  const { UserRole, ContributorType } = await import("@shared/schema");
  
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Generate JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin,
          role: user.role || 'user',
          contributorType: user.contributorType
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return user info and token (excluding password)
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Login attempt with:", req.body);
      const { username, password } = req.body;
      
      if (!username || !password) {
        console.log("Login failed: Missing username or password");
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? `${user.username} (role: ${user.role})` : "none");
      
      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.password !== password) {
        console.log("Login failed: Password mismatch");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT
      const payload = { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'superadmin',
        role: user.role || 'user',
        contributorType: user.contributorType
      };
      console.log("Generating token with payload:", payload);
      
      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return user info and token (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
      return res.status(500).json({ message: "Error logging in" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Get all users (for admin purposes)
  app.get("/api/users", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Return users without passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Admin user endpoints - added to match frontend expectations
  
  app.get("/api/admin/users", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Return users without passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return res.json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  app.post("/api/admin/users", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      // Create user logic, making sure to hash password
      const { username, email, password, role, contributorType } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser({
        username,
        email: email || null,
        password, // The storage implementation should hash this
        role: role || "user",
        contributorType: contributorType || null,
        isAdmin: role === "admin" || role === "superadmin",
        isVerified: role === "admin" || role === "superadmin" || role === "contributor",
        createdAt: new Date(),
        avatarUrl: null,
        bio: null,
        isLocked: false
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.delete("/api/admin/users/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent deletion of own account
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Get user to check role
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent deletion of superadmin accounts if you're not a superadmin
      if (user.role === "superadmin" && req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Cannot delete superadmin accounts" });
      }
      
      // Actually delete the user from storage
      console.log(`Deleting user: ${userId} (${user.username})`);
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Error deleting user" });
    }
  });
  
  // Update user profile
  app.patch("/api/users/profile", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, email, avatarUrl, bio } = req.body;
      
      // Validate input
      if (username && username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
      }
      
      if (email && !email.includes('@')) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      if (bio && bio.length > 500) {
        return res.status(400).json({ message: "Bio must be less than 500 characters" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if username is being changed and if it's already taken
      if (username && username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, {
        username: username || user.username,
        email,
        avatarUrl,
        bio,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Generate new JWT with updated information
      const token = jwt.sign(
        { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          isAdmin: updatedUser.isAdmin,
          role: updatedUser.role || 'user',
          contributorType: updatedUser.contributorType
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // Update user password
  app.patch("/api/users/password", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      const updatedUser = await storage.updateUser(userId, {
        password: newPassword,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Error updating password" });
    }
  });
  
  // Contributor endpoints
  
  // Get contributor profile with external links
  app.get("/api/contributor/profile", authenticate, isContributor, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Process profileLinks if available
      let profileData = { ...user };
      delete profileData.password; // Remove password
      
      if (profileData.profileLinks && typeof profileData.profileLinks === 'string') {
        try {
          profileData.profileLinks = JSON.parse(profileData.profileLinks);
        } catch (e) {
          console.error("Error parsing profile links:", e);
          profileData.profileLinks = {}; // Default to empty object if parsing fails
        }
      } else if (!profileData.profileLinks) {
        profileData.profileLinks = {};
      }
      
      return res.status(200).json(profileData);
    } catch (error) {
      console.error("Error fetching contributor profile:", error);
      return res.status(500).json({ message: "Error fetching contributor profile" });
    }
  });
  
  // Update contributor profile
  app.patch("/api/contributor/profile", authenticate, isContributor, async (req, res) => {
    try {
      const userId = req.user.id;
      const { bio, profileLinks } = req.body;
      
      // Process profile links based on contributor type
      let storedProfileLinks = profileLinks;
      if (profileLinks && typeof profileLinks === 'object') {
        storedProfileLinks = JSON.stringify(profileLinks);
      }
      
      // Update user profile
      const updateData: any = {};
      if (bio !== undefined) updateData.bio = bio;
      if (storedProfileLinks !== undefined) updateData.profileLinks = storedProfileLinks;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Parse profileLinks for response
      let responseData = { ...userWithoutPassword };
      if (responseData.profileLinks && typeof responseData.profileLinks === 'string') {
        try {
          responseData.profileLinks = JSON.parse(responseData.profileLinks);
        } catch (e) {
          console.error("Error parsing profile links for response:", e);
          responseData.profileLinks = {};
        }
      }
      
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error updating contributor profile:", error);
      return res.status(500).json({ message: "Error updating contributor profile" });
    }
  });
  
  // Get contributor content (posts, comments, analytics)
  app.get("/api/contributor/content", authenticate, isContributor, async (req, res) => {
    try {
      const userId = req.user.id;
      const allPosts = await storage.getPostsWithTags();
      
      // Filter for the contributor's posts
      const contributorPosts = allPosts.filter(post => post.userId === userId);
      
      // Get basic analytics for each post
      const postsWithAnalytics = await Promise.all(contributorPosts.map(async post => {
        const comments = await storage.getCommentsWithUsers(post.id);
        
        return {
          ...post,
          commentCount: comments.length,
          analytics: {
            views: post.upvotes + post.downvotes + comments.length * 2, // Simple estimation for demo
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            comments: comments.length
          }
        };
      }));
      
      return res.status(200).json({
        posts: postsWithAnalytics,
        totalPosts: postsWithAnalytics.length,
        summary: {
          totalUpvotes: postsWithAnalytics.reduce((sum, post) => sum + post.upvotes, 0),
          totalComments: postsWithAnalytics.reduce((sum, post) => sum + post.commentCount, 0),
          totalViews: postsWithAnalytics.reduce((sum, post) => sum + post.analytics.views, 0)
        }
      });
    } catch (error) {
      console.error("Error fetching contributor content:", error);
      return res.status(500).json({ message: "Error fetching contributor content" });
    }
  });
  
  // Admin contributor management endpoints
  app.get("/api/admin/contributors", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const users = await storage.getUsers();
      const contributors = users.filter(user => user.role === 'contributor');
      
      // Process each contributor to handle profileLinks and remove passwords
      const processedContributors = contributors.map(contributor => {
        const { password, ...noPassword } = contributor;
        
        // Parse profileLinks if it exists
        if (noPassword.profileLinks && typeof noPassword.profileLinks === 'string') {
          try {
            return {
              ...noPassword,
              profileLinks: JSON.parse(noPassword.profileLinks)
            };
          } catch (e) {
            console.error("Error parsing profile links:", e);
            return {
              ...noPassword,
              profileLinks: {}
            };
          }
        }
        
        return {
          ...noPassword,
          profileLinks: {}
        };
      });
      
      return res.status(200).json(processedContributors);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      return res.status(500).json({ message: "Error fetching contributors" });
    }
  });
  
  // Update contributor status (admin endpoint)
  app.patch("/api/admin/contributors/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const contributorId = parseInt(req.params.id);
      const { verified, contributorType, trustScore } = req.body;
      
      // Get the contributor
      const contributor = await storage.getUser(contributorId);
      
      if (!contributor) {
        return res.status(404).json({ message: "Contributor not found" });
      }
      
      if (contributor.role !== 'contributor') {
        return res.status(400).json({ message: "User is not a contributor" });
      }
      
      // Only allow updating specific contributor fields
      const updateData: any = {};
      if (verified !== undefined) updateData.verified = verified;
      if (contributorType !== undefined) updateData.contributorType = contributorType;
      if (trustScore !== undefined) updateData.trustScore = trustScore;
      
      // Update contributor
      const updatedContributor = await storage.updateUser(contributorId, updateData);
      
      if (!updatedContributor) {
        return res.status(500).json({ message: "Failed to update contributor" });
      }
      
      // Don't send password to client
      const { password, ...contributorWithoutPassword } = updatedContributor;
      
      return res.status(200).json(contributorWithoutPassword);
    } catch (error) {
      console.error("Error updating contributor:", error);
      return res.status(500).json({ message: "Error updating contributor" });
    }
  });
  
  // Convert user to contributor (admin endpoint)
  app.post("/api/admin/contributors/promote/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { contributorType } = req.body;
      
      if (!contributorType || !Object.values(ContributorType).includes(contributorType)) {
        return res.status(400).json({ 
          message: "Valid contributor type required",
          validTypes: Object.values(ContributorType)
        });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === 'contributor') {
        return res.status(400).json({ message: "User is already a contributor" });
      }
      
      // Don't allow promoting admins or superadmins
      if (user.role === 'admin' || user.role === 'superadmin') {
        return res.status(400).json({ message: "Cannot convert admin or superadmin to contributor" });
      }
      
      // Promote to contributor
      const updatedUser = await storage.updateUser(userId, {
        role: 'contributor',
        contributorType,
        verified: false, // Default to unverified when first promoted
        trustScore: 10 // Default starting trust score
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to promote user to contributor" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json({
        message: "User successfully promoted to contributor",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error promoting user to contributor:", error);
      return res.status(500).json({ message: "Error promoting user to contributor" });
    }
  });
  
  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const tagFilter = req.query.tag as string | undefined;
      
      // Get all posts with their tags
      const posts = await storage.getPostsWithTags(limit, offset);
      
      // If a tag filter is specified, filter posts that have that tag
      if (tagFilter) {
        const filteredPosts = posts.filter(post => 
          post.tags.some(tag => tag.name.toLowerCase() === tagFilter.toLowerCase())
        );
        return res.status(200).json(filteredPosts);
      }
      
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching posts" });
    }
  });
  
  // Get posts by topic
  app.get("/api/topics/:slug/posts", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Verify topic exists
      const topic = await storage.getTopicBySlug(slug);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // Get all posts
      const allPosts = await storage.getPostsWithTags();
      
      // Filter posts based on relevance to the topic
      // This is a simple implementation - in a real system, you might have a more complex
      // algorithm or a direct database relationship between posts and topics
      const topicKeywords = [
        topic.name.toLowerCase(),
        topic.slug.toLowerCase(),
        ...(topic.description ? topic.description.toLowerCase().split(/\s+/) : [])
      ];
      
      const filteredPosts = allPosts.filter(post => {
        // Check post title and content for topic relevance
        const postText = `${post.title.toLowerCase()} ${post.content.toLowerCase()}`;
        const tagsText = post.tags.map(t => t.name.toLowerCase()).join(' ');
        
        // Check if any topic keyword is found in the post text or tags
        return topicKeywords.some(keyword => 
          keyword.length > 3 && (postText.includes(keyword) || tagsText.includes(keyword))
        );
      });
      
      // Apply pagination
      const paginatedPosts = filteredPosts.slice(offset, offset + limit);
      
      return res.status(200).json(paginatedPosts);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching posts for topic" });
    }
  });
  
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostWithTags(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching post" });
    }
  });
  
  app.post("/api/posts", authenticate, async (req, res) => {
    try {
      console.log('User making post request:', req.user?.username, req.user?.id);
      console.log('Request body for post creation:', JSON.stringify(req.body));
      
      if (!req.user || !req.user.id) {
        console.error('Authentication required or user ID missing');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Prepare post data with defaults - critical to ensure userId is set
      const postDataWithDefaults = {
        userId: req.user.id,
        title: req.body.title || '',
        content: req.body.content || '',
        imageUrl: req.body.imageUrl || null,
        isAiGenerated: !!req.body.isAiGenerated,
        topicId: null // Default to null
      };
      
      // Convert topicId from string to number if needed
      if (req.body.topicId) {
        if (typeof req.body.topicId === 'string' && req.body.topicId.trim() !== '') {
          postDataWithDefaults.topicId = parseInt(req.body.topicId, 10);
        } else if (typeof req.body.topicId === 'number') {
          postDataWithDefaults.topicId = req.body.topicId;
        }
      }
      
      console.log('Post data with defaults:', JSON.stringify(postDataWithDefaults));
      
      let postData;
      try {
        // Validate with schema
        postData = insertPostSchema.parse(postDataWithDefaults);
        console.log('Parsed post data:', JSON.stringify(postData));
      } catch (parseError: any) {
        console.error('Schema validation error:', parseError);
        return res.status(400).json({ 
          message: parseError.errors || 'Schema validation failed',
          details: parseError
        });
      }
      
      // Create post
      const post = await storage.createPost(postData);
      console.log('Post created with ID:', post.id);
      
      // Handle tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tagName of req.body.tags) {
          // Find or create tag
          let tag = await storage.getTagByName(tagName);
          
          if (!tag) {
            // Create a random color for the tag
            const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            tag = await storage.createTag({ name: tagName, color: randomColor });
          }
          
          // Create post-tag association
          await storage.createPostTag({ postId: post.id, tagId: tag.id });
        }
      }
      
      const postWithTags = await storage.getPostWithTags(post.id);
      return res.status(201).json(postWithTags);
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ 
        message: "Error creating post",
        details: error.message
      });
    }
  });
  
  app.put("/api/posts/:id", authenticate, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post or has appropriate role
      const userIsAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const userIsContributor = req.user.role === 'contributor';
      
      if (post.userId !== req.user.id && !userIsAdmin && !(userIsContributor && post.userId === req.user.id)) {
        return res.status(403).json({ message: "Not authorized to update this post" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      return res.status(200).json(updatedPost);
    } catch (error) {
      return res.status(500).json({ message: "Error updating post" });
    }
  });
  
  app.delete("/api/posts/:id", authenticate, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post or has appropriate role
      const userIsAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const userIsContributor = req.user.role === 'contributor';
      
      if (post.userId !== req.user.id && !userIsAdmin && !(userIsContributor && post.userId === req.user.id)) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      const deleted = await storage.deletePost(postId);
      if (deleted) {
        return res.status(200).json({ message: "Post deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete post" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error deleting post" });
    }
  });
  
  // Vote routes
  app.post("/api/posts/:id/vote", authenticate, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { voteType } = req.body;
      
      if (voteType !== "upvote" && voteType !== "downvote") {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user already voted
      const existingVote = await storage.getVote(req.user.id, postId);
      
      if (existingVote) {
        // If vote type is the same, remove vote (toggle)
        if (existingVote.voteType === voteType) {
          await storage.deleteVote(existingVote.id);
          
          // Update post vote counts
          const updatedPost = await storage.updatePost(postId, {
            [voteType === "upvote" ? "upvotes" : "downvotes"]: 
              post[voteType === "upvote" ? "upvotes" : "downvotes"] - 1
          });
          
          return res.status(200).json(updatedPost);
        } else {
          // Change vote type
          await storage.updateVote(existingVote.id, voteType);
          
          // Update post vote counts
          const updatedPost = await storage.updatePost(postId, {
            upvotes: voteType === "upvote" ? post.upvotes + 1 : post.upvotes - 1,
            downvotes: voteType === "downvote" ? post.downvotes + 1 : post.downvotes - 1
          });
          
          return res.status(200).json(updatedPost);
        }
      } else {
        // Create new vote
        await storage.createVote({
          userId: req.user.id,
          postId,
          commentId: null,
          voteType
        });
        
        // Update post vote count
        const updatedPost = await storage.updatePost(postId, {
          [voteType === "upvote" ? "upvotes" : "downvotes"]: 
            post[voteType === "upvote" ? "upvotes" : "downvotes"] + 1
        });
        
        return res.status(200).json(updatedPost);
      }
    } catch (error) {
      return res.status(500).json({ message: "Error voting on post" });
    }
  });
  
  // Comment routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsWithUsers(postId);
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching comments" });
    }
  });
  
  app.post("/api/posts/:id/comments", authenticate, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
        userId: req.user.id
      });
      
      const comment = await storage.createComment(commentData);
      
      // Get user data for response
      const user = await storage.getUser(req.user.id);
      
      return res.status(201).json({
        ...comment,
        user: {
          id: user?.id,
          username: user?.username,
          avatarUrl: user?.avatarUrl
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Error creating comment" });
    }
  });
  
  app.delete("/api/comments/:id", authenticate, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user owns the comment or is admin
      if (comment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      const deleted = await storage.deleteComment(commentId);
      if (deleted) {
        return res.status(200).json({ message: "Comment deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete comment" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error deleting comment" });
    }
  });
  
  // Comment vote routes
  app.post("/api/comments/:id/vote", authenticate, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { voteType } = req.body;
      
      if (voteType !== "upvote" && voteType !== "downvote") {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user already voted
      const existingVote = await storage.getVote(req.user.id, undefined, commentId);
      
      if (existingVote) {
        // If vote type is the same, remove vote (toggle)
        if (existingVote.voteType === voteType) {
          await storage.deleteVote(existingVote.id);
          
          // Update comment vote counts
          const updatedComment = await storage.getComment(commentId);
          return res.status(200).json(updatedComment);
        } else {
          // Change vote type
          await storage.updateVote(existingVote.id, voteType);
          
          // Update comment vote counts
          const updatedComment = await storage.getComment(commentId);
          return res.status(200).json(updatedComment);
        }
      } else {
        // Create new vote
        await storage.createVote({
          userId: req.user.id,
          postId: null,
          commentId,
          voteType
        });
        
        // Update comment vote count
        const updatedComment = await storage.updateCommentVotes(
          commentId, 
          voteType === "upvote"
        );
        
        return res.status(200).json(updatedComment);
      }
    } catch (error) {
      return res.status(500).json({ message: "Error voting on comment" });
    }
  });
  
  // Tag routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      return res.status(200).json(tags);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tags" });
    }
  });
  
  // Topic routes
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getTopics();
      return res.status(200).json(topics);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topics" });
    }
  });
  
  app.get("/api/topics/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const topic = await storage.getTopicBySlug(slug);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topic" });
    }
  });
  
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const topic = await storage.getTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topic" });
    }
  });
  
  app.post("/api/topics", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const topicData = insertTopicSchema.parse(req.body);
      
      // Check if topic with same slug already exists
      const existingTopic = await storage.getTopicBySlug(topicData.slug);
      if (existingTopic) {
        return res.status(400).json({ message: "Topic with this slug already exists" });
      }
      
      const topic = await storage.createTopic(topicData);
      return res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Error creating topic" });
    }
  });
  
  app.put("/api/topics/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const topic = await storage.getTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // Check if new slug already exists (for another topic)
      if (req.body.slug && req.body.slug !== topic.slug) {
        const existingTopic = await storage.getTopicBySlug(req.body.slug);
        if (existingTopic && existingTopic.id !== topicId) {
          return res.status(400).json({ message: "Topic slug already exists" });
        }
      }
      
      const updatedTopic = await storage.updateTopic(topicId, req.body);
      return res.status(200).json(updatedTopic);
    } catch (error) {
      return res.status(500).json({ message: "Error updating topic" });
    }
  });
  
  app.delete("/api/topics/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const topic = await storage.getTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // Delete the topic
      const deleted = await storage.deleteTopic(topicId);
      if (deleted) {
        return res.status(200).json({ message: "Topic deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete topic" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error deleting topic" });
    }
  });

  app.get("/api/tags/:id", async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tag = await storage.getTag(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      return res.status(200).json(tag);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tag" });
    }
  });

  app.post("/api/tags", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      
      // Check if tag already exists
      const existingTag = await storage.getTagByName(tagData.name);
      if (existingTag) {
        return res.status(400).json({ message: "Tag already exists" });
      }
      
      const tag = await storage.createTag(tagData);
      return res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Error creating tag" });
    }
  });

  app.put("/api/tags/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tag = await storage.getTag(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      // Check if new name already exists (for another tag)
      if (req.body.name && req.body.name !== tag.name) {
        const existingTag = await storage.getTagByName(req.body.name);
        if (existingTag && existingTag.id !== tagId) {
          return res.status(400).json({ message: "Tag name already exists" });
        }
      }
      
      const updatedTag = await storage.updateTag(tagId, req.body);
      return res.status(200).json(updatedTag);
    } catch (error) {
      return res.status(500).json({ message: "Error updating tag" });
    }
  });

  app.delete("/api/tags/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tag = await storage.getTag(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      // Delete all post-tag associations for this tag
      // Note: This could be moved to a transaction or handled in the storage layer
      await storage.deleteTagAssociations(tagId);
      
      // Delete the tag
      const deleted = await storage.deleteTag(tagId);
      if (deleted) {
        return res.status(200).json({ message: "Tag deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete tag" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error deleting tag" });
    }
  });
  
  // Admin routes (AI post generation)
  app.post("/api/admin/generate-post", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const { age, gender, procedure, reason } = req.body;
      
      if (!age || !gender || !procedure || !reason) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get admin user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate post using OpenAI
      const generatedPost = await generatePost(age, gender, procedure, reason);
      
      if (!generatedPost) {
        return res.status(500).json({ message: "Failed to generate post" });
      }
      
      // Create post in database
      const post = await storage.createPost({
        userId: user.id,
        title: generatedPost.title,
        content: generatedPost.content,
        imageUrl: null,
        isAiGenerated: true
      });
      
      // Add tags
      for (const tagName of generatedPost.tags) {
        // Find or create tag
        let tag = await storage.getTagByName(tagName);
        
        if (!tag) {
          // Create a random color for the tag
          const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          tag = await storage.createTag({ name: tagName, color: randomColor });
        }
        
        // Create post-tag association
        await storage.createPostTag({ postId: post.id, tagId: tag.id });
      }
      
      const postWithTags = await storage.getPostWithTags(post.id);
      return res.status(201).json(postWithTags);
    } catch (error) {
      return res.status(500).json({ message: "Error generating post" });
    }
  });
  
  // Schedule daily post generation
  app.post("/api/admin/schedule", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const { enabled, cronExpression } = req.body;
      
      // Store schedule settings (in-memory for this implementation)
      global.postSchedule = {
        enabled: enabled === true,
        cronExpression: cronExpression || "0 12 * * *" // Default: daily at 12 PM
      };
      
      return res.status(200).json(global.postSchedule);
    } catch (error) {
      return res.status(500).json({ message: "Error updating schedule" });
    }
  });
  
  app.get("/api/admin/schedule", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      // Return schedule settings
      return res.status(200).json(global.postSchedule || {
        enabled: false,
        cronExpression: "0 12 * * *" // Default: daily at 12 PM
      });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching schedule" });
    }
  });
  
  // Generate multiple posts (batch content creation)
  // API key management
  app.get("/api/admin/openai-status", authenticate, async (req, res) => {
    try {
      console.log("OpenAI status check - User:", req.user?.username, "Role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
      console.log("Full user info:", JSON.stringify(req.user));
      
      // More permissive checks for admin access - accept any indication of admin status
      const isAdmin = req.user?.role === 'admin' || 
                      req.user?.role === 'superadmin' || 
                      req.user?.isAdmin === true || 
                      req.user?.role?.includes('admin');
      
      if (!isAdmin) {
        console.log("Access denied - insufficient role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
        return res.status(403).json({ message: "Access denied. Required role: admin or superadmin" });
      }

      // Check if OpenAI API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ configured: false });
      }
      
      // Report that an API key exists with a masked version for display
      // Also send the full key so the form can be populated
      return res.status(200).json({ 
        configured: true,
        key: `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`,
        fullKey: apiKey // This will be used to populate the form
      });
    } catch (error) {
      console.error("Error checking OpenAI API status:", error);
      return res.status(500).json({ message: "Error checking OpenAI API status" });
    }
  });

  app.post("/api/admin/test-openai", authenticate, async (req, res) => {
    console.log("Test OpenAI - User:", req.user?.username, "Role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
    console.log("Full user info:", JSON.stringify(req.user));
    
    // More permissive checks for admin access - accept any indication of admin status
    const isAdmin = req.user?.role === 'admin' || 
                    req.user?.role === 'superadmin' || 
                    req.user?.isAdmin === true || 
                    req.user?.role?.includes('admin');
    
    if (!isAdmin) {
      console.log("Access denied - insufficient role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
      return res.status(403).json({ message: "Access denied. Required role: admin or superadmin" });
    }
    try {
      // If a test key is provided, use it temporarily (but don't save it)
      const testKey = req.body.apiKey;
      
      // Simple test prompt
      const testPrompt = "Generate a one-sentence tagline for a rhinoplasty blog.";
      
      try {
        // Create a temporary OpenAI instance with the test key
        const { default: OpenAI } = await import("openai");
        const tempOpenAI = new OpenAI({ 
          apiKey: testKey || process.env.OPENAI_API_KEY 
        });
        
        // Test the connection with a simple request
        const response = await tempOpenAI.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: testPrompt }],
          temperature: 0.7,
          max_tokens: 60
        });
        
        const content = response.choices[0].message.content;
        return res.status(200).json({ 
          success: true, 
          message: "OpenAI connection successful",
          tagline: content
        });
      } catch (apiError) {
        console.error("OpenAI API test failed:", apiError);
        return res.status(200).json({ 
          success: false, 
          message: `OpenAI connection failed: ${apiError.message}` 
        });
      }
    } catch (error) {
      console.error("Error in test-openai route:", error);
      return res.status(500).json({ 
        success: false,
        message: "Error testing OpenAI connection" 
      });
    }
  });
  
  // Custom content generator endpoint
  app.post("/api/admin/generate-custom", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const { customPrompt, contentType } = req.body;
      
      if (!customPrompt) {
        return res.status(400).json({ message: "Custom prompt is required" });
      }
      
      // Get admin user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Generating custom ${contentType} content with prompt: ${customPrompt.substring(0, 50)}...`);
      
      // Generate content using OpenAI with custom prompt
      const generatedPost = await generateCustomContent(
        customPrompt,
        contentType || 'educational'
      );
      
      if (!generatedPost) {
        return res.status(500).json({ message: "Failed to generate content" });
      }
      
      // Create post in database
      const post = await storage.createPost({
        userId: user.id,
        title: generatedPost.title,
        content: generatedPost.content,
        imageUrl: null,
        isAiGenerated: true
      });
      
      // Handle tags
      const tagsToAdd = [...generatedPost.tags];
      
      // Add content type tag if it's educational
      if (contentType === 'educational') {
        tagsToAdd.push('educational');
      }
      
      // Process all tags
      for (const tagName of tagsToAdd) {
        // Find or create tag
        let tag = await storage.getTagByName(tagName);
        
        if (!tag) {
          // Create a random color for the tag
          const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          tag = await storage.createTag({ name: tagName, color: randomColor });
        }
        
        // Create post-tag association
        await storage.createPostTag({ postId: post.id, tagId: tag.id });
      }
      
      console.log(`Created custom ${contentType} post: ${generatedPost.title}`);
      
      const postWithTags = await storage.getPostWithTags(post.id);
      return res.status(201).json({ message: "Successfully generated custom content", post: postWithTags });
    } catch (error) {
      console.error("Error generating custom content:", error);
      return res.status(500).json({ message: "Error generating custom content" });
    }
  });

  app.post("/api/admin/update-openai-key", authenticate, async (req, res) => {
    console.log("Update OpenAI key - User:", req.user?.username, "Role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
    console.log("Full user info:", JSON.stringify(req.user));
    
    // More permissive checks for admin access - accept any indication of admin status
    const isAdmin = req.user?.role === 'admin' || 
                    req.user?.role === 'superadmin' || 
                    req.user?.isAdmin === true || 
                    req.user?.role?.includes('admin');
    
    if (!isAdmin) {
      console.log("Access denied - insufficient role:", req.user?.role, "isAdmin:", req.user?.isAdmin);
      return res.status(403).json({ message: "Access denied. Required role: admin or superadmin" });
    }
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        return res.status(400).json({ message: "Valid API key is required" });
      }
      
      // In a real production app, you would store this securely
      // For our demo, we're setting the environment variable (note: this won't persist between restarts)
      process.env.OPENAI_API_KEY = apiKey.trim();
      
      // Update the OpenAI instance with the new key
      const indexModule = await import("./index");
      const OpenAI = (await import("openai")).default;
      // Create a new OpenAI client with the updated key and update the exported reference
      indexModule.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      return res.status(200).json({ message: "OpenAI API key updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error updating OpenAI API key" });
    }
  });

  // Get AI-generated posts
  app.get("/api/admin/ai-posts", authenticate, async (req, res) => {
    try {
      // More permissive checks for admin access - accept any indication of admin status
      const isAdmin = req.user?.role === 'admin' || 
                    req.user?.role === 'superadmin' || 
                    req.user?.isAdmin === true || 
                    req.user?.role?.includes('admin');
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Access denied. Required role: admin or superadmin" });
      }
      
      // Get the most recent AI-generated posts
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const posts = await storage.getPosts(limit, 0);
      
      // Return only AI-generated posts with their tags
      const aiPosts = posts
        .filter(post => post.isAiGenerated)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      return res.json(aiPosts);
    } catch (error) {
      console.error("Error fetching AI posts:", error);
      return res.status(500).json({ message: "Error fetching AI-generated posts" });
    }
  });

  // ============= Moderation Endpoints ============= //
  
  // Perform moderation action on a post
  app.post("/api/admin/moderation/posts/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { action, reason } = req.body;
      
      // Validate action
      const validActions = ['approve', 'reject', 'flag', 'pin', 'unpin'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid action. Valid actions are: ${validActions.join(', ')}` 
        });
      }
      
      // Get the post
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
      
      // Process action
      let updatedPost;
      switch (action) {
        case 'approve':
          updatedPost = await storage.updatePost(postId, {
            status: 'published',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Content approved by moderator'
          });
          break;
        case 'reject':
          updatedPost = await storage.updatePost(postId, {
            status: 'rejected',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Content rejected by moderator'
          });
          break;
        case 'flag':
          updatedPost = await storage.updatePost(postId, {
            status: 'flagged',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Content flagged for review'
          });
          break;
        case 'pin':
          updatedPost = await storage.updatePost(postId, {
            isPinned: true,
            updatedAt: new Date()
          });
          break;
        case 'unpin':
          updatedPost = await storage.updatePost(postId, {
            isPinned: false,
            updatedAt: new Date()
          });
          break;
      }
      
      if (!updatedPost) {
        return res.status(500).json({ success: false, message: "Failed to update post" });
      }
      
      return res.json({ 
        success: true, 
        message: `Post successfully ${action}ed`, 
        data: updatedPost 
      });
    } catch (error) {
      console.error(`Error performing moderation action:`, error);
      return res.status(500).json({ success: false, message: "Error processing moderation action" });
    }
  });
  
  // Perform moderation action on a comment
  app.post("/api/admin/moderation/comments/:id", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { action, reason } = req.body;
      
      // Validate action
      const validActions = ['approve', 'reject', 'flag'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid action. Valid actions are: ${validActions.join(', ')}` 
        });
      }
      
      // Get the comment
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }
      
      // Process action
      let updatedComment;
      switch (action) {
        case 'approve':
          updatedComment = await storage.updateComment(commentId, {
            status: 'published',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Comment approved by moderator'
          });
          break;
        case 'reject':
          updatedComment = await storage.updateComment(commentId, {
            status: 'rejected',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Comment rejected by moderator'
          });
          break;
        case 'flag':
          updatedComment = await storage.updateComment(commentId, {
            status: 'flagged',
            moderatedAt: new Date(),
            moderatedBy: req.user.id,
            moderationReason: reason || 'Comment flagged for review'
          });
          break;
      }
      
      if (!updatedComment) {
        return res.status(500).json({ success: false, message: "Failed to update comment" });
      }
      
      return res.json({ 
        success: true, 
        message: `Comment successfully ${action}ed`, 
        data: updatedComment 
      });
    } catch (error) {
      console.error(`Error performing moderation action:`, error);
      return res.status(500).json({ success: false, message: "Error processing moderation action" });
    }
  });
  
  // Get flagged content that needs moderation
  app.get("/api/admin/moderation/flagged", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      // Get all posts and comments
      const posts = await storage.getPostsWithTags();
      const allComments = await storage.getCommentsWithUsers();
      
      // Filter flagged content
      const flaggedPosts = posts.filter(post => post.status === 'flagged');
      const flaggedComments = allComments.filter(comment => comment.status === 'flagged');
      
      return res.json({
        posts: flaggedPosts,
        comments: flaggedComments
      });
    } catch (error) {
      console.error(`Error fetching flagged content:`, error);
      return res.status(500).json({ message: "Error fetching flagged content" });
    }
  });
  
  // Get moderation stats
  app.get("/api/admin/moderation/stats", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      // Get all posts and comments
      const posts = await storage.getPostsWithTags();
      const allComments = await storage.getCommentsWithUsers();
      
      // Calculate stats
      const totalPosts = posts.length;
      const flaggedPosts = posts.filter(post => post.status === 'flagged').length;
      const approvedPosts = posts.filter(post => post.status === 'published').length;
      const rejectedPosts = posts.filter(post => post.status === 'rejected').length;
      
      const totalComments = allComments.length;
      const flaggedComments = allComments.filter(comment => comment.status === 'flagged').length;
      const approvedComments = allComments.filter(comment => comment.status === 'published').length;
      const rejectedComments = allComments.filter(comment => comment.status === 'rejected').length;
      
      return res.json({
        posts: {
          total: totalPosts,
          flagged: flaggedPosts,
          approved: approvedPosts,
          rejected: rejectedPosts
        },
        comments: {
          total: totalComments,
          flagged: flaggedComments,
          approved: approvedComments,
          rejected: rejectedComments
        }
      });
    } catch (error) {
      console.error(`Error fetching moderation stats:`, error);
      return res.status(500).json({ message: "Error fetching moderation stats" });
    }
  });
  
  app.post("/api/admin/generate-batch", authenticate, hasRole(['admin', 'superadmin']), async (req, res) => {
    try {
      // Get admin user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a large variety of informational post topics
      const informationalTopics = [
        {
          title: "What to Expect After Rhinoplasty: A Complete Day-by-Day Recovery Guide",
          topic: "post-surgery recovery timeline"
        },
        {
          title: "Different Types of Rhinoplasty Procedures Explained",
          topic: "rhinoplasty procedure types comparison"
        },
        {
          title: "The Road to Recovery: Rhinoplasty Healing Process",
          topic: "full rhinoplasty healing timeline"
        },
        {
          title: "Choosing the Right Rhinoplasty Surgeon: What to Look For",
          topic: "finding qualified rhinoplasty surgeons"
        },
        {
          title: "Rhinoplasty Cost Guide: Understanding What You're Paying For",
          topic: "rhinoplasty pricing and financing options"
        },
        {
          title: "Ethnic Rhinoplasty: Preserving Heritage While Enhancing Features",
          topic: "ethnic rhinoplasty techniques and considerations"
        },
        {
          title: "Revision Rhinoplasty: What You Need to Know for Second Surgeries",
          topic: "revision rhinoplasty challenges and solutions"
        },
        {
          title: "Correcting a Deviated Septum: More Than Just Cosmetic Benefits",
          topic: "septoplasty benefits and procedures"
        },
        {
          title: "Non-Surgical Rhinoplasty: Pros, Cons, and Limitations",
          topic: "liquid rhinoplasty alternatives"
        },
        {
          title: "Post-Rhinoplasty Exercise Guide: When Can You Safely Resume Activities?",
          topic: "physical activity after rhinoplasty"
        },
        {
          title: "Sleeping Positions After Rhinoplasty: Protecting Your Results",
          topic: "post-rhinoplasty sleeping recommendations"
        },
        {
          title: "Rhinoplasty for Teenagers: Special Considerations and Guidelines",
          topic: "teenage rhinoplasty appropriate timing"
        }
      ];
      
      // Expanded list of user experiences with more diversity
      const userExperiences = [
        // Success stories - women
        { age: "24", gender: "female", procedure: "closed", reason: "fixing a dorsal hump", outcome: "positive" },
        { age: "19", gender: "female", procedure: "tip plasty", reason: "refining a bulbous tip", outcome: "positive" },
        { age: "28", gender: "female", procedure: "ethnic", reason: "balancing facial features", outcome: "positive" },
        { age: "35", gender: "female", procedure: "revision", reason: "correcting previous surgery", outcome: "positive" },
        
        // Success stories - men
        { age: "32", gender: "male", procedure: "open", reason: "improving breathing", outcome: "positive" },
        { age: "27", gender: "male", procedure: "closed", reason: "straightening after sports injury", outcome: "positive" },
        { age: "41", gender: "male", procedure: "revision", reason: "refining previous work", outcome: "positive" },
        
        // Success stories - non-binary and other genders
        { age: "25", gender: "non-binary", procedure: "closed", reason: "achieving desired appearance", outcome: "positive" },
        { age: "31", gender: "transgender", procedure: "feminization", reason: "gender-affirming care", outcome: "positive" },
        
        // Mixed results
        { age: "26", gender: "female", procedure: "closed", reason: "fixing a deviated septum", outcome: "mixed" },
        { age: "33", gender: "male", procedure: "ethnic", reason: "maintaining ethnic features", outcome: "mixed" },
        { age: "22", gender: "female", procedure: "tip plasty", reason: "reducing nostril flare", outcome: "mixed" },
        
        // Challenging recoveries
        { age: "30", gender: "female", procedure: "open", reason: "correcting a dorsal hump", outcome: "challenging" },
        { age: "38", gender: "male", procedure: "revision", reason: "third attempt at correction", outcome: "challenging" },
        { age: "45", gender: "female", procedure: "open", reason: "age-related changes", outcome: "challenging" }
      ];

      const createdPosts = [];
      
      // Generate 2 informational posts with random selection
      for (let i = 0; i < 2; i++) {
        // Get a random topic that hasn't been used recently
        // Generate a random index between 0 and the topics length
        const randomIndex = Math.floor(Math.random() * informationalTopics.length);
        const topic = informationalTopics[randomIndex];
        console.log(`Generating informational post: ${topic.title}`);
        
        try {
          const generatedPost = await generatePost(
            "30", // Generic age
            "N/A", // No specific gender for informational posts
            "informational", // Mark as informational
            topic.topic, // Use the topic as the reason
            'educational', // Mark as educational content type
            topic.topic // Pass the topic for educational content
          );
          
          if (!generatedPost) {
            console.error(`Failed to generate informational post: ${topic.title}`);
            continue;
          }
          
          // Override the AI-generated title with our predefined one
          const post = await storage.createPost({
            userId: user.id,
            title: topic.title,
            content: generatedPost.content,
            imageUrl: null,
            isAiGenerated: true
          });
          
          // Add tags
          for (const tagName of [...generatedPost.tags, "educational"]) {
            let tag = await storage.getTagByName(tagName);
            
            if (!tag) {
              const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              tag = await storage.createTag({ name: tagName, color: randomColor });
            }
            
            await storage.createPostTag({ postId: post.id, tagId: tag.id });
          }
          
          const postWithTags = await storage.getPostWithTags(post.id);
          createdPosts.push(postWithTags);
          
          console.log(`Created informational post: ${topic.title}`);
        } catch (error) {
          console.error(`Error generating post "${topic.title}":`, error);
        }
        
        // Sleep for a moment to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate 2 user experiences with random selection
      for (let i = 0; i < 2; i++) {
        // Choose a random experience from the array
        const randomIndex = Math.floor(Math.random() * userExperiences.length);
        const exp = userExperiences[randomIndex];
        console.log(`Generating user experience: ${exp.age}-year-old ${exp.gender}, ${exp.procedure} rhinoplasty`);
        
        try {
          // Customize the prompt based on outcome
          let outcome = "";
          if (exp.outcome === "challenging") {
            outcome = "with complications and a difficult recovery";
          } else if (exp.outcome === "mixed") {
            outcome = "with some complications but eventual satisfaction";
          } else {
            outcome = "with great results and smooth recovery";
          }
          
          const generatedPost = await generatePost(
            exp.age,
            exp.gender,
            exp.procedure,
            `${exp.reason} ${outcome}`
          );
          
          if (!generatedPost) {
            console.error(`Failed to generate user experience post for ${exp.age}-year-old ${exp.gender}`);
            continue;
          }
          
          const post = await storage.createPost({
            userId: user.id,
            title: generatedPost.title,
            content: generatedPost.content,
            imageUrl: null,
            isAiGenerated: true
          });
          
          // Add tags
          for (const tagName of [...generatedPost.tags, exp.outcome]) {
            let tag = await storage.getTagByName(tagName);
            
            if (!tag) {
              const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              tag = await storage.createTag({ name: tagName, color: randomColor });
            }
            
            await storage.createPostTag({ postId: post.id, tagId: tag.id });
          }
          
          const postWithTags = await storage.getPostWithTags(post.id);
          createdPosts.push(postWithTags);
          
          console.log(`Created user experience post: ${generatedPost.title}`);
        } catch (error) {
          console.error(`Error generating user experience:`, error);
        }
        
        // Sleep for a moment to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return res.status(201).json({ 
        message: `Successfully generated ${createdPosts.length} posts`, 
        posts: createdPosts 
      });
    } catch (error) {
      console.error("Error in batch generation:", error);
      return res.status(500).json({ message: "Error generating batch content" });
    }
  });

  // Setup scheduled post generation
  let scheduledTask: cron.ScheduledTask | null = null;

  function setupScheduledTask() {
    // Cancel existing task if any
    if (scheduledTask) {
      scheduledTask.stop();
    }

    // Skip if not enabled
    if (!global.postSchedule || !global.postSchedule.enabled) {
      return;
    }

    // Setup new cron job
    scheduledTask = cron.schedule(global.postSchedule.cronExpression, async () => {
      try {
        // Find an admin user
        const users = await storage.getUsers();
        const adminUser = users.find(user => user.isAdmin);

        if (!adminUser) {
          console.error("No admin user found for scheduled post generation");
          return;
        }

        // Generate random parameters for the post
        const ages = ["18", "21", "24", "27", "30", "35", "40", "45"];
        const genders = ["male", "female", "non-binary"];
        const procedures = ["closed", "open", "ethnic", "revision", "tip plasty"];
        const reasons = [
          "fixing a deviated septum", 
          "correcting a dorsal hump", 
          "refining a bulbous tip",
          "improving breathing",
          "fixing a previous surgery",
          "reshaping after injury",
          "ethnic refinement"
        ];

        const randomAge = ages[Math.floor(Math.random() * ages.length)];
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        const randomProcedure = procedures[Math.floor(Math.random() * procedures.length)];
        const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

        // Generate post
        const generatedPost = await generatePost(randomAge, randomGender, randomProcedure, randomReason);

        if (!generatedPost) {
          console.error("Failed to generate scheduled post");
          return;
        }

        // Create post in database
        const post = await storage.createPost({
          userId: adminUser.id,
          title: generatedPost.title,
          content: generatedPost.content,
          imageUrl: null,
          isAiGenerated: true
        });

        // Add tags
        for (const tagName of generatedPost.tags) {
          // Find or create tag
          let tag = await storage.getTagByName(tagName);
          
          if (!tag) {
            // Create a random color for the tag
            const colors = ["blue", "green", "red", "yellow", "purple", "pink", "indigo", "gray", "orange"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            tag = await storage.createTag({ name: tagName, color: randomColor });
          }
          
          // Create post-tag association
          await storage.createPostTag({ postId: post.id, tagId: tag.id });
        }

        console.log(`Scheduled post generated: ${generatedPost.title}`);
      } catch (error) {
        console.error("Error in scheduled post generation:", error);
      }
    });
  }

  // Setup initial task if needed
  setupScheduledTask();

  // Watch for changes to the schedule
  setInterval(() => {
    setupScheduledTask();
  }, 60000); // Check every minute

  // ============= User Dashboard Routes ============= //

  // Get user dashboard stats and activity
  app.get("/api/user/dashboard", authenticate, async (req, res) => {
    try {
      // Get user's posts
      const posts = await storage.getPosts();
      const userPosts = posts.filter(post => post.userId === req.user.id);
      
      // Get user's comments
      const allComments = [];
      for (const post of posts) {
        const comments = await storage.getComments(post.id);
        allComments.push(...comments);
      }
      const userComments = allComments.filter(comment => comment.userId === req.user.id);
      
      // Calculate trust score based on activity and engagement
      const postCount = userPosts.length;
      const commentCount = userComments.length;
      const upvotesReceived = userPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
      
      // Simple algorithm for trust score (0-100)
      // Base: 15 points for new users
      // +5 points per post (up to 25 points)
      // +2 points per comment (up to 20 points)
      // +1 point per 3 upvotes received (up to 40 points)
      const trustScore = Math.min(100, 
        15 + 
        Math.min(25, postCount * 5) + 
        Math.min(20, commentCount * 2) + 
        Math.min(40, Math.floor(upvotesReceived / 3))
      );
      
      // Get recent user activity (posts, comments, votes)
      const recentActivity = [
        ...userPosts.map(post => ({
          id: post.id,
          type: 'post',
          title: post.title,
          createdAt: post.createdAt
        })),
        ...userComments.map(comment => ({
          id: comment.id,
          type: 'comment',
          postId: comment.postId,
          title: posts.find(p => p.id === comment.postId)?.title || 'Unknown Post',
          createdAt: comment.createdAt
        }))
      ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Get most recent 5 activities
      
      // User stats
      const stats = {
        totalPosts: postCount,
        totalComments: commentCount,
        pendingPosts: userPosts.filter(post => !post.approved && !post.rejected).length,
        publishedPosts: userPosts.filter(post => post.approved).length,
        rejectedPosts: userPosts.filter(post => post.rejected).length,
        totalUpvotes: upvotesReceived,
        trustScore
      };
      
      res.status(200).json({
        stats,
        recentActivity
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  // Get user posts with stats
  app.get("/api/user/posts", authenticate, async (req, res) => {
    try {
      // Get user's posts with tags
      const allPosts = await storage.getPostsWithTags();
      const userPosts = allPosts.filter(post => post.userId === req.user.id);
      
      // Get comments for each post to count them
      const postsWithCounts = await Promise.all(userPosts.map(async post => {
        const comments = await storage.getComments(post.id);
        
        return {
          ...post,
          status: post.approved ? 'published' : post.rejected ? 'rejected' : 'pending',
          commentCount: comments.length,
          rejectionReason: post.rejected ? (post.rejectionReason || "Content not approved") : null
        };
      }));
      
      // Calculate post stats
      const stats = {
        total: userPosts.length,
        published: userPosts.filter(post => post.approved).length,
        pending: userPosts.filter(post => !post.approved && !post.rejected).length,
        rejected: userPosts.filter(post => post.rejected).length
      };
      
      res.status(200).json({
        posts: postsWithCounts,
        stats
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });
  
  // Get user comments with stats
  app.get("/api/user/comments", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get all posts
      const allPosts = await storage.getPosts();
      
      // Create a map for quick post title lookup
      const postMap = new Map();
      for (const post of allPosts) {
        postMap.set(post.id, post.title);
      }
      
      // Get all comments (this is a simplified approach - in a real app we would query by userId)
      const allComments = [];
      for (const post of allPosts) {
        const postComments = await storage.getComments(post.id);
        // Filter for comments by this user
        const userComments = postComments.filter(comment => comment.userId === userId);
        
        // Add post title to each comment
        for (const comment of userComments) {
          allComments.push({
            ...comment,
            postTitle: postMap.get(comment.postId) || "Unknown Post",
            // Default all comments to published if status doesn't exist 
            status: comment.status || "published"
          });
        }
      }
      
      // Calculate statistics
      const stats = {
        total: allComments.length,
        published: allComments.filter(c => c.status === "published").length,
        removed: allComments.filter(c => c.status === "removed").length,
        flagged: allComments.filter(c => c.status === "flagged").length
      };
      
      res.status(200).json({ 
        comments: allComments,
        stats
      });
    } catch (error) {
      console.error("Error fetching user comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Debugging endpoint to see all users (temporary)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Return basic info without passwords
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        isAdmin: u.isAdmin,
        email: u.email
      }));
      res.status(200).json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get user profile settings
  app.get("/api/user/settings", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Default settings if not present
      const settings = {
        displayName: user.displayName || user.username,
        bio: user.bio || "",
        isProfilePublic: true,
        emailNotifications: true,
        showActivityFeed: true,
        trustScore: 0, // Will be calculated in the dashboard endpoint
        social: {
          twitter: "",
          instagram: "",
          website: ""
        }
      };
      
      res.status(200).json({
        ...user,
        settings
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", authenticate, async (req, res) => {
    try {
      const user = await storage.updateUser(req.user.id, {
        displayName: req.body.displayName,
        bio: req.body.bio,
        avatarUrl: req.body.avatarUrl
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Update user notification settings
  app.patch("/api/user/settings/notifications", authenticate, async (req, res) => {
    try {
      // In a real implementation, we would save these to the database
      // For now, we'll just return success
      res.status(200).json({ 
        message: "Notification settings updated successfully",
        settings: req.body
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });
  
  // Update user privacy settings
  app.patch("/api/user/settings/privacy", authenticate, async (req, res) => {
    try {
      // In a real implementation, we would save these to the database
      // For now, we'll just return success
      res.status(200).json({ 
        message: "Privacy settings updated successfully",
        settings: req.body
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });
  
  // Apply to become a contributor
  app.post("/api/user/contributor-application", authenticate, async (req, res) => {
    try {
      const { contributorType, motivation, experience, portfolioLinks } = req.body;
      
      // In a real implementation, we would save the application to the database
      // and notify admins for review
      
      // For now, we'll just return success
      res.status(200).json({ 
        message: "Application submitted successfully. Our team will review your application and get back to you soon.",
        applicationStatus: "pending"
      });
    } catch (error) {
      console.error("Error submitting contributor application:", error);
      res.status(500).json({ message: "Failed to submit contributor application" });
    }
  });
  
  // Create new user post
  app.post("/api/user/posts", authenticate, async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id,
        createdAt: new Date(),
        isAiGenerated: false,
        reviewRequired: true, // User posts always require review
      });
      
      const post = await storage.createPost(postData);
      
      // Add tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tagId of req.body.tags) {
          const tag = await storage.getTag(tagId);
          
          if (tag) {
            // Create post-tag association
            await storage.createPostTag({ postId: post.id, tagId: tag.id });
          }
        }
      }
      
      res.status(201).json({
        ...post,
        message: "Post submitted successfully and is pending review."
      });
    } catch (error) {
      console.error("Error creating user post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Comments endpoint already defined above
  
  // Get user saved content
  app.get("/api/user/saved", authenticate, async (req, res) => {
    try {
      // Mock data for saved posts until we implement the saved posts feature
      const posts = await storage.getPostsWithTags();
      const mockSavedPosts = posts.slice(0, 5).map((post, index) => ({
        id: index + 1,
        postId: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        savedAt: new Date(Date.now() - (index * 86400000)).toISOString(), // Different days
        type: index % 2 === 0 ? 'post' : 'article',
        author: post.user,
        commentCount: Math.floor(Math.random() * 20),
        upvotes: post.upvotes,
        imageUrl: post.imageUrl,
        tags: post.tags
      }));
      
      // Stats
      const stats = {
        total: mockSavedPosts.length,
        posts: mockSavedPosts.filter(p => p.type === 'post').length,
        articles: mockSavedPosts.filter(p => p.type === 'article').length
      };
      
      res.status(200).json({
        savedPosts: mockSavedPosts,
        stats
      });
    } catch (error) {
      console.error("Error fetching saved content:", error);
      res.status(500).json({ message: "Failed to fetch saved content" });
    }
  });
  
  // Get user tags
  app.get("/api/user/tags", authenticate, async (req, res) => {
    try {
      // Get all tags
      const allTags = await storage.getTags();
      
      // Mock followed tags
      const followedTagIds = [1, 3, 5]; // Simulating user following some tags
      const followedTags = allTags
        .filter(tag => followedTagIds.includes(tag.id))
        .map((tag, index) => ({
          id: index + 1,
          tagId: tag.id,
          name: tag.name,
          color: tag.color,
          followedAt: new Date(Date.now() - (index * 86400000)).toISOString(),
          postCount: Math.floor(Math.random() * 50) + 10
        }));
      
      // Mock popular tags
      const popularTags = allTags
        .filter(tag => !followedTagIds.includes(tag.id))
        .map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          postCount: Math.floor(Math.random() * 100) + 20,
          isFollowed: false
        }));
      
      const stats = {
        totalFollowed: followedTags.length
      };
      
      res.status(200).json({
        followedTags,
        popularTags,
        stats
      });
    } catch (error) {
      console.error("Error fetching user tags:", error);
      res.status(500).json({ message: "Failed to fetch user tags" });
    }
  });
  
  // Follow tag
  app.post("/api/user/tags/:id/follow", authenticate, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tag = await storage.getTag(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      // We'll implement tag following in a future update
      // For now, just return success
      res.status(200).json({ message: "Tag followed successfully" });
    } catch (error) {
      console.error("Error following tag:", error);
      res.status(500).json({ message: "Failed to follow tag" });
    }
  });
  
  // Unfollow tag
  app.delete("/api/user/tags/:id/follow", authenticate, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tag = await storage.getTag(tagId);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      // We'll implement tag unfollowing in a future update
      // For now, just return success
      res.status(200).json({ message: "Tag unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing tag:", error);
      res.status(500).json({ message: "Failed to unfollow tag" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize with admin and superadmin users
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      password: "rhinoadmin123",
      email: "admin@rhinoplastyblogs.com",
      avatarUrl: null,
      role: "admin",
      isAdmin: true
    });
    console.log("Admin user created: admin/rhinoadmin123");
  }
  
  // Create superadmin user
  const superadminUser = await storage.getUserByUsername("superadmin");
  if (!superadminUser) {
    await storage.createUser({
      username: "superadmin",
      password: "super123",
      email: "superadmin@rhinoplastyblogs.com",
      avatarUrl: null,
      role: "superadmin",
      isAdmin: true
    });
    console.log("Superadmin user created: superadmin/super123");
  }
  
  // Create contributor (surgeon) user
  const surgeonUser = await storage.getUserByUsername("drsurgeon");
  if (!surgeonUser) {
    await storage.createUser({
      username: "drsurgeon",
      password: "surgeon123",
      email: "surgeon@rhinoplastyblogs.com",
      role: "contributor",
      contributorType: "surgeon",
      bio: "Board-certified rhinoplasty specialist with 15 years of experience.",
      avatarUrl: null
    });
    console.log("Surgeon contributor created: drsurgeon/surgeon123");
  }
  
  // Create regular user
  const regularUser = await storage.getUserByUsername("user");
  if (!regularUser) {
    await storage.createUser({
      username: "user",
      password: "user123",
      email: "user@rhinoplastyblogs.com",
      role: "user",
      avatarUrl: null
    });
    console.log("Regular user created: user/user123");
  }
  
  return httpServer;
}
