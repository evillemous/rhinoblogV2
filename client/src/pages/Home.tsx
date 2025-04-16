import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { PostWithTags } from "@shared/schema";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [offset, setOffset] = useState(0);
  const limit = 10;
  
  const { data: posts, isLoading, error } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", limit, offset],
    staleTime: 60000, // 1 minute stale time
  });
  
  // Reset offset when sort changes
  useEffect(() => {
    setOffset(0);
  }, [sortBy]);
  
  // Sort posts based on the selected option
  const sortedPosts = posts ? [...posts].sort((a, b) => {
    if (sortBy === "new") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "top") {
      return b.upvotes - a.upvotes;
    } else { // hot (default)
      // Hot is a combination of recency and popularity
      const aScore = a.upvotes - a.downvotes + (a.commentCount * 2);
      const bScore = b.upvotes - b.downvotes + (b.commentCount * 2);
      return bScore - aScore;
    }
  }) : [];
  
  const loadMore = () => {
    if (posts?.length) {
      setOffset(offset + limit);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Post sorting (Mobile) */}
        <div className="lg:hidden flex mb-4 overflow-x-auto pb-2 space-x-2">
          <Button
            variant={sortBy === "hot" ? "default" : "outline"}
            className="flex-shrink-0 rounded-full"
            onClick={() => setSortBy("hot")}
          >
            Popular
          </Button>
          <Button
            variant={sortBy === "new" ? "default" : "outline"}
            className="flex-shrink-0 rounded-full"
            onClick={() => setSortBy("new")}
          >
            New
          </Button>
          <Button
            variant={sortBy === "top" ? "default" : "outline"}
            className="flex-shrink-0 rounded-full"
            onClick={() => setSortBy("top")}
          >
            Top
          </Button>
        </div>
        
        {/* Post sorting (Desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-reddit-darkCard shadow rounded-md p-2 items-center">
          <Button
            variant="ghost"
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-full"
            onClick={() => setSortBy("hot")}
          >
            <i className={`fas fa-fire ${sortBy === "hot" ? "text-reddit-orange" : ""}`}></i>
            <span>Hot</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-full"
            onClick={() => setSortBy("new")}
          >
            <i className={`fas fa-certificate ${sortBy === "new" ? "text-reddit-orange" : ""}`}></i>
            <span>New</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-full"
            onClick={() => setSortBy("top")}
          >
            <i className={`fas fa-arrow-trend-up ${sortBy === "top" ? "text-reddit-orange" : ""}`}></i>
            <span>Top</span>
          </Button>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading posts...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-6 text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
            <p className="text-red-500">Error loading posts. Please try again later.</p>
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && sortedPosts?.length === 0 && (
          <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-6 text-center">
            <i className="fas fa-comment-slash text-gray-400 text-2xl mb-2"></i>
            <p className="text-gray-500 dark:text-gray-400">No posts found. Be the first to share your story!</p>
          </div>
        )}
        
        {/* Posts */}
        {sortedPosts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {/* Load more */}
        {sortedPosts?.length > 0 && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              className="bg-white dark:bg-reddit-darkCard shadow rounded-md"
              onClick={loadMore}
            >
              Load More Posts
            </Button>
          </div>
        )}
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Home;
