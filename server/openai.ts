import OpenAI from "openai";
import { openaiClient } from "./index";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface GeneratedPost {
  title: string;
  content: string;
  tags: string[];
}

export async function generateCustomContent(
  customPrompt: string,
  contentType: 'personal' | 'educational' = 'educational'
): Promise<GeneratedPost | null> {
  try {
    if (!openaiClient) {
      console.error("OpenAI client is not initialized");
      throw new Error("OpenAI client is not initialized");
    }

    // Create a comprehensive prompt that ensures the response is detailed enough (at least 1200 words)
    const prompt = `Create a comprehensive, well-structured article about rhinoplasty based on the following request:
    
${customPrompt}

Important requirements:
1. The article must be AT LEAST 1200 words in length
2. Write it in a ${contentType === 'educational' ? 'professional, expert tone' : 'personal, conversational Reddit-style tone'}
3. Include proper markdown formatting with headings (##), subheadings (###), and lists
4. Include at least 5-7 distinct sections with headings
5. For educational content: include medical terminology, evidence-based explanations, and professional recommendations
6. For personal stories: include emotional journey, specific timeline details, and personal reflections
7. End with a conclusion summarizing key points

Format the response as a JSON object with the following structure:
{
  "title": "A descriptive, engaging title for this article",
  "content": "The full article content with markdown formatting (at least 1200 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] - array of 5 relevant tags based on the content
}`;

    console.log(`Sending request to OpenAI to generate custom ${contentType} content...`);
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000  // Increased token limit to accommodate longer articles
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("Empty response from OpenAI");
      return null;
    }

    try {
      const parsedResponse = JSON.parse(content);
      
      // Verify the content meets minimum word count (approximately 1200 words ≈ 6000-7000 characters)
      const wordCount = parsedResponse.content.split(/\s+/).length;
      if (wordCount < 1000) {  // A bit of buffer below 1200 to account for different counting methods
        console.error(`Generated content too short: ${wordCount} words`);
        return null;
      }
      
      return {
        title: parsedResponse.title,
        content: parsedResponse.content,
        tags: parsedResponse.tags.map((tag: string) => tag.replace('#', '').toLowerCase())
      };
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error generating custom content with OpenAI:", error);
    return null;
  }
}

export async function generatePost(
  age: string,
  gender: string,
  procedure: string,
  reason: string,
  contentType: 'personal' | 'educational' = 'personal',
  topic?: string
): Promise<GeneratedPost | null> {
  try {
    if (!openaiClient) {
      console.error("OpenAI client is not initialized");
      throw new Error("OpenAI client is not initialized");
    }

    let prompt = '';
    
    if (contentType === 'educational') {
      // Educational/informational content written by an expert
      prompt = `Write an expert, educational article about rhinoplasty on the topic: "${topic}". 
      
This should be written from a medical expert's perspective (plastic surgeon or medical professional), not as a personal story. Include factual information, medical terminology where appropriate, and evidence-based explanations. The tone should be professional, authoritative, and informative.

Include the following sections:
- Introduction explaining the topic's importance
- Detailed medical information with proper terminology
- Evidence-based explanations and statistics where relevant
- Professional recommendations and considerations
- Structured with clear headings and subheadings
- Conclusion with key takeaways

Format the response as a JSON object with the following structure:
{
  "title": "A professional, informative title for this educational article",
  "content": "The full article content with markdown formatting, including proper section headers, medical terminology, and educational content",
  "tags": ["tag1", "tag2", "tag3"] - array of 3-5 relevant medical/educational tags based on the content
}`;
    } else {
      // Personal story/experience content
      prompt = `Write a personal rhinoplasty story in the style of a Reddit post. The narrator is a ${age}-year-old ${gender} who got ${procedure} rhinoplasty due to ${reason}. They describe the whole journey: research, consult, surgery day, recovery, and how they feel now. Write in an honest, relatable tone like someone posting on r/PlasticSurgery. Add a mini FAQ, bolded section headers, and tag suggestions. 

Format the response as a JSON object with the following structure:
{
  "title": "A catchy, Reddit-style title - make it emotional and clickbaity",
  "content": "The full post content with markdown formatting, including section headers, mini FAQ, and conclusion with 3 takeaways",
  "tags": ["tag1", "tag2", "tag3"] - array of 3-5 relevant hashtags based on the content
}`;
    }

    console.log(`Sending request to OpenAI to generate ${contentType === 'educational' ? 'educational article' : 'rhinoplasty story'}...`);
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: contentType === 'educational' ? 2000 : 1500
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("Empty response from OpenAI");
      return null;
    }

    try {
      const parsedResponse = JSON.parse(content);
      return {
        title: parsedResponse.title,
        content: parsedResponse.content,
        tags: parsedResponse.tags.map((tag: string) => tag.replace('#', '').toLowerCase())
      };
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error generating post with OpenAI:", error);
    return null;
  }
}
