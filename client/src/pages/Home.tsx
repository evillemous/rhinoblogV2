import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const [offset] = useState(0);
  const limit = 10;
  
  // Fetch posts
  const { data: posts, isLoading, error } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", limit, offset],
    staleTime: 60000, // 1 minute stale time
  });
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">RhinoplastyBlogs</h1>
      
      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-4 text-center">
            <p>Loading posts...</p>
          </CardContent>
        </Card>
      )}
      
      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-500">Error loading posts</p>
          </CardContent>
        </Card>
      )}
      
      {/* Posts */}
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {post.content.length > 100 
                      ? post.content.substring(0, 100) + '...' 
                      : post.content}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {post.tags.map(tag => (
                    <span 
                      key={tag.id} 
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <Card>
            <CardContent className="p-4 text-center">
              <p>No posts found</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default Home;
