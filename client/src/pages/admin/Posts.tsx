import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  Pin, 
  Edit, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  Bot,
  User,
  Flag,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const PostsManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all-posts");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for posts - in a real app, these would be fetched from API with pagination
  const posts = [
    {
      id: 1,
      title: "My rhinoplasty recovery - one week update",
      author: "sarah_k",
      type: "human",
      date: new Date(2023, 3, 15),
      comments: 12,
      views: 432,
      tags: ["recovery", "progress", "swelling"],
      status: "published",
      isPinned: true,
    },
    {
      id: 2,
      title: "Choosing the right surgeon: What to look for",
      author: "ai_assistant",
      type: "ai",
      date: new Date(2023, 3, 14),
      comments: 8,
      views: 356,
      tags: ["surgeons", "recommendations", "research"],
      status: "published",
      isPinned: false,
    },
    {
      id: 3,
      title: "Post-surgery care tips that helped me",
      author: "mike_j",
      type: "human",
      date: new Date(2023, 3, 12),
      comments: 17,
      views: 521,
      tags: ["recovery", "tips", "care"],
      status: "published",
      isPinned: false,
    },
    {
      id: 4,
      title: "Was considering rhinoplasty, but changed my mind",
      author: "undecided2023",
      type: "human",
      date: new Date(2023, 3, 10),
      comments: 23,
      views: 678,
      tags: ["decision", "reflection", "alternatives"],
      status: "flagged",
      isPinned: false,
    },
    {
      id: 5,
      title: "Rhinoplasty cost breakdown by region",
      author: "ai_assistant",
      type: "ai",
      date: new Date(2023, 3, 8),
      comments: 5,
      views: 289,
      tags: ["cost", "finance", "comparison"],
      status: "published",
      isPinned: false,
    },
  ];

  // Mock data for comment threads
  const comments = [
    {
      id: 101,
      postId: 1,
      postTitle: "My rhinoplasty recovery - one week update",
      content: "Did you experience any breathing issues during the first week?",
      author: "curious_user",
      date: new Date(2023, 3, 16),
      replies: 3,
      status: "published",
    },
    {
      id: 102,
      postId: 2,
      postTitle: "Choosing the right surgeon: What to look for",
      content: "I'd also recommend checking their before/after portfolio specifically for cases similar to yours.",
      author: "experienced_patient",
      date: new Date(2023, 3, 15),
      replies: 5,
      status: "published",
    },
    {
      id: 103,
      postId: 3,
      postTitle: "Post-surgery care tips that helped me",
      content: "Did your doctor recommend any specific ointments for the incision sites?",
      author: "soon_to_be_patient",
      date: new Date(2023, 3, 14),
      replies: 2,
      status: "published",
    },
    {
      id: 104,
      postId: 4,
      postTitle: "Was considering rhinoplasty, but changed my mind",
      content: "This post is misleading. There's actually a lot of dangerous misinformation here about surgical risks.",
      author: "concerned_md",
      date: new Date(2023, 3, 12),
      replies: 7,
      status: "flagged",
    },
  ];

  // Mock data for duplicate tags that could be merged
  const duplicateTags = [
    { original: "recovery", duplicates: ["recovery-process", "recovering"] },
    { original: "surgeon", duplicates: ["surgeons", "doctor"] },
    { original: "cost", duplicates: ["pricing", "expenses", "fees"] },
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "ai":
        return <Bot className="h-4 w-4 text-purple-500" />;
      case "human":
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Published</Badge>;
      case "flagged":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Flagged</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Posts & Comments Management">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Content Management</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all-posts" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-posts">All Posts</TabsTrigger>
              <TabsTrigger value="ai-content">AI Content</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="tags">Tag Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-posts">
              <Card>
                <CardHeader>
                  <CardTitle>Post Management</CardTitle>
                  <CardDescription>
                    View, edit, and manage all posts on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Title</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Tags</div>
                      <div className="col-span-1">Comments</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {posts.map((post) => (
                        <div key={post.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-4 font-medium flex items-center">
                            {post.isPinned && <Pin className="h-3 w-3 mr-1 text-amber-500" />}
                            {getPostTypeIcon(post.type)}
                            <span className="ml-1">{post.title}</span>
                          </div>
                          <div className="col-span-2">{post.author}</div>
                          <div className="col-span-2 flex flex-wrap gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                              {post.comments}
                            </div>
                          </div>
                          <div className="col-span-1 text-muted-foreground">
                            {format(post.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            {getStatusBadge(post.status)}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" title="Edit">
                                <Edit className="h-4 w-4" />
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
                                    View Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Tags
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {post.isPinned ? (
                                      <>
                                        <Pin className="mr-2 h-4 w-4" />
                                        Unpin from Homepage
                                      </>
                                    ) : (
                                      <>
                                        <Pin className="mr-2 h-4 w-4" />
                                        Pin to Homepage
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  {post.status === "flagged" && (
                                    <DropdownMenuItem>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve Content
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Post
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
            
            <TabsContent value="ai-content">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Content</CardTitle>
                  <CardDescription>
                    View and manage AI-generated posts (editing not available)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Tags</div>
                      <div className="col-span-1">Views</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {posts.filter(post => post.type === "ai").map((post) => (
                        <div key={post.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-5 font-medium flex items-center">
                            <Bot className="h-4 w-4 mr-1 text-purple-500" />
                            {post.title}
                          </div>
                          <div className="col-span-2">
                            <Badge variant="secondary">AI Generated</Badge>
                          </div>
                          <div className="col-span-2 flex flex-wrap gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-1">
                            {post.views}
                          </div>
                          <div className="col-span-1 text-muted-foreground">
                            {format(post.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" title="View">
                                <Eye className="h-4 w-4" />
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
                                    View Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {post.isPinned ? (
                                      <>
                                        <Pin className="mr-2 h-4 w-4" />
                                        Unpin from Homepage
                                      </>
                                    ) : (
                                      <>
                                        <Pin className="mr-2 h-4 w-4" />
                                        Pin to Homepage
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hide from Site
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
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comment Threads</CardTitle>
                  <CardDescription>
                    View and moderate comment threads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between">
                      <Label htmlFor="comment-filter">Filter by:</Label>
                      <Select defaultValue="all">
                        <SelectTrigger id="comment-filter" className="w-40">
                          <SelectValue placeholder="Filter comments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Comments</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="spam">Potential Spam</SelectItem>
                          <SelectItem value="recent">Most Recent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="rounded-md border divide-y">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{comment.author}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(comment.date, "MMM d, yyyy")}
                                {comment.status === "flagged" && (
                                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">Flagged</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">View Thread</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View in Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Comment
                                  </DropdownMenuItem>
                                  {comment.status === "flagged" && (
                                    <>
                                      <DropdownMenuItem>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Comment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Flag className="mr-2 h-4 w-4" />
                                        Mark as False Flag
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Comment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="text-sm mb-2">"{comment.content}"</div>
                          
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <div>
                              On post: <span className="font-medium">{comment.postTitle}</span>
                            </div>
                            <div>
                              {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tags">
              <Card>
                <CardHeader>
                  <CardTitle>Tag Management</CardTitle>
                  <CardDescription>
                    Merge duplicate tags and manage content taxonomy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Duplicate Tag Detection</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We've detected potential duplicate tags that could be merged to improve content organization.
                      </p>
                      
                      <div className="space-y-3">
                        {duplicateTags.map((tagGroup, i) => (
                          <div key={i} className="rounded border p-3">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium">Primary Tag: </span>
                                <Badge className="ml-1">{tagGroup.original}</Badge>
                              </div>
                              <Button size="sm" variant="outline">Merge All</Button>
                            </div>
                            
                            <div className="text-sm">
                              <span>Duplicates: </span>
                              {tagGroup.duplicates.map((dupe) => (
                                <Badge key={dupe} variant="outline" className="mr-1 mb-1">
                                  {dupe}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="text-xs text-muted-foreground mt-2">
                              Merging will update all posts using duplicate tags to use the primary tag.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Tag Management</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tag-filter" className="mb-2 block">Filter tags:</Label>
                          <Input
                            id="tag-filter"
                            placeholder="Search tags..."
                            className="mb-2"
                          />
                          <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                            <div className="flex flex-wrap gap-1">
                              {["rhinoplasty", "nosejob", "recovery", "surgeons", "before-after", "revision", "cost", "swelling", "anesthesia", "breathing", "deviated-septum", "ethnic", "tip-work", "bridge", "consultation", "post-op"].map((tag) => (
                                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Related Tag Suggestions:</Label>
                          <div className="border rounded-md p-3 min-h-[10rem]">
                            <h4 className="text-sm font-medium mb-2">When users view "recovery" also suggest:</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="secondary">swelling</Badge>
                              <Badge variant="secondary">post-op</Badge>
                              <Badge variant="secondary">timeline</Badge>
                              <Badge variant="outline">+ Add Tag</Badge>
                            </div>
                            
                            <h4 className="text-sm font-medium mb-2">When users view "surgeons" also suggest:</h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary">consultation</Badge>
                              <Badge variant="secondary">certification</Badge>
                              <Badge variant="secondary">reviews</Badge>
                              <Badge variant="outline">+ Add Tag</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default PostsManagementPage;