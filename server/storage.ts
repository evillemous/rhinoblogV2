import {
  type User,
  type InsertUser,
  type Post,
  type InsertPost,
  type Tag,
  type InsertTag,
  type PostTag,
  type InsertPostTag,
  type Comment,
  type InsertComment,
  type Vote,
  type InsertVote,
  type PostWithTags,
  type CommentWithUser
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostWithTags(id: number): Promise<PostWithTags | undefined>;
  getPostsWithTags(limit?: number, offset?: number): Promise<PostWithTags[]>;
  updatePostVotes(id: number, upvote: boolean): Promise<Post | undefined>;

  // Tag operations
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  getTags(): Promise<Tag[]>;
  getPostTags(postId: number): Promise<Tag[]>;

  // PostTag operations
  createPostTag(postTag: InsertPostTag): Promise<PostTag>;
  deletePostTag(postId: number, tagId: number): Promise<boolean>;

  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  getComments(postId: number): Promise<Comment[]>;
  getCommentsWithUsers(postId: number): Promise<CommentWithUser[]>;
  updateCommentVotes(id: number, upvote: boolean): Promise<Comment | undefined>;

  // Vote operations
  getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, voteType: string): Promise<Vote | undefined>;
  deleteVote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private tags: Map<number, Tag>;
  private postTags: Map<number, PostTag>;
  private comments: Map<number, Comment>;
  private votes: Map<number, Vote>;
  
  private currentIds: {
    users: number;
    posts: number;
    tags: number;
    postTags: number;
    comments: number;
    votes: number;
  };

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.tags = new Map();
    this.postTags = new Map();
    this.comments = new Map();
    this.votes = new Map();
    
    this.currentIds = {
      users: 1,
      posts: 1,
      tags: 1,
      postTags: 1,
      comments: 1,
      votes: 1
    };
    
    // Initialize with some default tags
    this.seedTags();
  }

  private seedTags() {
    const defaultTags = [
      { name: 'closedrhinoplasty', color: 'blue' },
      { name: 'openrhinoplasty', color: 'indigo' },
      { name: 'recovery', color: 'green' },
      { name: 'day1', color: 'red' },
      { name: 'beforeafter', color: 'yellow' },
      { name: 'revision', color: 'red' },
      { name: 'guide', color: 'blue' },
      { name: 'tipplasty', color: 'gray' },
      { name: 'ethnicrhinoplasty', color: 'pink' },
      { name: 'surgeonadvice', color: 'blue' },
      { name: 'castremoval', color: 'orange' },
      { name: '1month', color: 'purple' },
    ];

    defaultTags.forEach(tag => {
      const id = this.currentIds.tags++;
      this.tags.set(id, { ...tag, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentIds.posts++;
    const now = new Date();
    const post: Post = { 
      ...insertPost, 
      id, 
      upvotes: 0, 
      downvotes: 0, 
      commentCount: 0,
      createdAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updatedFields: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updatedFields };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values());
    // Sort by createdAt descending
    const sortedPosts = allPosts.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    return sortedPosts.slice(offset, offset + limit);
  }

  async getPostWithTags(id: number): Promise<PostWithTags | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const tags = await this.getPostTags(id);
    const user = await this.getUser(post.userId);
    
    if (!user) return undefined;
    
    return { ...post, tags, user };
  }

  async getPostsWithTags(limit = 10, offset = 0): Promise<PostWithTags[]> {
    const posts = await this.getPosts(limit, offset);
    const postsWithTags: PostWithTags[] = [];
    
    for (const post of posts) {
      const tags = await this.getPostTags(post.id);
      const user = await this.getUser(post.userId);
      if (user) {
        postsWithTags.push({ ...post, tags, user });
      }
    }
    
    return postsWithTags;
  }

  async updatePostVotes(id: number, upvote: boolean): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    if (upvote) {
      post.upvotes += 1;
    } else {
      post.downvotes += 1;
    }
    
    this.posts.set(id, post);
    return post;
  }

  // Tag operations
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentIds.tags++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }

  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async getPostTags(postId: number): Promise<Tag[]> {
    const postTagEntries = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId);
    
    return Promise.all(
      postTagEntries.map(async pt => {
        const tag = await this.getTag(pt.tagId);
        return tag!;
      })
    ).then(tags => tags.filter(Boolean));
  }

  // PostTag operations
  async createPostTag(insertPostTag: InsertPostTag): Promise<PostTag> {
    const id = this.currentIds.postTags++;
    const postTag: PostTag = { ...insertPostTag, id };
    this.postTags.set(id, postTag);
    return postTag;
  }

  async deletePostTag(postId: number, tagId: number): Promise<boolean> {
    const postTagEntry = Array.from(this.postTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (!postTagEntry) return false;
    
    return this.postTags.delete(postTagEntry.id);
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comments++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      upvotes: 0, 
      downvotes: 0,
      createdAt: now 
    };
    this.comments.set(id, comment);
    
    // Update post comment count
    const post = await this.getPost(insertComment.postId);
    if (post) {
      post.commentCount += 1;
      this.posts.set(post.id, post);
    }
    
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    // Update post comment count
    const post = await this.getPost(comment.postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      this.posts.set(post.id, post);
    }
    
    return this.comments.delete(id);
  }

  async getComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommentsWithUsers(postId: number): Promise<CommentWithUser[]> {
    const comments = await this.getComments(postId);
    const commentsWithUsers: CommentWithUser[] = [];
    
    for (const comment of comments) {
      const user = await this.getUser(comment.userId);
      if (user) {
        if (!comment.parentId) {
          // This is a root comment
          const replies = comments
            .filter(c => c.parentId === comment.id)
            .map(c => ({ ...c, user: this.users.get(c.userId)! }));
            
          commentsWithUsers.push({ ...comment, user, replies });
        }
      }
    }
    
    return commentsWithUsers;
  }

  async updateCommentVotes(id: number, upvote: boolean): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    if (upvote) {
      comment.upvotes += 1;
    } else {
      comment.downvotes += 1;
    }
    
    this.comments.set(id, comment);
    return comment;
  }

  // Vote operations
  async getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => 
        vote.userId === userId && 
        (postId ? vote.postId === postId : true) &&
        (commentId ? vote.commentId === commentId : true)
    );
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentIds.votes++;
    const vote: Vote = { ...insertVote, id };
    this.votes.set(id, vote);
    return vote;
  }

  async updateVote(id: number, voteType: string): Promise<Vote | undefined> {
    const vote = this.votes.get(id);
    if (!vote) return undefined;
    
    vote.voteType = voteType;
    this.votes.set(id, vote);
    return vote;
  }

  async deleteVote(id: number): Promise<boolean> {
    return this.votes.delete(id);
  }
}

export const storage = new MemStorage();
