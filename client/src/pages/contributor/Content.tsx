import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ContributorGuard from "@/lib/guards/ContributorGuard";
import ContributorLayout from "@/components/contributor/ContributorLayout";
import { PostWithTags, Tag } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PlusCircle, FileText, Clock, Eye, MoreHorizontal, Edit, Trash2, 
  MessageCircle, ThumbsUp, BarChart3, Image, ExternalLink
} from "lucide-react";

// Form schema for creating a new post
const postFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid image URL.",
  }).optional().nullable(),
  tags: z.array(z.number()).optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

const ContributorContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithTags | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Initialize form
  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      tags: [],
    },
  });

  // Fetch contributor's posts
  const { data: contentData, isLoading: isContentLoading } = useQuery<any>({
    queryKey: ["/api/contributor/content"],
    enabled: !!user,
  });

  // Fetch all available tags
  const { data: tagsData, isLoading: isTagsLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      const res = await apiRequest("POST", "/api/posts", {
        ...data,
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/content"] });
      setIsCreateDialogOpen(false);
      postForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: PostFormValues & { id: number }) => {
      const { id, ...postData } = data;
      const res = await apiRequest("PATCH", `/api/posts/${id}`, postData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Updated",
        description: "Your post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/content"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/posts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/content"] });
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onCreateSubmit = (data: PostFormValues) => {
    createPostMutation.mutate({
      ...data,
      tags: selectedTags,
    });
  };

  const onEditSubmit = (data: PostFormValues) => {
    if (selectedPost) {
      updatePostMutation.mutate({
        ...data,
        id: selectedPost.id,
        tags: selectedTags,
      });
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        if (prev.length < 5) { // Limit to 5 tags
          return [...prev, tagId];
        }
        
        toast({
          title: "Tag Limit Reached",
          description: "You can only select up to 5 tags per post.",
          variant: "destructive",
        });
        
        return prev;
      }
    });
  };

  const handleEditPost = (post: PostWithTags) => {
    setSelectedPost(post);
    postForm.reset({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || "",
    });
    setSelectedTags(post.tags?.map(tag => tag.id) || []);
    setIsEditDialogOpen(true);
  };

  const handleDeletePost = (post: PostWithTags) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  // Render the posts table
  const renderPostsTable = () => {
    if (isContentLoading) {
      return <div className="text-center py-8">Loading your content...</div>;
    }

    const posts = contentData?.posts || [];

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No posts yet</h3>
          <p className="text-muted-foreground">
            Create your first post to share your experience and insights.
          </p>
          <Button
            onClick={() => {
              postForm.reset();
              setSelectedTags([]);
              setIsCreateDialogOpen(true);
            }}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post: any) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-start space-x-3">
                    {post.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium truncate max-w-[300px]">{post.title}</div>
                      <div className="flex items-center mt-1 space-x-1">
                        {post.tags?.slice(0, 3).map((tag: Tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {post.tags?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="mr-1 h-3 w-3" />
                      {post.analytics?.views || 0}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ThumbsUp className="mr-1 h-3 w-3" />
                      {post.upvotes || 0}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageCircle className="mr-1 h-3 w-3" />
                      {post.commentCount || 0}
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
                      <DropdownMenuItem
                        asChild
                      >
                        <a href={`/post/${post.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePost(post)}
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
    );
  };

  return (
    <ContributorGuard>
      <ContributorLayout title="Content Hub">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Content</h1>
            <p className="text-muted-foreground">
              Manage your posts and track their performance
            </p>
          </div>
          <Button
            onClick={() => {
              postForm.reset();
              setSelectedTags([]);
              setIsCreateDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="posts" className="relative">
              Posts
              <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {contentData?.posts?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {renderPostsTable()}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>
                  Overview of how your content is performing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Views</div>
                    <div className="text-2xl font-bold">{contentData?.summary?.totalViews || 0}</div>
                    <div className="text-xs text-muted-foreground">
                      Across {contentData?.totalPosts || 0} posts
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Upvotes</div>
                    <div className="text-2xl font-bold">{contentData?.summary?.totalUpvotes || 0}</div>
                    <div className="text-xs text-muted-foreground">
                      Community appreciation
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Comments</div>
                    <div className="text-2xl font-bold">{contentData?.summary?.totalComments || 0}</div>
                    <div className="text-xs text-muted-foreground">
                      User engagement
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Top Performing Posts</h3>
                  {isContentLoading ? (
                    <div className="text-center py-4">Loading analytics...</div>
                  ) : (contentData?.posts?.length || 0) === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No posts to analyze yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...(contentData?.posts || [])]
                        .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
                        .slice(0, 3)
                        .map((post: any) => (
                          <div key={post.id} className="flex items-start space-x-3 p-3 border rounded-md">
                            <div className="flex-shrink-0 h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                              {post.imageUrl ? (
                                <img
                                  src={post.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{post.title}</h4>
                              <div className="flex items-center mt-1">
                                <BarChart3 className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Posted {format(new Date(post.createdAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-sm font-medium">{post.analytics?.views || 0}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Views</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <ThumbsUp className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-sm font-medium">{post.upvotes || 0}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Upvotes</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-sm font-medium">{post.commentCount || 0}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Comments</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Post Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Share your knowledge and experience with the community
              </DialogDescription>
            </DialogHeader>
            <Form {...postForm}>
              <form onSubmit={postForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                <FormField
                  control={postForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={postForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share your experience, insights, and advice in detail
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={postForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://image-url.com/your-image.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Add a featured image to make your post stand out
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Tags (Select up to 5)</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isTagsLoading ? (
                      <div>Loading tags...</div>
                    ) : (
                      tagsData?.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Update your post content and details
              </DialogDescription>
            </DialogHeader>
            <Form {...postForm}>
              <form onSubmit={postForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={postForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={postForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={postForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://image-url.com/your-image.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Add a featured image to make your post stand out
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Tags (Select up to 5)</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isTagsLoading ? (
                      <div>Loading tags...</div>
                    ) : (
                      tagsData?.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updatePostMutation.isPending}>
                    {updatePostMutation.isPending ? "Updating..." : "Update Post"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-md mt-2">
              <h3 className="font-medium">{selectedPost?.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {selectedPost?.content}
              </p>
            </div>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
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
      </ContributorLayout>
    </ContributorGuard>
  );
};

export default ContributorContent;