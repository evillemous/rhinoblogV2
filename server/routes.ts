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
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
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
      const postData = insertPostSchema.parse(req.body);
      
      // Set user ID from authenticated user
      postData.userId = req.user.id;
      
      // Create post
      const post = await storage.createPost(postData);
      
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Error creating post" });
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
  
  app.get("/api/admin/schedule", authenticate, isAdmin, async (req, res) => {
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
  app.get("/api/admin/openai-status", authenticate, isAdmin, async (req, res) => {
    try {
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
      return res.status(500).json({ message: "Error checking OpenAI API status" });
    }
  });

  app.post("/api/admin/test-openai", authenticate, isAdmin, async (req, res) => {
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
  app.post("/api/admin/generate-custom", authenticate, isAdmin, async (req, res) => {
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

  app.post("/api/admin/update-openai-key", authenticate, isAdmin, async (req, res) => {
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

  app.post("/api/admin/generate-batch", authenticate, isAdmin, async (req, res) => {
    try {
      // Get admin user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create informational post topics
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
        }
      ];
      
      // User experience parameters for diverse stories
      const userExperiences = [
        // Success stories
        { age: "24", gender: "female", procedure: "closed", reason: "fixing a dorsal hump", outcome: "positive" },
        { age: "32", gender: "male", procedure: "open", reason: "improving breathing", outcome: "positive" },
        { age: "19", gender: "female", procedure: "tip plasty", reason: "refining a bulbous tip", outcome: "positive" },
        
        // Mixed results
        { age: "26", gender: "female", procedure: "closed", reason: "fixing a deviated septum", outcome: "mixed" },
        
        // Challenging recoveries
        { age: "30", gender: "female", procedure: "open", reason: "correcting a dorsal hump", outcome: "challenging" }
      ];

      const createdPosts = [];
      
      // Generate 2 informational posts
      for (let i = 0; i < 2; i++) {
        const topic = informationalTopics[i];
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
      
      // Generate 2 user experiences
      for (let i = 0; i < 2; i++) {
        const exp = userExperiences[i];
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize with an admin user
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      password: "rhinoadmin123",
      email: "admin@rhinoplastyblogs.com",
      avatarUrl: null,
      isAdmin: true
    });
    console.log("Admin user created: admin/rhinoadmin123");
  }
  
  return httpServer;
}
