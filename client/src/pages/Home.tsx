import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { PostWithTags, Tag } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Clock, TrendingUp, Flame, User } from "lucide-react";

const Home = () => {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [offset, setOffset] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"card" | "compact">("card");
  const { user } = useAuth();
  const limit = 10;
  
  // Fetch posts and tags
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", limit, offset],
    staleTime: 60000, // 1 minute stale time
  });
  
  const { data: tags, isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    staleTime: 300000, // 5 minutes stale time
  });
  
  // Reset offset when sort changes
  useEffect(() => {
    setOffset(0);
  }, [sortBy, selectedTag]);
  
  // Filter and sort posts based on the selected options
  const filteredAndSortedPosts = posts 
    ? [...posts]
        .filter(post => !selectedTag || post.tags.some(tag => tag.name === selectedTag))
        .sort((a, b) => {
          if (sortBy === "new") {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          } else if (sortBy === "top") {
            return (b.upvotes || 0) - (a.upvotes || 0);
          } else { // hot (default)
            // Hot is a combination of recency and popularity
            const aScore = (a.upvotes || 0) - (a.downvotes || 0) + ((a.commentCount || 0) * 2);
            const bScore = (b.upvotes || 0) - (b.downvotes || 0) + ((b.commentCount || 0) * 2);
            return bScore - aScore;
          }
        })
    : [];
  
  const loadMore = () => {
    if (posts?.length) {
      setOffset(offset + limit);
    }
  };

  // Group trending communities (tags)
  const trendingCommunities = tags ? tags.slice(0, 5) : [];
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-2 md:px-4 py-4 flex flex-col md:flex-row gap-4">
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-64 space-y-4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Link href="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>Home</span>
                </Link>
                <Link href="/popular" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Popular</span>
                </Link>
                {user && (
                  <Link href="/my-profile" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <User className="h-5 w-5 text-green-500" />
                    <span>My Profile</span>
                  </Link>
                )}
              </nav>
            </CardContent>
          </Card>
          
          {/* Trending Communities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Trending Communities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {trendingCommunities.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                  className={`flex items-center space-x-2 p-2 rounded-md w-full text-left my-1 
                    ${tag.name === selectedTag 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-${tag.color || 'blue'}-500 text-white`}>
                    {tag.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">r/{tag.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rhinoplasty community</p>
                  </div>
                </button>
              ))}
              {selectedTag && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setSelectedTag(null)}
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 space-y-4">
          {/* Create Post */}
          <Card className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {user ? user.username.charAt(0).toUpperCase() : 'G'}
                </div>
                <Input 
                  placeholder="Create Post"
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => alert('Create post feature coming soon!')} 
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
          
          {/* View type and sorting */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b dark:border-gray-700">
                <div className="flex">
                  <Button
                    variant={sortBy === "hot" ? "default" : "ghost"}
                    className="rounded-none h-10 px-4"
                    onClick={() => setSortBy("hot")}
                  >
                    <Flame className={`h-5 w-5 mr-1 ${sortBy === "hot" ? "text-white" : "text-orange-500"}`} />
                    Hot
                  </Button>
                  <Button
                    variant={sortBy === "new" ? "default" : "ghost"}
                    className="rounded-none h-10 px-4"
                    onClick={() => setSortBy("new")}
                  >
                    <Clock className={`h-5 w-5 mr-1 ${sortBy === "new" ? "text-white" : "text-green-500"}`} />
                    New
                  </Button>
                  <Button
                    variant={sortBy === "top" ? "default" : "ghost"}
                    className="rounded-none h-10 px-4"
                    onClick={() => setSortBy("top")}
                  >
                    <TrendingUp className={`h-5 w-5 mr-1 ${sortBy === "top" ? "text-white" : "text-blue-500"}`} />
                    Top
                  </Button>
                </div>
                <div className="flex pr-2">
                  <Button
                    variant={viewType === "card" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-md h-8 px-2"
                    onClick={() => setViewType("card")}
                  >
                    <i className="fas fa-th-large"></i>
                  </Button>
                  <Button
                    variant={viewType === "compact" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-md h-8 px-2"
                    onClick={() => setViewType("compact")}
                  >
                    <i className="fas fa-list"></i>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile Trending Communities */}
          <div className="md:hidden">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-lg">Trending Communities</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex overflow-x-auto space-x-2 p-3">
                  {trendingCommunities.map(tag => (
                    <button 
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                      className={`flex-shrink-0 rounded-md px-4 py-2 flex flex-col items-center
                        ${tag.name === selectedTag 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-${tag.color || 'blue'}-500 text-white`}>
                        {tag.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="mt-1 font-medium text-sm">r/{tag.name}</span>
                    </button>
                  ))}
                </div>
                {selectedTag && (
                  <div className="px-3 pb-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedTag(null)}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Loading state */}
          {postsLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Loading posts...</p>
              </CardContent>
            </Card>
          )}
          
          {/* Error state */}
          {postsError && (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-500">Error loading posts. Please try again later.</p>
              </CardContent>
            </Card>
          )}
          
          {/* Empty state */}
          {!postsLoading && filteredAndSortedPosts?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <i className="fas fa-comment-slash text-gray-400 text-2xl mb-2"></i>
                <p className="text-gray-500 dark:text-gray-400">No posts found for this filter. Try another community or sorting option.</p>
              </CardContent>
            </Card>
          )}
          
          {/* Posts */}
          {filteredAndSortedPosts?.map((post) => (
            <PostCard key={post.id} post={post} expanded={false} />
          ))}
          
          {/* Load more */}
          {filteredAndSortedPosts?.length > 0 && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={loadMore}
              >
                Load More Posts
              </Button>
            </div>
          )}
        </main>
        
        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">About RhinoplastyBlogs</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                A community for sharing rhinoplasty experiences, tips, and support. Connect with others on their rhinoplasty journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <i className="fas fa-users mr-2 text-gray-500"></i>
                  <span>4.2k members</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-chart-line mr-2 text-gray-500"></i>
                  <span>100+ online</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-birthday-cake mr-2 text-gray-500"></i>
                  <span>Created Jan 15, 2023</span>
                </div>
              </div>
              {!user && (
                <div className="mt-4 space-y-2">
                  <Link href="/auth" className="block">
                    <Button className="w-full">Join Community</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Community Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="pb-2 border-b dark:border-gray-700">
                <p className="font-medium text-sm">1. Be respectful and supportive</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Treat others with kindness and respect their experiences.</p>
              </div>
              <div className="pb-2 border-b dark:border-gray-700">
                <p className="font-medium text-sm">2. No medical advice</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Share experiences, not professional medical advice.</p>
              </div>
              <div className="pb-2 border-b dark:border-gray-700">
                <p className="font-medium text-sm">3. No self-promotion</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Don't advertise services, products, or social media.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <a href="#" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">Rhinoplasty Recovery Timeline</a>
              <a href="#" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">Finding the Right Surgeon</a>
              <a href="#" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">Post-Surgery Care Tips</a>
              <a href="#" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">Common Questions & Answers</a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Home;
