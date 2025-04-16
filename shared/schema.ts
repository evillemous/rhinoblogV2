import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
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
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  title: true,
  content: true,
  imageUrl: true,
  isAiGenerated: true,
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
