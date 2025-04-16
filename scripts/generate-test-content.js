const { storage } = require('../server/storage');
const { generatePost } = require('../server/openai');

async function generateTestPosts() {
  console.log('Starting test content generation...');
  
  // Get or create admin user
  let adminUser = await storage.getUserByUsername('admin');
  if (!adminUser) {
    adminUser = await storage.createUser({
      username: 'admin',
      password: 'rhinoadmin123',
      email: 'admin@rhinoplastyblogs.com',
      avatarUrl: null,
      isAdmin: true
    });
    console.log('Created admin user');
  }
  
  // Generate 1 sample post
  try {
    console.log('Generating sample post...');
    
    const testPost = {
      title: "My Rhinoplasty Journey: One Month Update",
      content: `
# My Rhinoplasty Journey: One Month Update

Hey everyone! I wanted to share my experience with rhinoplasty as I've just reached my one-month post-op milestone. I'm a 27-year-old female who had a closed rhinoplasty to fix a dorsal hump and slightly bulbous tip.

## Pre-Surgery Concerns

I had been self-conscious about my nose since high school. I have a prominent dorsal hump that I inherited from my dad's side of the family, and it always bothered me in profile photos. After years of considering it, I finally decided to take the plunge.

## Finding My Surgeon

I researched for months and had consultations with three different surgeons. I ultimately chose Dr. Wilson because of his extensive portfolio of natural-looking results and his specialization in preservation rhinoplasty techniques.

## Surgery Day

The procedure was done under general anesthesia and took about 2.5 hours. I woke up with a cast on my nose, internal splints, and some gauze under my nostrils. The pain wasn't as bad as I expected – more uncomfortable than painful.

## First Week Recovery

The first week was the hardest. Sleeping upright, breathing through my mouth, and dealing with the congestion was challenging. I had significant swelling and bruising under my eyes, which peaked around day 3-4.

Day 7 was cast removal day! It was exciting but also a bit nerve-wracking. When the cast came off, my nose was still very swollen, but I could already see the hump was gone!

## Weeks 2-4

The swelling started to go down gradually. By week 2, most of the bruising was gone, and I felt comfortable going out in public with some concealer. My tip was (and still is) quite stiff and swollen, which I'm told is normal.

By week 3, I could breathe much better through my nose, and the internal healing was progressing well. I started to get used to my new profile, though looking at myself straight-on still feels a bit strange sometimes.

## Current Status (1 Month Post-Op)

Now at the one-month mark, I'm really starting to see changes almost daily. The tip is still swollen and a bit upturned, but my surgeon says this will drop slightly over the next few months. The bridge looks smooth, and I'm so happy with my profile view!

I can perform most activities normally now, though I'm still avoiding anything that could potentially impact my nose. Sleep has gotten much better, and I'm almost back to normal in that regard.

## Advice for Others

If you're considering rhinoplasty, here are a few things I wish I'd known:

1. **Patience is key** - Healing takes time, and the final results won't be visible for months
2. **Arnica and bromelain** really helped with my bruising and swelling
3. **Stay hydrated** and keep a humidifier by your bed
4. **Don't panic about asymmetry** during early healing - swelling is rarely even on both sides
5. **Take more time off work** than you think you need if possible

## What's Next

I'll continue to document my journey as I hit the 3-month, 6-month, and 1-year marks. I've heard the most dramatic changes happen between months 3-6, so I'm looking forward to seeing how things continue to refine.

Feel free to ask me any questions about my experience so far!
      `,
      imageUrl: null,
      isAiGenerated: false,
      userId: adminUser.id
    };
    
    // Create the post
    const post = await storage.createPost(testPost);
    console.log('Created sample post:', post.title);
    
    // Add tags to the post
    const tagNames = ['recovery', 'closedrhinoplasty', '1month', 'beforeafter'];
    for (const tagName of tagNames) {
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
    
    console.log('Added tags to post');
    
    // Create a sample comment
    const comment = await storage.createComment({
      userId: adminUser.id,
      postId: post.id,
      content: "This is a great update! I'm going in for my rhinoplasty next month. Did you have any trouble breathing during the first week?",
      parentId: null
    });
    
    console.log('Added comment to post');
    
  } catch (error) {
    console.error('Error generating test content:', error);
  }
  
  console.log('Test content generation complete!');
}

// Run the function
generateTestPosts().catch(console.error);