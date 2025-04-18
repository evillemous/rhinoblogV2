import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Copy, 
  Edit, 
  Eye, 
  FileText, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Tag, 
  Trash2 
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Fetch posts data (simulated)
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
  } = useQuery({
    queryKey: ['/api/posts'],
    refetchInterval: false
  });
  
  // Fetch articles data (simulated)
  const { 
    data: articles, 
    isLoading: isLoadingArticles,
  } = useQuery({
    queryKey: ['/api/articles'],
    refetchInterval: false
  });
  
  // Delete post handler (simulated)
  const handleDeletePost = (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      console.log(`Deleting post ${id}`);
    }
  };
  
  return (
    <SuperAdminGuard>
      <SuperuserLayout title="Content Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
          
          <Tabs defaultValue="posts" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="posts">
                <FileText className="mr-2 h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="articles">
                <FileText className="mr-2 h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="topics">
                <Tag className="mr-2 h-4 w-4" />
                Topics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem>AI Generated</DropdownMenuItem>
                  <DropdownMenuItem>Published</DropdownMenuItem>
                  <DropdownMenuItem>Drafts</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <TabsContent value="posts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Community Posts</CardTitle>
                  <CardDescription>
                    Manage all user-generated and AI-generated posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPosts ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.isArray(posts) ? posts.map((post: any) => (
                            <TableRow key={post.id}>
                              <TableCell className="font-medium">{post.title}</TableCell>
                              <TableCell>{post.userId ? "admin" : "AI Generated"}</TableCell>
                              <TableCell>
                                {post.createdAt 
                                  ? format(new Date(post.createdAt), "MMM d, yyyy")
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    recovery
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Published
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
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
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600" 
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                Error loading post data
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-center">
                      <p className="text-gray-500">No posts found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="articles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Educational Articles</CardTitle>
                  <CardDescription>
                    Manage expert articles and educational content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 flex-col items-center justify-center text-center">
                    <p className="text-gray-500">No articles found</p>
                    <Button variant="outline" className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Educational Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="topics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Topics Management</CardTitle>
                  <CardDescription>
                    Manage topic categories for content organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 text-xl">👃</div>
                      <h3 className="font-bold">Rhinoplasty</h3>
                      <p className="text-sm text-gray-500 mt-1">General rhinoplasty discussions</p>
                      <div className="mt-4 flex justify-between">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">12 posts</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 text-xl">🏥</div>
                      <h3 className="font-bold">Surgery Types</h3>
                      <p className="text-sm text-gray-500 mt-1">Different rhinoplasty techniques</p>
                      <div className="mt-4 flex justify-between">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">8 posts</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4 flex items-center justify-center">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Topic
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Create Content Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Choose the type of content you want to create
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <Button 
                variant="outline" 
                className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-all hover:bg-gray-50"
                onClick={() => {
                  setShowCreateDialog(false);
                  // Navigate to post creation
                }}
              >
                <FileText className="mb-2 h-8 w-8 text-gray-500" />
                <div className="text-center">
                  <h3 className="font-medium">Community Post</h3>
                  <p className="text-xs text-gray-500">Create a new community post</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-all hover:bg-gray-50"
                onClick={() => {
                  setShowCreateDialog(false);
                  // Navigate to article creation
                }}
              >
                <FileText className="mb-2 h-8 w-8 text-gray-500" />
                <div className="text-center">
                  <h3 className="font-medium">Educational Article</h3>
                  <p className="text-xs text-gray-500">Create a new educational article</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-all hover:bg-gray-50"
                onClick={() => {
                  setShowCreateDialog(false);
                  // Navigate to AI generation
                }}
              >
                <FileText className="mb-2 h-8 w-8 text-gray-500" />
                <div className="text-center">
                  <h3 className="font-medium">AI Generated Post</h3>
                  <p className="text-xs text-gray-500">Generate content with AI</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-all hover:bg-gray-50"
                onClick={() => {
                  setShowCreateDialog(false);
                  // Navigate to topic creation
                }}
              >
                <Tag className="mb-2 h-8 w-8 text-gray-500" />
                <div className="text-center">
                  <h3 className="font-medium">New Topic</h3>
                  <p className="text-xs text-gray-500">Create a new topic category</p>
                </div>
              </Button>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SuperuserLayout>
    </SuperAdminGuard>
  );
};

export default ContentManagement;