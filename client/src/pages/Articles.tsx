import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PostWithTags } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getRelativeTimeString } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { getArticleImage } from "@/lib/articleImageMapping";
import { ChevronRight, BookOpen, Clock, User } from "lucide-react";

// Component for Featured Article
const FeaturedArticle = ({ post }: { post: PostWithTags }) => {
  const formattedDate = post.createdAt 
    ? getRelativeTimeString(new Date(post.createdAt))
    : "recently";

  // Get appropriate image for article
  const image = getArticleImage(
    post.title || "", 
    post.tags?.map(t => t.name) || []
  );

  // Extract first paragraph for preview
  const getFirstParagraph = () => {
    if (!post.content) return "";
    const firstParagraphMatch = post.content.match(/^(.*?)\n\n/);
    const excerpt = firstParagraphMatch ? firstParagraphMatch[1] : post.content.substring(0, 200);
    return excerpt.length > 200 ? excerpt.substring(0, 200) + "..." : excerpt;
  };

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-lg">
      {/* Featured Banner */}
      <div className="bg-rhino-orange text-white text-xs uppercase font-bold px-3 py-1">
        Featured Article
      </div>
      
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:w-2/5 bg-gray-100 p-4 flex items-center justify-center">
          <div className="relative w-full h-48 md:h-full max-h-80">
            <img 
              src={image.src || "https://i.imgur.com/Y0PX7Kq.jpg"} 
              alt={image.alt} 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://i.imgur.com/Y0PX7Kq.jpg";
              }}
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                {image.caption}
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="md:w-3/5 p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags && post.tags.map((tag) => (
              <Badge 
                key={tag.id}
                variant="outline" 
                className="bg-rhino-navy/10 text-rhino-navy border-rhino-navy/20"
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
          
          <CardTitle className="text-2xl font-bold mb-3 text-rhino-navy">
            {post.title}
          </CardTitle>
          
          <CardDescription className="text-base mb-4 line-clamp-3">
            {getFirstParagraph()}
          </CardDescription>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center mr-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Rhinoplasty Expert</span>
            </div>
          </div>
          
          <Button 
            asChild 
            className="bg-rhino-orange hover:bg-rhino-orange/90 text-white w-full md:w-auto"
          >
            <Link href={`/article/${post.id}`}>
              Read Full Article
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Component for Article previews
const ArticleCard = ({ post }: { post: PostWithTags }) => {
  const formattedDate = post.createdAt 
    ? getRelativeTimeString(new Date(post.createdAt))
    : "recently";

  // Get appropriate image for article
  const image = getArticleImage(
    post.title || "", 
    post.tags?.map(t => t.name) || []
  );

  // Extract first paragraph for preview
  const getFirstParagraph = () => {
    if (!post.content) return "";
    const firstParagraphMatch = post.content.match(/^(.*?)\n\n/);
    return firstParagraphMatch ? firstParagraphMatch[1] : post.content.substring(0, 150);
  };

  return (
    <Card className="overflow-hidden border-rhino-navy/10 hover:border-rhino-orange/50 transition-all h-full flex flex-col">
      {/* Image Header */}
      <div className="relative h-48 bg-gray-100">
        <img 
          src={image.src || "https://i.imgur.com/xdpGtZ9.jpg"} 
          alt={image.alt} 
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://i.imgur.com/xdpGtZ9.jpg";
          }}
        />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags && post.tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="bg-rhino-navy/10 text-rhino-navy border-rhino-navy/20"
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-lg text-rhino-navy line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4 flex-grow">
        <CardDescription className="text-sm mb-2 line-clamp-3">
          {getFirstParagraph()}...
        </CardDescription>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 mt-auto">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formattedDate}</span>
        </div>
        <Button 
          asChild 
          variant="ghost"
          size="sm"
          className="text-rhino-orange hover:text-rhino-orange/90 p-0 h-auto"
        >
          <Link href={`/article/${post.id}`}>
            Read More <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Articles page component
const Articles = () => {
  const [filter, setFilter] = useState("all");
  
  // Fetch all posts
  const { data: posts, isLoading, error } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts"],
    staleTime: 60000, // 1 minute
  });
  
  // Filter for informational articles only (generated by admin)
  const informationalPosts = posts?.filter(post => 
    post.isAiGenerated && 
    post.user?.isAdmin && 
    post.tags?.some(tag => 
      tag.name === "educational" || 
      tag.name === "informational" || 
      tag.name.includes("guide") || 
      tag.name.includes("explained")
    )
  ) || [];
  
  // Categories for filtering
  const categories = [
    { id: "all", name: "All Articles", icon: <BookOpen className="h-4 w-4 mr-1" /> },
    { id: "recovery", name: "Recovery", icon: <i className="fas fa-band-aid mr-1"></i> },
    { id: "procedures", name: "Procedures", icon: <i className="fas fa-user-md mr-1"></i> },
    { id: "guides", name: "Guides", icon: <i className="fas fa-book-open mr-1"></i> },
    { id: "faq", name: "FAQ", icon: <i className="fas fa-question-circle mr-1"></i> }
  ];
  
  // Apply category filter
  const filteredPosts = filter === "all" 
    ? informationalPosts 
    : informationalPosts.filter(post => 
        post.tags?.some(tag => tag.name.includes(filter) || 
          (filter === "recovery" && tag.name.includes("healing")) ||
          (filter === "procedures" && tag.name.includes("rhinoplasty")) ||
          (filter === "guides" && tag.name.includes("guide")) ||
          (filter === "faq" && tag.name.includes("faq"))
        )
      );
  
  // Featured article is the first article, or filtered first article if filter applied
  const featuredArticle = filteredPosts.length > 0 ? filteredPosts[0] : null;
  
  // Regular articles are all remaining articles
  const regularArticles = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];
  
  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-rhino-navy">
                Rhinoplasty Articles & Guides
              </h1>
              <p className="text-gray-600 mt-1">
                Expert information and resources about rhinoplasty procedures
              </p>
            </div>
          </div>
          
          {/* Category Filter - Pill Style */}
          <div className="flex flex-wrap gap-2 my-4 border-t border-b border-gray-100 py-4">
            {categories.map(category => (
              <Button 
                key={category.id}
                variant={filter === category.id ? "default" : "outline"}
                size="sm"
                className={filter === category.id 
                  ? "bg-rhino-orange hover:bg-rhino-orange/90 text-white rounded-full" 
                  : "border-rhino-navy/20 hover:bg-rhino-navy/10 rounded-full"}
                onClick={() => setFilter(category.id)}
              >
                <span className="flex items-center">
                  {category.icon}
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        )}
        
        {/* Error state */}
        {error && (
          <Card className="p-6 border-red-300">
            <p className="text-red-500">Error loading articles. Please try again later.</p>
          </Card>
        )}
        
        {/* No articles found */}
        {!isLoading && !error && filteredPosts.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No articles found in this category.</p>
          </Card>
        )}
        
        {/* Featured Article */}
        {!isLoading && !error && featuredArticle && (
          <FeaturedArticle post={featuredArticle} />
        )}
        
        {/* Article Grid - 3 column on desktop, 2 on tablet, 1 on mobile */}
        {!isLoading && !error && regularArticles.length > 0 && (
          <div>
            <h2 className="font-bold text-xl mb-4 text-rhino-navy">More Articles</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map(post => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Articles;