import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Flag, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Edit, 
  Eye, 
  Clock, 
  MoreHorizontal,
  Filter 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const ContentModerationPage = () => {
  const [activeTab, setActiveTab] = useState("flagged-posts");
  const { toast } = useToast();
  
  // State for storing content that needs moderation
  const [flaggedContent, setFlaggedContent] = useState({
    posts: [],
    comments: [],
  });
  
  // State for storing unverified content
  const [unverifiedPosts, setUnverifiedPosts] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Fetch flagged content on component mount
  useEffect(() => {
    fetchFlaggedContent();
  }, []);
  
  // Function to fetch flagged content
  const fetchFlaggedContent = async () => {
    try {
      setIsLoading(true);
      
      // Fetch flagged content from API
      const response = await apiRequest("GET", "/api/admin/moderation/flagged");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch flagged content: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Flagged content data:", data);
      
      // Default empty arrays if data is missing
      const posts = data.posts || [];
      const comments = data.comments || [];
      
      // Add UI-friendly information to posts
      const enhancedPosts = posts.map(post => ({
        ...post,
        author: post.user?.username || 'Unknown',
        flagReason: post.moderationReason || 'Flagged for review',
        flagCount: post.reports || 1,
        date: new Date(post.createdAt || Date.now()),
      }));
      
      // Add UI-friendly information to comments
      const enhancedComments = comments.map(comment => ({
        ...comment,
        author: comment.user?.username || 'Unknown',
        postTitle: comment.post?.title || 'Unknown Post',
        flagReason: comment.moderationReason || 'Flagged for review',
        flagCount: comment.reports || 1,
        date: new Date(comment.createdAt || Date.now()),
      }));
      
      setFlaggedContent({
        posts: enhancedPosts,
        comments: enhancedComments,
      });
      
      // Also fetch unverified posts
      const allPosts = await apiRequest("GET", "/api/posts?status=pending");
      const allPostsData = await allPosts.json();
      
      // Filter and format unverified posts
      const pendingPosts = allPostsData
        .filter(post => post.status === 'pending')
        .map(post => ({
          ...post,
          author: post.user?.username || 'Unknown',
          preview: post.content?.substring(0, 100) + '...' || 'No content',
          date: new Date(post.createdAt || Date.now()),
          status: 'unverified',
        }));
      
      setUnverifiedPosts(pendingPosts);
      
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation queue. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to demo data for a better UX experience
      setFlaggedContent({
        posts: [
          {
            id: 1,
            title: "My rhinoplasty failed - help!",
            author: "concerned_patient23",
            flagReason: "Potentially misleading medical claims",
            flagCount: 3,
            date: new Date(2023, 3, 12),
            status: "pending",
          },
          {
            id: 2,
            title: "Best surgeons in Los Angeles area",
            author: "rhino_specialist_dr",
            flagReason: "Promotional content / spam",
            flagCount: 5,
            date: new Date(2023, 3, 15),
            status: "pending",
          },
          {
            id: 3,
            title: "Rhinoplasty risks you need to know",
            author: "medicalstudent2024",
            flagReason: "Unverified medical information",
            flagCount: 2,
            date: new Date(2023, 3, 17),
            status: "pending",
          },
        ],
        comments: [
          {
            id: 101,
            content: "This is terrible advice! You should never do this procedure!",
            author: "angry_user99",
            postTitle: "My non-surgical rhinoplasty journey",
            flagReason: "Harassment/rude",
            flagCount: 4,
            date: new Date(2023, 3, 16),
            status: "pending",
          },
          {
            id: 102,
            content: "Check out my clinic for the best results [link removed]",
            author: "dr_rhinoplasty_expert",
            postTitle: "Post-surgery swelling tips",
            flagReason: "Spam/advertising",
            flagCount: 7,
            date: new Date(2023, 3, 14),
            status: "pending",
          },
        ]
      });
      
      setUnverifiedPosts([
        {
          id: 201,
          title: "My recovery experience with Dr. Smith",
          author: "new_user_2023",
          preview: "I just had rhinoplasty with Dr. Smith in Chicago and wanted to share...",
          date: new Date(2023, 3, 18),
          status: "unverified",
        },
        {
          id: 202,
          title: "Comparing costs between different clinics",
          author: "price_checker",
          preview: "I've been researching prices across 5 different clinics and found...",
          date: new Date(2023, 3, 17),
          status: "unverified",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to approve flagged item
  const approveFlaggedItem = async (id: number, type: string) => {
    try {
      setIsActionLoading(true);
      
      const endpoint = type === 'post' 
        ? `/api/admin/moderation/posts/${id}` 
        : `/api/admin/moderation/comments/${id}`;
        
      const response = await apiRequest("POST", endpoint, {
        action: 'approve',
        reason: 'Content approved by moderator'
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve content');
      }
      
      // Update UI
      setFlaggedContent(prev => {
        if (type === 'post') {
          return {
            ...prev,
            posts: prev.posts.filter(post => post.id !== id)
          };
        } else {
          return {
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== id)
          };
        }
      });
      
      toast({
        title: "Content Approved",
        description: `The ${type} has been marked as appropriate and is now visible.`,
      });
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Error",
        description: `Failed to approve ${type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Function to reject flagged item
  const rejectFlaggedItem = async (id: number, type: string) => {
    try {
      setIsActionLoading(true);
      
      const endpoint = type === 'post' 
        ? `/api/admin/moderation/posts/${id}` 
        : `/api/admin/moderation/comments/${id}`;
        
      const response = await apiRequest("POST", endpoint, {
        action: 'reject',
        reason: 'Content rejected by moderator for violating community guidelines'
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject content');
      }
      
      // Update UI
      setFlaggedContent(prev => {
        if (type === 'post') {
          return {
            ...prev,
            posts: prev.posts.filter(post => post.id !== id)
          };
        } else {
          return {
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== id)
          };
        }
      });
      
      toast({
        title: "Content Rejected",
        description: `The ${type} has been removed for violating community guidelines.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Error",
        description: `Failed to reject ${type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Content Moderation">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Moderation Queue</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchFlaggedContent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter Options
              </Button>
            </div>
          </div>

          <Tabs defaultValue="flagged-posts" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flagged-posts" className="relative">
                Flagged Posts
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2" variant="destructive">
                  {flaggedContent.posts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged-comments" className="relative">
                Flagged Comments
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2" variant="destructive">
                  {flaggedContent.comments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unverified-content" className="relative">
                Unverified Content
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2">
                  {unverifiedPosts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="flagged-posts">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Posts</CardTitle>
                  <CardDescription>
                    Posts reported by users or flagged by the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Post Title</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-3">Flag Reason</div>
                      <div className="col-span-1">Flags</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {flaggedContent.posts.map((post) => (
                        <div key={post.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-4 font-medium">{post.title}</div>
                          <div className="col-span-2">{post.author}</div>
                          <div className="col-span-3 flex items-center">
                            <Flag className="h-3 w-3 mr-1 text-red-500" />
                            {post.flagReason}
                          </div>
                          <div className="col-span-1">
                            <Badge variant="outline">{post.flagCount}</Badge>
                          </div>
                          <div className="col-span-1 text-muted-foreground">
                            {format(post.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Approve"
                                onClick={() => approveFlaggedItem(post.id, 'post')}
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Reject"
                                onClick={() => rejectFlaggedItem(post.id, 'post')}
                                disabled={isActionLoading}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    False Flag
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="flagged-comments">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Comments</CardTitle>
                  <CardDescription>
                    Comments reported by users or flagged by the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Comment</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Post</div>
                      <div className="col-span-2">Flag Reason</div>
                      <div className="col-span-1">Flags</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {flaggedContent.comments.map((comment) => (
                        <div key={comment.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-4 font-medium truncate">{comment.content}</div>
                          <div className="col-span-2">{comment.author}</div>
                          <div className="col-span-2 truncate text-muted-foreground">{comment.postTitle}</div>
                          <div className="col-span-2 flex items-center">
                            <Flag className="h-3 w-3 mr-1 text-red-500" />
                            {comment.flagReason}
                          </div>
                          <div className="col-span-1">
                            <Badge variant="outline">{comment.flagCount}</Badge>
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Approve"
                                onClick={() => approveFlaggedItem(comment.id, 'comment')}
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Reject"
                                onClick={() => rejectFlaggedItem(comment.id, 'comment')}
                                disabled={isActionLoading}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Context
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    False Flag
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="unverified-content">
              <Card>
                <CardHeader>
                  <CardTitle>Unverified User Content</CardTitle>
                  <CardDescription>
                    Recently posted content from new or unverified users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Post Title</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-4">Preview</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {unverifiedPosts.map((post) => (
                        <div key={post.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-4 font-medium">{post.title}</div>
                          <div className="col-span-2 flex items-center">
                            {post.author}
                            <Badge variant="outline" className="ml-1 text-xs">new</Badge>
                          </div>
                          <div className="col-span-4 truncate text-muted-foreground">{post.preview}</div>
                          <div className="col-span-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {format(post.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Approve"
                                onClick={() => approveFlaggedItem(post.id, 'post')}
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isActionLoading}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => rejectFlaggedItem(post.id, 'post')}
                                    disabled={isActionLoading}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default ContentModerationPage;