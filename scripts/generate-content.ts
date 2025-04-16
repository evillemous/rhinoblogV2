import { storage } from "../server/storage";
import { generatePost } from "../server/openai";

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
  },
  {
    title: "Functional vs. Cosmetic Rhinoplasty: Understanding the Differences",
    topic: "comparing functional and cosmetic nose jobs"
  },
  {
    title: "Rhinoplasty and Breathing Issues: How Surgery Can Help",
    topic: "fixing breathing problems with rhinoplasty"
  },
  {
    title: "Revision Rhinoplasty: What to Know If You Need a Second Surgery",
    topic: "secondary rhinoplasty surgery considerations"
  },
  {
    title: "Ethnic Rhinoplasty: Preserving Heritage While Making Changes",
    topic: "ethnic-specific rhinoplasty techniques"
  },
  {
    title: "Non-Surgical Rhinoplasty: Pros, Cons, and Limitations",
    topic: "liquid rhinoplasty alternatives"
  }
];

// User experience parameters for diverse stories
const userExperiences = [
  // Success stories
  { age: "24", gender: "female", procedure: "closed", reason: "fixing a dorsal hump", outcome: "positive" },
  { age: "32", gender: "male", procedure: "open", reason: "improving breathing", outcome: "positive" },
  { age: "19", gender: "female", procedure: "tip plasty", reason: "refining a bulbous tip", outcome: "positive" },
  { age: "41", gender: "female", procedure: "revision", reason: "fixing a previous surgery", outcome: "positive" },
  { age: "28", gender: "non-binary", procedure: "ethnic", reason: "ethnic refinement", outcome: "positive" },
  
  // Mixed results
  { age: "26", gender: "female", procedure: "closed", reason: "fixing a deviated septum", outcome: "mixed" },
  { age: "37", gender: "male", procedure: "revision", reason: "reshaping after injury", outcome: "mixed" },
  { age: "22", gender: "female", procedure: "open", reason: "correcting a dorsal hump", outcome: "mixed" },
  
  // Challenging recoveries
  { age: "30", gender: "female", procedure: "open", reason: "correcting a dorsal hump", outcome: "challenging" },
  { age: "45", gender: "male", procedure: "revision", reason: "fixing a previous surgery", outcome: "challenging" },

  // Additional stories for variety
  { age: "27", gender: "female", procedure: "ethnic", reason: "ethnic refinement", outcome: "positive" },
  { age: "33", gender: "male", procedure: "closed", reason: "reshaping after injury", outcome: "positive" },
  { age: "21", gender: "female", procedure: "tip plasty", reason: "refining a bulbous tip", outcome: "positive" },
  { age: "35", gender: "female", procedure: "revision", reason: "fixing a previous surgery", outcome: "mixed" },
  { age: "29", gender: "non-binary", procedure: "open", reason: "improving breathing", outcome: "positive" }
];

async function generateContentFromTopics() {
  try {
    console.log("Finding admin user...");
    const users = await storage.getUsers();
    const adminUser = users.find(user => user.isAdmin);

    if (!adminUser) {
      console.error("No admin user found for generating posts");
      return;
    }

    console.log(`Admin user found: ${adminUser.username}`);
    console.log("Starting to generate informational posts...");

    // Generate informational posts
    for (let i = 0; i < informationalTopics.length; i++) {
      const topic = informationalTopics[i];
      console.log(`Generating post ${i+1}/${informationalTopics.length}: ${topic.title}`);
      
      try {
        const generatedPost = await generatePost(
          "30", // Generic age
          "N/A", // No specific gender for informational posts
          "informational", // Mark as informational
          topic.topic // Use the topic as the reason
        );
        
        if (!generatedPost) {
          console.error(`Failed to generate informational post: ${topic.title}`);
          continue;
        }
        
        // Override the AI-generated title with our predefined one
        const post = await storage.createPost({
          userId: adminUser.id,
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
        
        console.log(`Created informational post: ${topic.title}`);
      } catch (error) {
        console.error(`Error generating post "${topic.title}":`, error);
      }
      
      // Sleep for a moment to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("Starting to generate user experience posts...");
    
    // Generate user experiences
    for (let i = 0; i < userExperiences.length; i++) {
      const exp = userExperiences[i];
      console.log(`Generating user experience ${i+1}/${userExperiences.length}: ${exp.age}-year-old ${exp.gender}, ${exp.procedure} rhinoplasty`);
      
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
          userId: adminUser.id,
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
        
        console.log(`Created user experience post: ${generatedPost.title}`);
      } catch (error) {
        console.error(`Error generating user experience:`, error);
      }
      
      // Sleep for a moment to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("Content generation complete!");
    
  } catch (error) {
    console.error("Error in content generation:", error);
  }
}

// Execute the content generation
generateContentFromTopics();