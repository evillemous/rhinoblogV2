import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import UserGuard from "@/lib/guards/UserGuard";
import UserLayout from "@/components/user/UserLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Filter,
  Eye,
  Clock,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  status: 'published' | 'pending' | 'rejected';
  upvotes: number;
  commentCount: number;
  views: number;
  imageUrl?: string;
  tags: { id: number; name: string; color: string }[];
  rejectionReason?: string;
}

const UserPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // Fetch user posts
  const { data: postsData, isLoading } = useQuery<{
    posts: Post[];
    stats: { total: number; published: number; pending: number; rejected: number };
  }>({
    queryKey: ["/api/user/posts", { searchTerm, sortBy }],
    enabled: !!user,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/posts/${postId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmDelete = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  const viewRejectionReason = (post: Post) => {
    setSelectedPost(post);
    setIsRejectionDialogOpen(true);
  };

  // Filter posts based on active tab
  const filteredPosts = postsData?.posts.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return post.status === "published";
    if (activeTab === "pending") return post.status === "pending";
    if (activeTab === "rejected") return post.status === "rejected";
    return true;
  }) || [];

  // Filter posts based on search term
  const searchedPosts = filteredPosts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort posts based on selected sorting
  const sortedPosts = [...searchedPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "popular") {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === "comments") {
      return b.commentCount - a.commentCount;
    }
    return 0;
  });

  // Get post status badge
  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
    }
    if (status === "rejected") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
    }
    return null;
  };

  return (
    <UserGuard>
      <UserLayout title="My Posts">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>My Posts</CardTitle>
                <CardDescription>
                  Manage your posts and track their performance
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/user/create-post">
                  <a className="w-full md:w-auto">Create New Post</a>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="grid w-full md:w-auto grid-cols-4">
                  <TabsTrigger value="all" className="relative">
                    All
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{postsData?.stats.total || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="published" className="relative">
                    Published
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{postsData?.stats.published || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="relative">
                    Pending
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{postsData?.stats.pending || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="relative">
                    Rejected
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{postsData?.stats.rejected || 0}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Upvotes</SelectItem>
                      <SelectItem value="comments">Most Comments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6">Loading your posts...</div>
                ) : sortedPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No posts found</h3>
                    {activeTab === "all" ? (
                      <p className="text-muted-foreground">
                        You haven't created any posts yet. Create your first post to share your experience.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No {activeTab} posts found. Try checking other categories or create a new post.
                      </p>
                    )}
                    <Button asChild className="mt-4">
                      <Link href="/user/create-post">
                        <a>Create New Post</a>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Stats</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {post.imageUrl ? (
                                    <img
                                      src={post.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium truncate max-w-[200px] md:max-w-[300px]">{post.title}</div>
                                  <div className="flex flex-wrap items-center mt-1 gap-1">
                                    {post.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag.id} variant="outline" className="text-xs">
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {post.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{post.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(post.status)}
                              {post.status === "rejected" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-7 text-xs"
                                  onClick={() => viewRejectionReason(post)}
                                >
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Why?
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Eye className="mr-1 h-3 w-3" />
                                  {post.views}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <ThumbsUp className="mr-1 h-3 w-3" />
                                  {post.upvotes}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  {post.commentCount}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {post.status === "published" && (
                                    <DropdownMenuItem asChild>
                                      <a 
                                        href={`/post/${post.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center"
                                      >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {post.status !== "pending" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/user/edit-post/${post.id}`}>
                                        <a className="flex items-center">
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit
                                        </a>
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPost(post);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium">{selectedPost?.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {selectedPost?.content}
              </p>
            </div>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Rejection Reason Dialog */}
        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Post Rejection Reason</DialogTitle>
              <DialogDescription>
                This post was rejected by a moderator for the following reason:
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                {selectedPost?.rejectionReason || "No specific reason provided. Your post may have violated community guidelines."}
              </p>
            </div>
            <div className="mt-2 text-sm">
              <p>You can:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Edit your post to address the issues</li>
                <li>Create a new post that follows the guidelines</li>
                <li>Contact a moderator for clarification</li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsRejectionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </UserLayout>
    </UserGuard>
  );
};

export default UserPosts;