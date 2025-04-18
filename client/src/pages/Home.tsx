import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowUpCircle, MessageCircle, Award, Share2, ChevronUp, ChevronDown, Flame, TrendingUp, Clock, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { getRelativeTimeString, getTagColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import PostForm from "@/components/PostForm";

const Home = () => {
  const [offset] = useState(0);
  const limit = 20;
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  
  // Fetch posts
  const { data: posts, isLoading, error } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", limit, offset, sortBy],
    staleTime: 60000, // 1 minute stale time
  });
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as "hot" | "new" | "top");
  };
  
  // Handle create post button click
  const handleCreatePost = () => {
    if (isAuthenticated) {
      setIsPostFormOpen(true);
    } else {
      navigate("/login");
    }
  };
  
  return (
    <div className="flex">
      {/* Post Form */}
      <PostForm isOpen={isPostFormOpen} onClose={() => setIsPostFormOpen(false)} />
      
      {/* Floating Create Post Button (mobile-friendly) */}
      <Button
        onClick={handleCreatePost}
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-reddit-orange hover:bg-orange-600 flex items-center justify-center p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Left Sidebar */}
      <div className="hidden md:block w-64 bg-white dark:bg-gray-900 mr-4 border-r dark:border-gray-800 h-[calc(100vh-64px)] fixed left-0 top-16 p-4">
        <div className="space-y-2">
          <a href="/" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">🏠</div>
            <span>Home</span>
          </a>
          <a href="/popular" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">🔥</div>
            <span>Popular</span>
          </a>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Topics</div>
          <a href="/topic/rhinoplasty" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">👃</div>
            <span>Rhinoplasty</span>
          </a>
          <a href="/topic/recovery" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">🩹</div>
            <span>Recovery</span>
          </a>
          <a href="/topic/surgeons" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">👨‍⚕️</div>
            <span>Surgeons</span>
          </a>
          <a href="/topic/results" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="mr-3">📸</div>
            <span>Results</span>
          </a>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4">
        {/* Sort Tabs */}
        <div className="mb-4 bg-white dark:bg-gray-900 rounded-md border dark:border-gray-800 p-2">
          <Tabs defaultValue={sortBy} onValueChange={handleSortChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hot" className="flex items-center">
                <Flame className="h-4 w-4 mr-2" /> Hot
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" /> New
              </TabsTrigger>
              <TabsTrigger value="top" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" /> Top
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="text-center p-12">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="mt-2 text-gray-500">Loading posts...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <p className="text-red-600 dark:text-red-400 text-center">
              Error loading posts. Please try again later.
            </p>
          </div>
        )}
        
        {/* Posts */}
        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                <div className="flex">
                  {/* Vote Column */}
                  <div className="bg-gray-50 dark:bg-gray-900 w-10 flex flex-col items-center py-2">
                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-orange-500 hover:bg-transparent">
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span className="text-xs font-medium my-1">{(post.upvotes || 0) - (post.downvotes || 0)}</span>
                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-500 hover:bg-transparent">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 w-full">
                    {/* Post Header */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <p>
                        Posted by {post.user ? 
                          <span className="hover:underline">u/{post.user.username}</span> : 
                          <span>Anonymous</span>
                        } {post.createdAt ? getRelativeTimeString(new Date(post.createdAt)) : 'some time ago'}
                      </p>
                    </div>
                    
                    {/* Post Title */}
                    <h2 className="text-lg font-medium mb-1 hover:underline cursor-pointer" 
                      onClick={() => navigate(`/post/${post.id}`)}>
                      {post.title}
                    </h2>
                    
                    {/* Tags */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      {post.tags.map(tag => (
                        <span 
                          key={tag.id} 
                          className={`px-2 py-0.5 text-xs font-medium rounded-full`}
                          style={{ backgroundColor: `${getTagColor(tag.name)}20`, color: getTagColor(tag.name) }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Post Preview */}
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                      {post.content}
                    </div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.commentCount || 0} Comments
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Award className="h-4 w-4 mr-1" />
                        Award
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Load More Button */}
            <Button variant="outline" className="w-full">
              Load More
            </Button>
          </div>
        ) : (
          !isLoading && (
            <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-md border dark:border-gray-800">
              <p className="text-gray-500">No posts found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleCreatePost}
              >
                Create a Post
              </Button>
            </div>
          )
        )}
      </div>
      
      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 ml-4">
        <div className="bg-white dark:bg-gray-900 rounded-md border dark:border-gray-800 p-4 mb-4">
          <h3 className="font-medium mb-3">Popular Communities</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center">
                <span className="text-blue-800">R</span>
              </div>
              <div>
                <p className="text-sm font-medium">r/RhinoplastyResults</p>
                <p className="text-xs text-gray-500">23,456 members</p>
              </div>
            </li>
            <li className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 w-8 h-8 flex items-center justify-center">
                <span className="text-green-800">S</span>
              </div>
              <div>
                <p className="text-sm font-medium">r/SurgeryBeforeAfter</p>
                <p className="text-xs text-gray-500">12,345 members</p>
              </div>
            </li>
            <li className="flex items-center space-x-2">
              <div className="rounded-full bg-purple-100 w-8 h-8 flex items-center justify-center">
                <span className="text-purple-800">P</span>
              </div>
              <div>
                <p className="text-sm font-medium">r/PlasticSurgery</p>
                <p className="text-xs text-gray-500">89,012 members</p>
              </div>
            </li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full mt-3 text-sm" 
            onClick={() => navigate("/topics")}
          >
            View All Communities
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-md border dark:border-gray-800 p-4">
          <h3 className="font-medium mb-3">RhinoplastyBlogs.com Rules</h3>
          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Be respectful to others</li>
            <li>No promotion of unsafe practices</li>
            <li>Verify claims when possible</li>
            <li>No excessive self-promotion</li>
            <li>Post only relevant rhinoplasty content</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
