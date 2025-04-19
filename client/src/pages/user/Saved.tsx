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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Bookmark,
  Clock,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedPost {
  id: number;
  postId: number;
  title: string;
  content: string;
  createdAt: string;
  savedAt: string;
  type: 'post' | 'article';
  author: {
    id: number;
    username: string;
    displayName?: string;
    role?: string;
    contributorType?: string;
  };
  commentCount: number;
  upvotes: number;
  imageUrl?: string;
  tags: { id: number; name: string; color: string }[];
}

interface SavedPostsStats {
  total: number;
  posts: number;
  articles: number;
}

// Mock API endpoint - replace with actual endpoint when available
const fetchSavedPosts = async (): Promise<{ 
  savedPosts: SavedPost[],
  stats: SavedPostsStats
}> => {
  const res = await apiRequest("GET", "/api/user/saved");
  return await res.json();
};

const UserSaved = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Fetch saved posts
  const { data, isLoading } = useQuery({
    queryKey: ["/api/user/saved"],
    queryFn: fetchSavedPosts,
    enabled: !!user,
  });

  // Remove saved post mutation
  const removeSavedPostMutation = useMutation({
    mutationFn: async (savedId: number) => {
      const res = await apiRequest("DELETE", `/api/user/saved/${savedId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved Item Removed",
        description: "The item has been removed from your saved collection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved"] });
      setIsRemoveDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmRemove = () => {
    if (selectedPost) {
      removeSavedPostMutation.mutate(selectedPost.id);
    }
  };

  // Filter saved posts based on active tab and search term
  const filteredPosts = data?.savedPosts
    .filter((post) => {
      if (activeTab === "all") return true;
      if (activeTab === "posts") return post.type === "post";
      if (activeTab === "articles") return post.type === "article";
      return true;
    })
    .filter((post) => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Sort saved posts by save date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  // Truncate content for display
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Get post type badge
  const getTypeBadge = (type: string) => {
    if (type === "post") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Post</Badge>;
    }
    if (type === "article") {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Article</Badge>;
    }
    return null;
  };

  return (
    <UserGuard>
      <UserLayout title="Saved Content">
        <Card>
          <CardHeader>
            <CardTitle>Saved Content</CardTitle>
            <CardDescription>
              Access your bookmarked posts and articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                  <TabsTrigger value="all" className="relative">
                    All
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.total || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="relative">
                    Posts
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.posts || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="relative">
                    Articles
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.articles || 0}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search saved content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
              
              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6">Loading saved content...</div>
                ) : sortedPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No saved content found</h3>
                    {activeTab === "all" ? (
                      <p className="text-muted-foreground">
                        You haven't saved any content yet. Save posts and articles to read later!
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No saved {activeTab} found. Try checking other categories.
                      </p>
                    )}
                    <Button asChild className="mt-4">
                      <Link href="/">
                        <a>Browse Content</a>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content</TableHead>
                          <TableHead className="hidden md:table-cell">Author</TableHead>
                          <TableHead className="hidden md:table-cell">Saved On</TableHead>
                          <TableHead>Type</TableHead>
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
                                  <div className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                                    {post.type === 'post' ? (
                                      <Link href={`/post/${post.postId}`}>{post.title}</Link>
                                    ) : (
                                      <Link href={`/article/${post.postId}`}>{post.title}</Link>
                                    )}
                                  </div>
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
                              <div className="text-sm">
                                {post.author.displayName || post.author.username}
                              </div>
                              {post.author.contributorType && (
                                <Badge variant="outline" className="text-xs">
                                  {post.author.contributorType}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(post.savedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(post.type)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center space-x-2">
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
                                  <DropdownMenuItem asChild>
                                    <a 
                                      href={post.type === 'post' ? `/post/${post.postId}` : `/article/${post.postId}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center"
                                    >
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      View 
                                    </a>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedPost(post);
                                      setIsRemoveDialogOpen(true);
                                    }}
                                    className="flex items-center text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove from Saved
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
        
        {/* Remove from Saved Confirmation Dialog */}
        <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Saved?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the item from your saved collection. You can always save it again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmRemove}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </UserLayout>
    </UserGuard>
  );
};

export default UserSaved;