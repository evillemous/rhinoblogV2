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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, Clock, Reply, ExternalLink, 
  MessageSquare, ThumbsUp, Star, CheckCircle
} from "lucide-react";

// Types for comments data
interface PostInfo {
  id: number;
  title: string;
}

interface CommentInfo {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  post: PostInfo;
  parentId?: number;
  replies?: CommentInfo[];
}

// Form schema for replies
const replyFormSchema = z.object({
  content: z.string().min(3, {
    message: "Reply must be at least 3 characters.",
  }),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

const ContributorComments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("received");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentInfo | null>(null);

  // Initialize form
  const replyForm = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch comments
  const { data: postComments, isLoading: isCommentsLoading } = useQuery<{
    receivedComments: CommentInfo[];
    yourComments: CommentInfo[];
  }>({
    queryKey: ["/api/contributor/comments"],
    // This is a mock endpoint, in a real app you'd have this implemented
    // For demo, we'll transform data from the content endpoint
  });

  // Create comment reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({
      content,
      postId,
      parentId,
    }: {
      content: string;
      postId: number;
      parentId: number;
    }) => {
      const res = await apiRequest("POST", "/api/comments", {
        content,
        postId,
        userId: user?.id,
        parentId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/comments"] });
      setReplyDialogOpen(false);
      replyForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Reply Failed",
        description: error.message || "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle reply submission
  const onReplySubmit = (data: ReplyFormValues) => {
    if (selectedComment) {
      replyMutation.mutate({
        content: data.content,
        postId: selectedComment.post.id,
        parentId: selectedComment.id,
      });
    }
  };

  // Open reply dialog
  const handleReply = (comment: CommentInfo) => {
    setSelectedComment(comment);
    setReplyDialogOpen(true);
  };

  // Group comments by post for the received tab
  const getGroupedComments = () => {
    if (!postComments?.receivedComments) return {};

    return postComments.receivedComments.reduce<Record<number, CommentInfo[]>>((acc, comment) => {
      const postId = comment.post.id;
      if (!acc[postId]) {
        acc[postId] = [];
      }
      acc[postId].push(comment);
      return acc;
    }, {});
  };

  const groupedComments = getGroupedComments();

  return (
    <ContributorGuard>
      <ContributorLayout title="Comment Management">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Engagement</h1>
          <p className="text-muted-foreground">
            Manage comments and interact with your audience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="received" className="relative">
              Comments on Your Posts
              <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {postComments?.receivedComments?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="your">
              Your Comments
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {postComments?.yourComments?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="saved">Saved Questions</TabsTrigger>
          </TabsList>

          {/* Comments on Your Posts Tab */}
          <TabsContent value="received">
            {isCommentsLoading ? (
              <div className="text-center py-8">Loading comments...</div>
            ) : !postComments?.receivedComments || postComments.receivedComments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No comments yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-1">
                    Your posts haven't received any comments yet. As you build your audience, 
                    you'll see engagement here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedComments).map(([postId, comments]) => (
                  <Card key={postId}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base font-medium">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {comments[0].post.title}
                      </CardTitle>
                      <CardDescription>
                        {comments.length} comment{comments.length !== 1 ? "s" : ""} on this post
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="p-3 border rounded-md">
                            <div className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.avatarUrl || ""} />
                                <AvatarFallback>
                                  {comment.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{comment.user.username}</div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {format(new Date(comment.createdAt), "MMM d, yyyy")}
                                  </div>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                                <div className="pt-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-xs"
                                    onClick={() => handleReply(comment)}
                                  >
                                    <Reply className="mr-1 h-3 w-3" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Show replies if they exist */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-11 mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="p-2 bg-muted/50 rounded-md">
                                    <div className="flex space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={reply.user.avatarUrl || ""} />
                                        <AvatarFallback className="text-xs">
                                          {reply.user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-1">
                                          <span className="text-xs font-medium">{reply.user.username}</span>
                                          {reply.user.id === user?.id && (
                                            <Badge variant="outline" className="h-4 text-[10px]">You</Badge>
                                          )}
                                        </div>
                                        <p className="text-xs mt-1">{reply.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Your Comments Tab */}
          <TabsContent value="your">
            {isCommentsLoading ? (
              <div className="text-center py-8">Loading your comments...</div>
            ) : !postComments?.yourComments || postComments.yourComments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No comments made</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-1">
                    You haven't commented on any posts yet. Engage with the community by 
                    commenting on other posts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comment</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postComments.yourComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="max-w-xs truncate">{comment.content}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate font-medium">{comment.post.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(comment.createdAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              // In a real app, this would navigate to the post
                              toast({
                                title: "View Post",
                                description: `Navigating to "${comment.post.title}"`,
                              });
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View Post</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Saved Questions Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Questions</CardTitle>
                <CardDescription>
                  Questions from users that you've marked to address later
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-1">
                  The ability to save important questions for later response is coming soon. 
                  Check back for this feature in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reply to Comment</DialogTitle>
            </DialogHeader>
            {selectedComment && (
              <div className="border rounded-md p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedComment.user.avatarUrl || ""} />
                    <AvatarFallback>
                      {selectedComment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{selectedComment.user.username}</span>
                </div>
                <p className="mt-2 text-sm">{selectedComment.content}</p>
              </div>
            )}
            <Form {...replyForm}>
              <form onSubmit={replyForm.handleSubmit(onReplySubmit)} className="space-y-4">
                <FormField
                  control={replyForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your reply here..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={replyMutation.isPending}>
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </ContributorLayout>
    </ContributorGuard>
  );
};

export default ContributorComments;