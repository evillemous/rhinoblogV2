// API access for Unsplash images
// Get your own API key at https://unsplash.com/developers

// Constants
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Types
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

// Check if we have access to the Unsplash API
export const isUnsplashConfigured = (): boolean => {
  return UNSPLASH_ACCESS_KEY !== '';
};

// Search for images based on a query
export async function searchUnsplashImages(query: string, count: number = 1): Promise<UnsplashImage[]> {
  if (!isUnsplashConfigured()) {
    console.warn('Unsplash API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Failed to fetch images from Unsplash:', error);
    return [];
  }
}

// Get a random medical/rhinoplasty related image
export async function getRandomRhinoplastyImage(): Promise<UnsplashImage | null> {
  const queries = [
    'medical clinic', 
    'doctor consultation', 
    'medical professional', 
    'nose surgery', 
    'plastic surgery', 
    'medical office',
    'facial profile',
    'nose anatomy',
    'facial features'
  ];
  
  // Select a random query
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const images = await searchUnsplashImages(randomQuery, 1);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error('Failed to get random rhinoplasty image:', error);
    return null;
  }
}

// Function to get an image by tag or keyword
export async function getImageByTopic(topic: string): Promise<UnsplashImage | null> {
  // Map our topics to appropriate Unsplash search terms
  const searchTermMap: Record<string, string> = {
    'beforeafter': 'nose profile',
    'recovery': 'recovery healing',
    'types': 'medical procedure',
    'cost': 'medical consultation cost',
    'consultation': 'doctor consultation',
    'before': 'nose profile',
    'after': 'nose profile',
    'recover': 'healing recovery',
    'healing': 'healing recovery',
    'type': 'medical procedure',
    'procedure': 'medical procedure',
    'costs': 'medical expense',
    'price': 'medical expense',
    'consult': 'doctor consultation',
    'doctor': 'doctor surgeon',
    'faq': 'medical information',
    'guide': 'medical guide',
    'explained': 'medical education'
  };
  
  // Use the mapped search term if available, otherwise use the topic
  const searchTerm = searchTermMap[topic.toLowerCase()] || topic;
  
  try {
    const images = await searchUnsplashImages(searchTerm, 1);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error(`Failed to get image for topic ${topic}:`, error);
    return null;
  }
}