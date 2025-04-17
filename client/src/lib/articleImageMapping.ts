// This file maps article tags/keywords to appropriate images

import { isUnsplashConfigured, getImageByTopic } from './unsplashApi';

type ArticleImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ArticleImageMapping = {
  [key: string]: ArticleImage;
};

export const articleImages: ArticleImageMapping = {
  // By tag/category - Using SVG patterns to ensure they always load
  "beforeafter": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EBefore and After%3C/text%3E%3C/svg%3E",
    alt: "Before and after rhinoplasty results comparison",
    caption: "Typical before and after changes from rhinoplasty"
  },
  "recovery": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERecovery Timeline%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty recovery timeline",
    caption: "Timeline showing typical rhinoplasty recovery milestones"
  },
  "types": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EProcedure Types%3C/text%3E%3C/svg%3E",
    alt: "Different types of rhinoplasty procedures",
    caption: "Overview of rhinoplasty procedure types"
  },
  "cost": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ECost Factors%3C/text%3E%3C/svg%3E",
    alt: "Cost factors for rhinoplasty procedures",
    caption: "Factors affecting rhinoplasty procedure costs"
  },
  "consultation": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EMedical Consultation%3C/text%3E%3C/svg%3E",
    alt: "Medical consultation for rhinoplasty",
    caption: "What to expect during your rhinoplasty consultation"
  },
  
  // By keywords in title
  "before": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EBefore and After Results%3C/text%3E%3C/svg%3E",
    alt: "Before and after rhinoplasty results",
    caption: "Rhinoplasty results visualization"
  },
  "after": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERhinoplasty Results%3C/text%3E%3C/svg%3E",
    alt: "Before and after rhinoplasty comparison",
    caption: "Visual changes from rhinoplasty procedure"
  },
  "recover": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERecovery Process%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty recovery process",
    caption: "Recovery timeline after rhinoplasty surgery"
  },
  "healing": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EHealing Process%3C/text%3E%3C/svg%3E",
    alt: "Healing process after rhinoplasty",
    caption: "Timeline of healing after rhinoplasty procedure"
  },
  "type": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EProcedure Types%3C/text%3E%3C/svg%3E",
    alt: "Types of rhinoplasty procedures",
    caption: "Overview of different rhinoplasty approaches"
  },
  "procedure": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EProcedure Options%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty procedure options",
    caption: "Different approaches to rhinoplasty surgery"
  },
  "costs": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EProcedure Costs%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty procedure costs",
    caption: "Understanding rhinoplasty pricing factors"
  },
  "price": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EPricing Factors%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty pricing factors",
    caption: "Factors that determine rhinoplasty prices"
  },
  "consult": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERhinoplasty Consultation%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty consultation process",
    caption: "What happens during a rhinoplasty consultation"
  },
  "doctor": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EDoctor Consultation%3C/text%3E%3C/svg%3E",
    alt: "Doctor consultation for rhinoplasty",
    caption: "Medical consultation for rhinoplasty procedure"
  },
  "faq": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3EFrequently Asked Questions%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty FAQs",
    caption: "Common questions about rhinoplasty"
  },
  "guide": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERhinoplasty Guide%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty guide",
    caption: "Comprehensive guide to rhinoplasty"
  },
  "explained": {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231A2E3B'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERhinoplasty Explained%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty explained",
    caption: "Detailed explanation of rhinoplasty"
  }
};

/**
 * Gets the most appropriate image for an article based on its title and tags
 */
export function getArticleImage(title: string, tags: string[]): ArticleImage {
  // Default image if no match is found
  const defaultImage: ArticleImage = {
    src: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4884A'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3ERhinoplasty Information%3C/text%3E%3C/svg%3E",
    alt: "Rhinoplasty informational image",
    caption: "Educational content about rhinoplasty procedures"
  };
  
  // Check tags first (they're more specific)
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      
      // Direct tag matches
      if (articleImages[tagLower]) {
        return articleImages[tagLower];
      }
      
      // Partial tag matches
      for (const key of Object.keys(articleImages)) {
        if (tagLower.includes(key)) {
          return articleImages[key];
        }
      }
    }
  }
  
  // Check title for keywords
  if (title) {
    const titleLower = title.toLowerCase();
    
    for (const key of Object.keys(articleImages)) {
      if (titleLower.includes(key)) {
        return articleImages[key];
      }
    }
  }
  
  // If no match, return default image
  return defaultImage;
}

/**
 * Gets an image from Unsplash for a specific article topic if configured,
 * otherwise falls back to the SVG placeholder images
 */
export async function getUnsplashImageForArticle(title: string, tags: string[]): Promise<ArticleImage> {
  // Return the SVG placeholder if Unsplash is not configured
  if (!isUnsplashConfigured()) {
    return getArticleImage(title, tags);
  }
  
  // Try to find a matching tag or keyword to search for
  let searchTerm = '';
  
  // Check tags first
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (Object.keys(articleImages).includes(tag.toLowerCase())) {
        searchTerm = tag.toLowerCase();
        break;
      }
    }
  }
  
  // If no tag found, check title for keywords
  if (!searchTerm && title) {
    const titleLower = title.toLowerCase();
    for (const key of Object.keys(articleImages)) {
      if (titleLower.includes(key)) {
        searchTerm = key;
        break;
      }
    }
  }
  
  // If we still don't have a search term, use the first tag or a default
  if (!searchTerm) {
    searchTerm = tags && tags.length > 0 
      ? tags[0].toLowerCase() 
      : 'rhinoplasty';
  }
  
  try {
    // Try to get an image from Unsplash
    const unsplashImage = await getImageByTopic(searchTerm);
    
    if (unsplashImage) {
      return {
        src: unsplashImage.urls.regular,
        alt: unsplashImage.alt_description || `${searchTerm} image`,
        caption: `Photo by ${unsplashImage.user.name} on Unsplash`
      };
    }
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
  }
  
  // Fall back to the SVG image if Unsplash image retrieval fails
  return getArticleImage(title, tags);
}