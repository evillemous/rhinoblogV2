import OpenAI from "openai";
import { openaiClient } from "./index";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface GeneratedPost {
  title: string;
  content: string;
  tags: string[];
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
