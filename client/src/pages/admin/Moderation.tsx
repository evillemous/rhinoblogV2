import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  // Mock data for flagged posts - in a real app, these would be fetched from API
  const flaggedPosts = [
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
  ];

  // Mock data for flagged comments
  const flaggedComments = [
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
  ];

  // Mock data for recent unverified user posts
  const unverifiedPosts = [
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
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Content Moderation">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Moderation Queue</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter Options
            </Button>
          </div>

          <Tabs defaultValue="flagged-posts" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flagged-posts" className="relative">
                Flagged Posts
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2" variant="destructive">
                  {flaggedPosts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged-comments" className="relative">
                Flagged Comments
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2" variant="destructive">
                  {flaggedComments.length}
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
                      {flaggedPosts.map((post) => (
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
                              <Button variant="ghost" size="icon" title="Approve">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Reject">
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
                      {flaggedComments.map((comment) => (
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
                              <Button variant="ghost" size="icon" title="Approve">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Reject">
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
                              <Button variant="ghost" size="icon" title="Approve">
                                <CheckCircle className="h-4 w-4 text-green-500" />
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