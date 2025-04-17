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
  // By tag/category
  "beforeafter": {
    src: "/assets/images/articles/rhinoplasty-before-after.svg",
    alt: "Before and after rhinoplasty results comparison",
    caption: "Typical before and after changes from rhinoplasty"
  },
  "recovery": {
    src: "/assets/images/articles/recovery-timeline.svg",
    alt: "Rhinoplasty recovery timeline",
    caption: "Timeline showing typical rhinoplasty recovery milestones"
  },
  "types": {
    src: "/assets/images/articles/types-of-rhinoplasty.svg",
    alt: "Different types of rhinoplasty procedures",
    caption: "Overview of rhinoplasty procedure types"
  },
  "cost": {
    src: "/assets/images/articles/cost-factors.svg",
    alt: "Cost factors for rhinoplasty procedures",
    caption: "Factors affecting rhinoplasty procedure costs"
  },
  "consultation": {
    src: "/assets/images/articles/medical-consultation.svg",
    alt: "Medical consultation for rhinoplasty",
    caption: "What to expect during your rhinoplasty consultation"
  },
  
  // By keywords in title
  "before": {
    src: "/assets/images/articles/rhinoplasty-before-after.svg",
    alt: "Before and after rhinoplasty results",
    caption: "Rhinoplasty results visualization"
  },
  "after": {
    src: "/assets/images/articles/rhinoplasty-before-after.svg",
    alt: "Before and after rhinoplasty comparison",
    caption: "Visual changes from rhinoplasty procedure"
  },
  "recover": {
    src: "/assets/images/articles/recovery-timeline.svg",
    alt: "Rhinoplasty recovery process",
    caption: "Recovery timeline after rhinoplasty surgery"
  },
  "healing": {
    src: "/assets/images/articles/recovery-timeline.svg",
    alt: "Healing process after rhinoplasty",
    caption: "Timeline of healing after rhinoplasty procedure"
  },
  "type": {
    src: "/assets/images/articles/types-of-rhinoplasty.svg",
    alt: "Types of rhinoplasty procedures",
    caption: "Overview of different rhinoplasty approaches"
  },
  "procedure": {
    src: "/assets/images/articles/types-of-rhinoplasty.svg",
    alt: "Rhinoplasty procedure options",
    caption: "Different approaches to rhinoplasty surgery"
  },
  "costs": {
    src: "/assets/images/articles/cost-factors.svg",
    alt: "Rhinoplasty procedure costs",
    caption: "Understanding rhinoplasty pricing factors"
  },
  "price": {
    src: "/assets/images/articles/cost-factors.svg",
    alt: "Rhinoplasty pricing factors",
    caption: "Factors that determine rhinoplasty prices"
  },
  "consult": {
    src: "/assets/images/articles/medical-consultation.svg",
    alt: "Rhinoplasty consultation process",
    caption: "What happens during a rhinoplasty consultation"
  },
  "doctor": {
    src: "/assets/images/articles/medical-consultation.svg",
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
    src: "/assets/images/articles/types-of-rhinoplasty.svg",
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