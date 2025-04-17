// This file maps article tags/keywords to appropriate images

type ArticleImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ArticleImageMapping = {
  [key: string]: ArticleImage;
};

export const articleImages: ArticleImageMapping = {
  // By tag/category - Using placeholder image URLs
  "beforeafter": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Before+and+After+Rhinoplasty",
    alt: "Before and after rhinoplasty results comparison",
    caption: "Typical before and after changes from rhinoplasty"
  },
  "recovery": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Rhinoplasty+Recovery+Timeline",
    alt: "Rhinoplasty recovery timeline",
    caption: "Timeline showing typical rhinoplasty recovery milestones"
  },
  "types": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Types+of+Rhinoplasty",
    alt: "Different types of rhinoplasty procedures",
    caption: "Overview of rhinoplasty procedure types"
  },
  "cost": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Rhinoplasty+Cost+Factors",
    alt: "Cost factors for rhinoplasty procedures",
    caption: "Factors affecting rhinoplasty procedure costs"
  },
  "consultation": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Medical+Consultation",
    alt: "Medical consultation for rhinoplasty",
    caption: "What to expect during your rhinoplasty consultation"
  },
  
  // By keywords in title
  "before": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Before+and+After+Results",
    alt: "Before and after rhinoplasty results",
    caption: "Rhinoplasty results visualization"
  },
  "after": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Rhinoplasty+Results",
    alt: "Before and after rhinoplasty comparison",
    caption: "Visual changes from rhinoplasty procedure"
  },
  "recover": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Rhinoplasty+Recovery",
    alt: "Rhinoplasty recovery process",
    caption: "Recovery timeline after rhinoplasty surgery"
  },
  "healing": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Rhinoplasty+Healing",
    alt: "Healing process after rhinoplasty",
    caption: "Timeline of healing after rhinoplasty procedure"
  },
  "type": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Rhinoplasty+Procedures",
    alt: "Types of rhinoplasty procedures",
    caption: "Overview of different rhinoplasty approaches"
  },
  "procedure": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Procedure+Options",
    alt: "Rhinoplasty procedure options",
    caption: "Different approaches to rhinoplasty surgery"
  },
  "costs": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Procedure+Costs",
    alt: "Rhinoplasty procedure costs",
    caption: "Understanding rhinoplasty pricing factors"
  },
  "price": {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Pricing+Factors",
    alt: "Rhinoplasty pricing factors",
    caption: "Factors that determine rhinoplasty prices"
  },
  "consult": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Rhinoplasty+Consultation",
    alt: "Rhinoplasty consultation process",
    caption: "What happens during a rhinoplasty consultation"
  },
  "doctor": {
    src: "https://via.placeholder.com/600x400/F4884A/FFFFFF?text=Doctor+Consultation",
    alt: "Doctor consultation for rhinoplasty",
    caption: "Medical consultation for rhinoplasty procedure"
  }
};

/**
 * Gets the most appropriate image for an article based on its title and tags
 */
export function getArticleImage(title: string, tags: string[]): ArticleImage {
  // Default image if no match is found
  const defaultImage: ArticleImage = {
    src: "https://via.placeholder.com/600x400/1A2E3B/FFFFFF?text=Rhinoplasty+Information",
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