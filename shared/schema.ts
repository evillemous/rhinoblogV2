import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Roles
export const UserRole = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Contributor Types
export const ContributorType = {
  SURGEON: 'surgeon',
  PATIENT: 'patient',
  INFLUENCER: 'influencer',
  BLOGGER: 'blogger',
} as const;

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default(UserRole.USER),
  contributorType: text("contributor_type"),
  verified: boolean("verified").default(false),
  bio: text("bio"),
  trustScore: integer("trust_score").default(0),
  isAdmin: boolean("is_admin").default(false), // Keeping for backward compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
  role: true,
  contributorType: true,
  verified: true,
  bio: true,
  trustScore: true,
  isAdmin: true,
});

// Post Schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  topicId: integer("topic_id"),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  title: true,
  content: true,
  imageUrl: true,
  isAiGenerated: true,
  topicId: true,
});

// Tags Schema
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color"),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  color: true,
});

// Post Tags Schema (Many-to-Many)
export const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertPostTagSchema = createInsertSchema(postTags).pick({
  postId: true,
  tagId: true,
});

// Comments Schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  parentId: integer("parent_id"),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  userId: true,
  content: true,
  parentId: true,
});

// Vote Schema (for tracking user votes)
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id"),
  commentId: integer("comment_id"),
  voteType: text("vote_type").notNull(), // 'upvote' or 'downvote'
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  userId: true,
  postId: true,
  commentId: true,
  voteType: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = z.infer<typeof insertPostTagSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Extended Types
export type PostWithTags = Post & {
  tags: Tag[];
  user: User;
};

export type CommentWithUser = Comment & {
  user: User;
  replies?: CommentWithUser[];
};

// Topic Schema
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  sortOrder: integer("sort_order").default(0),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  name: true,
  icon: true,
  description: true,
  slug: true,
  sortOrder: true,
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
