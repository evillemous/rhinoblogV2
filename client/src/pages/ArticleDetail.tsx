import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, Calendar, Clock, User, BookOpen, Share2, Bookmark, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow, format } from "date-fns";
import { getArticleImage } from "@/lib/articleImageMapping";

const ArticleDetail = () => {
  const [, params] = useRoute("/article/:id");
  const postId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch article
  const { data: article, isLoading, error } = useQuery<PostWithTags>({
    queryKey: [`/api/posts/${postId}`],
    staleTime: 60000, // 1 minute
    enabled: !!postId,
  });
  
  // Fetch related articles
  const { data: allPosts } = useQuery<PostWithTags[]>({
    queryKey: ['/api/posts'],
    staleTime: 60000,
  });
  
  // Format the date
  const formattedDate = article?.createdAt 
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : "recently";
  
  const exactDate = article?.createdAt
    ? format(new Date(article.createdAt), 'MMMM d, yyyy')
    : "";
  
  // Get appropriate image based on article title and tags
  const articleImage = article
    ? getArticleImage(
        article.title || "", 
        article.tags?.map(t => t.name) || []
      )
    : null;
  
  // Find related articles that share tags with the current article
  const relatedArticles = allPosts 
    ? allPosts
        .filter(post => 
          post.id !== postId && 
          post.isAiGenerated && 
          post.tags?.some(tag => 
            article?.tags?.some(currentTag => 
              currentTag.name === tag.name
            )
          )
        )
        .slice(0, 3)
    : [];
  
  // Calculate estimated reading time (average adult reads 200-250 words per minute)
  const getReadingTime = (content: string): string => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 225);
    return `${minutes} min read`;
  };
  
  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="text-rhino-navy hover:text-rhino-orange"
            asChild
          >
            <Link href="/articles">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Articles
            </Link>
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" title="Share Article">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Save Article">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        )}
        
        {/* Error state */}
        {error && (
          <Card className="p-6 border-red-300">
            <CardTitle className="text-xl text-red-500 mb-2">Error Loading Article</CardTitle>
            <p>The article could not be loaded. It may have been removed or doesn't exist.</p>
            <Button className="mt-4" asChild>
              <Link href="/articles">Return to Articles</Link>
            </Button>
          </Card>
        )}
        
        {/* Article content */}
        {article && (
          <div className="space-y-6">
            {/* Article Header */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="pb-4 pt-6 px-6 bg-white">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags && article.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="bg-rhino-navy/10 text-rhino-navy border-rhino-navy/20"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
                
                {/* Title */}
                <CardTitle className="text-3xl text-rhino-navy font-bold mb-4">
                  {article.title}
                </CardTitle>
                
                {/* Article Meta */}
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-rhino-orange" />
                    <span>{exactDate}</span>
                  </div>
                  
                  {article.content && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-rhino-orange" />
                      <span>{getReadingTime(article.content)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-rhino-orange" />
                    <span>Rhinoplasty Expert</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Featured Image */}
            {articleImage && (
              <div className="bg-white p-6 rounded-md shadow-md">
                <div className="relative max-h-[400px] overflow-hidden flex justify-center">
                  <img 
                    src={articleImage.src || "https://via.placeholder.com/800x500/F4884A/FFFFFF?text=Rhinoplasty+Article"} 
                    alt={articleImage.alt}
                    className="max-w-full h-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://via.placeholder.com/800x500/F4884A/FFFFFF?text=Rhinoplasty+Article";
                    }}
                  />
                </div>
                {articleImage.caption && (
                  <p className="text-sm text-center text-gray-500 mt-2 italic">
                    {articleImage.caption}
                  </p>
                )}
              </div>
            )}
            
            {/* Article Content */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardContent className="p-6 sm:p-8">
                <div className="prose max-w-none card-content">
                  {article.content ? (
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                  ) : (
                    <p className="italic text-gray-500">This article has no content.</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <span>Thanks for reading</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Heart className="h-4 w-4 mr-2 text-rhino-orange" />
                      <span>Helpful</span>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Share2 className="h-4 w-4 mr-2 text-rhino-orange" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-rhino-orange" />
                    <CardTitle className="text-xl">Related Articles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedArticles.map(relatedPost => {
                      const relatedImage = getArticleImage(
                        relatedPost.title || "", 
                        relatedPost.tags?.map(t => t.name) || []
                      );
                      
                      return (
                        <Card key={relatedPost.id} className="overflow-hidden h-full hover:shadow-md transition-all border-rhino-navy/10">
                          <div className="h-32 bg-gray-100 flex items-center justify-center p-2">
                            <img 
                              src={relatedImage.src || "https://via.placeholder.com/300x200/1A2E3B/FFFFFF?text=Related+Article"}
                              alt={relatedImage.alt}
                              className="h-full w-auto object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "https://via.placeholder.com/300x200/1A2E3B/FFFFFF?text=Related+Article";
                              }}
                            />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">
                              <Link href={`/article/${relatedPost.id}`} className="hover:text-rhino-orange">
                                {relatedPost.title}
                              </Link>
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(relatedPost.createdAt || new Date()), { addSuffix: true })}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button 
                      variant="outline" 
                      className="rounded-full border-rhino-orange text-rhino-orange hover:bg-rhino-orange/10"
                      asChild
                    >
                      <Link href="/articles">View All Articles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default ArticleDetail;