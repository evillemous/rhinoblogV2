import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

const AdminPostList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch all posts for admin
  const { data: posts, isLoading, error } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", 100, 0], // Get more posts for admin view
    staleTime: 60000, // 1 minute stale time
  });
  
  // Filter posts based on search term
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Paginate posts
  const totalPages = filteredPosts ? Math.ceil(filteredPosts.length / itemsPerPage) : 0;
  const paginatedPosts = filteredPosts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format date for display
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Manage Posts</CardTitle>
        <CardDescription>
          View, edit, and delete posts from the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search box */}
        <div className="mb-4">
          <Input
            placeholder="Search posts by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center p-6">
            <i className="fas fa-spinner fa-spin text-xl mb-2"></i>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <i className="fas fa-exclamation-circle text-xl mb-2"></i>
            <p>Error loading posts. Please try again.</p>
          </div>
        ) : filteredPosts?.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <i className="fas fa-search text-xl mb-2"></i>
            <p>No posts found matching your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>AI</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPosts?.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        <a href={`/post/${post.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {post.title}
                        </a>
                      </TableCell>
                      <TableCell>{post.user.username}</TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              #{tag.name}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.isAiGenerated ? (
                          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            AI
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-xs">
                          <span>
                            <i className="fas fa-arrow-up text-reddit-orange"></i> {post.upvotes}
                          </span>
                          <span>
                            <i className="fas fa-comment text-gray-500"></i> {post.commentCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-edit"></i>
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <i className="fas fa-trash"></i>
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <i className="fas fa-chevron-right ml-1"></i>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPostList;
