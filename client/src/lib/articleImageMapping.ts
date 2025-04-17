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
  // By tag/category - Using direct image URLs for reliability
  "beforeafter": {
    src: "https://i.imgur.com/Y0PX7Kq.jpg",
    alt: "Before and after rhinoplasty results comparison",
    caption: "Typical before and after changes from rhinoplasty"
  },
  "recovery": {
    src: "https://i.imgur.com/V9LlJgT.jpg",
    alt: "Rhinoplasty recovery timeline",
    caption: "Timeline showing typical rhinoplasty recovery milestones"
  },
  "types": {
    src: "https://i.imgur.com/xdpGtZ9.jpg",
    alt: "Different types of rhinoplasty procedures",
    caption: "Overview of rhinoplasty procedure types"
  },
  "cost": {
    src: "https://i.imgur.com/JwqjnIS.jpg",
    alt: "Cost factors for rhinoplasty procedures",
    caption: "Factors affecting rhinoplasty procedure costs"
  },
  "consultation": {
    src: "https://i.imgur.com/ZC4Ow6W.jpg",
    alt: "Medical consultation for rhinoplasty",
    caption: "What to expect during your rhinoplasty consultation"
  },
  
  // By keywords in title
  "before": {
    src: "https://i.imgur.com/Y0PX7Kq.jpg",
    alt: "Before and after rhinoplasty results",
    caption: "Rhinoplasty results visualization"
  },
  "after": {
    src: "https://i.imgur.com/Y0PX7Kq.jpg",
    alt: "Before and after rhinoplasty comparison",
    caption: "Visual changes from rhinoplasty procedure"
  },
  "recover": {
    src: "https://i.imgur.com/V9LlJgT.jpg",
    alt: "Rhinoplasty recovery process",
    caption: "Recovery timeline after rhinoplasty surgery"
  },
  "healing": {
    src: "https://i.imgur.com/V9LlJgT.jpg",
    alt: "Healing process after rhinoplasty",
    caption: "Timeline of healing after rhinoplasty procedure"
  },
  "type": {
    src: "https://i.imgur.com/xdpGtZ9.jpg",
    alt: "Types of rhinoplasty procedures",
    caption: "Overview of different rhinoplasty approaches"
  },
  "procedure": {
    src: "https://i.imgur.com/xdpGtZ9.jpg",
    alt: "Rhinoplasty procedure options",
    caption: "Different approaches to rhinoplasty surgery"
  },
  "costs": {
    src: "https://i.imgur.com/JwqjnIS.jpg",
    alt: "Rhinoplasty procedure costs",
    caption: "Understanding rhinoplasty pricing factors"
  },
  "price": {
    src: "https://i.imgur.com/JwqjnIS.jpg",
    alt: "Rhinoplasty pricing factors",
    caption: "Factors that determine rhinoplasty prices"
  },
  "consult": {
    src: "https://i.imgur.com/ZC4Ow6W.jpg",
    alt: "Rhinoplasty consultation process",
    caption: "What happens during a rhinoplasty consultation"
  },
  "doctor": {
    src: "https://i.imgur.com/ZC4Ow6W.jpg",
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
    src: "https://i.imgur.com/NBgjHnj.jpg",
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