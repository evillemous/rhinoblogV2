// This script initializes our application with some test content
import { storage } from './server/storage.js';

async function initializeContent() {
  try {
    // Get admin user
    const admin = await storage.getUserByUsername('admin');
    if (!admin) {
      console.error('Admin user not found. Please restart the server first.');
      return;
    }
    
    console.log('Found admin user:', admin.username);
    
    // Create a sample post
    const post = await storage.createPost({
      title: "My Rhinoplasty Journey: One Month Update",
      content: "# My Rhinoplasty Journey\n\nJust had my one month follow-up and wanted to share my experience with rhinoplasty. The swelling has gone down significantly!",
      imageUrl: null,
      isAiGenerated: false,
      userId: admin.id
    });
    
    console.log('Created post:', post.title);
    
    // Add tags
    for (const tagName of ['recovery', '1month', 'closedrhinoplasty']) {
      let tag = await storage.getTagByName(tagName);
      if (!tag) {
        const colors = ["blue", "green", "red", "purple"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        tag = await storage.createTag({ name: tagName, color });
      }
      await storage.createPostTag({ postId: post.id, tagId: tag.id });
    }
    
    console.log('Added tags to post');
    
    // Create a comment
    await storage.createComment({
      userId: admin.id,
      postId: post.id,
      content: "This is a test comment on my own post!",
      parentId: null
    });
    
    console.log('Added comment to post');
    console.log('Done initializing content!');
    
  } catch (error) {
    console.error('Error initializing content:', error);
  }
}

initializeContent().catch(console.error);