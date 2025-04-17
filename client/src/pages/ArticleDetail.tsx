import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";

const ArticleDetail = () => {
  const [, params] = useRoute("/article/:id");
  const postId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch article
  const { data: article, isLoading, error } = useQuery<PostWithTags>({
    queryKey: [`/api/posts/${postId}`],
    staleTime: 60000, // 1 minute
    enabled: !!postId,
  });
  
  // Format the date
  const formattedDate = article?.createdAt 
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : "recently";
  
  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <Button 
          variant="ghost" 
          className="mb-4 text-rhino-navy hover:text-rhino-orange"
          asChild
        >
          <Link href="/articles">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Articles
          </Link>
        </Button>
        
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
          <Card className="overflow-hidden border-rhino-navy/10">
            <CardHeader className="pb-4 bg-rhino-peach/30">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl text-rhino-navy">{article.title}</CardTitle>
                <span className="text-sm text-gray-500">Published {formattedDate}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
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
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                {article.content ? (
                  <ReactMarkdown>{article.content}</ReactMarkdown>
                ) : (
                  <p className="italic text-gray-500">This article has no content.</p>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 hover:bg-rhino-peach/10 transition-colors">
                    <Link href="/articles" className="text-rhino-navy hover:text-rhino-orange">
                      View All Articles
                    </Link>
                  </Card>
                  <Card className="p-4 hover:bg-rhino-peach/10 transition-colors">
                    <Link href="/" className="text-rhino-navy hover:text-rhino-orange">
                      Browse Community Posts
                    </Link>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default ArticleDetail;