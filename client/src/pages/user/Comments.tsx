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
  MessageSquare,
  Clock,
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

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  postId: number;
  postTitle: string;
  upvotes: number;
  downvotes: number;
  status: 'published' | 'removed' | 'flagged';
  moderationReason?: string;
}

// Mock API endpoint - replace with actual endpoint when available
const fetchUserComments = async (): Promise<{ 
  comments: Comment[],
  stats: { 
    total: number;
    published: number;
    removed: number;
    flagged: number;
  }
}> => {
  const res = await apiRequest("GET", "/api/user/comments");
  return await res.json();
};

const UserComments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch user comments
  const { data, isLoading } = useQuery({
    queryKey: ["/api/user/comments"],
    queryFn: fetchUserComments,
    enabled: !!user,
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/comments"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmDelete = () => {
    if (selectedComment) {
      deleteCommentMutation.mutate(selectedComment.id);
    }
  };

  // Filter comments based on active tab and search term
  const filteredComments = data?.comments
    .filter((comment) => {
      if (activeTab === "all") return true;
      if (activeTab === "published") return comment.status === "published";
      if (activeTab === "removed") return comment.status === "removed";
      if (activeTab === "flagged") return comment.status === "flagged";
      return true;
    })
    .filter((comment) => 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Sort comments by date (newest first)
  const sortedComments = [...filteredComments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Truncate comment content for display
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Get comment status badge
  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
    }
    if (status === "removed") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Removed</Badge>;
    }
    if (status === "flagged") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Flagged</Badge>;
    }
    return null;
  };

  return (
    <UserGuard>
      <UserLayout title="My Comments">
        <Card>
          <CardHeader>
            <CardTitle>My Comments</CardTitle>
            <CardDescription>
              View and manage your comments on posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="grid w-full md:w-auto grid-cols-4">
                  <TabsTrigger value="all" className="relative">
                    All
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.total || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="published" className="relative">
                    Published
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.published || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="flagged" className="relative">
                    Flagged
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.flagged || 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="removed" className="relative">
                    Removed
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{data?.stats.removed || 0}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
              
              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6">Loading your comments...</div>
                ) : sortedComments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No comments found</h3>
                    {activeTab === "all" ? (
                      <p className="text-muted-foreground">
                        You haven't commented on any posts yet. Join the conversation!
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No {activeTab} comments found. Try checking other categories.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Comment</TableHead>
                          <TableHead className="hidden md:table-cell">Post</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedComments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell>
                              <div className="font-medium max-w-[200px] md:max-w-[300px] whitespace-normal">
                                {truncateContent(comment.content)}
                              </div>
                              <div className="md:hidden mt-1 text-xs text-muted-foreground">
                                <Link href={`/post/${comment.postId}`}>{truncateContent(comment.postTitle, 50)}</Link>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Link href={`/post/${comment.postId}`}>
                                <a className="text-sm hover:underline max-w-[200px] truncate block">
                                  {comment.postTitle}
                                </a>
                              </Link>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(comment.createdAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(comment.status)}
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
                                      href={`/post/${comment.postId}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center"
                                    >
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      View Post
                                    </a>
                                  </DropdownMenuItem>
                                  
                                  {comment.status === "published" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/user/edit-comment/${comment.id}`}>
                                        <a className="flex items-center">
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit
                                        </a>
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedComment(comment);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="flex items-center text-red-600"
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
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your comment. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </UserLayout>
    </UserGuard>
  );
};

export default UserComments;