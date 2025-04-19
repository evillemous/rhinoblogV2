import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus,
  Edit,
  Trash2,
  LinkIcon,
  Hash,
  FileText,
  ArrowRight,
  Check,
  MoreHorizontal,
  Save,
  X,
  Merge
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TagsManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tags");
  
  // Mock data for tags - in a real app, these would be fetched from API
  const tags = [
    { id: 1, name: "recovery", color: "blue", postsCount: 45, usage: "high" },
    { id: 2, name: "before-after", color: "green", postsCount: 32, usage: "high" },
    { id: 3, name: "surgeon-recommendations", color: "purple", postsCount: 18, usage: "medium" },
    { id: 4, name: "cost", color: "orange", postsCount: 27, usage: "high" },
    { id: 5, name: "nose-tip", color: "red", postsCount: 15, usage: "medium" },
    { id: 6, name: "swelling", color: "yellow", postsCount: 23, usage: "medium" },
    { id: 7, name: "breathing", color: "cyan", postsCount: 12, usage: "low" },
    { id: 8, name: "revision", color: "pink", postsCount: 9, usage: "low" },
    { id: 9, name: "healing-timeline", color: "teal", postsCount: 21, usage: "medium" },
  ];
  
  // Mock data for tag duplicates
  const duplicateTags = [
    { 
      primary: "recovery", 
      duplicates: ["recovery-process", "post-op-recovery", "healing"], 
      postsAffected: 23 
    },
    { 
      primary: "surgeon", 
      duplicates: ["surgeons", "doctor", "specialist"], 
      postsAffected: 17 
    },
    { 
      primary: "cost", 
      duplicates: ["price", "pricing", "expenses", "finance"], 
      postsAffected: 31 
    },
    { 
      primary: "swelling", 
      duplicates: ["post-op-swelling", "inflammation"], 
      postsAffected: 12 
    },
  ];
  
  // Mock data for tag relationships
  const tagRelationships = [
    { 
      tag: "recovery", 
      relatedTags: ["swelling", "pain-management", "healing-timeline"] 
    },
    { 
      tag: "before-after", 
      relatedTags: ["results", "expectation", "satisfaction"] 
    },
    { 
      tag: "surgeon-recommendations", 
      relatedTags: ["reviews", "certification", "consultations"] 
    },
    { 
      tag: "cost", 
      relatedTags: ["insurance", "financing", "worth-it"] 
    },
  ];

  const filteredTags = tags.filter((tag) => {
    if (searchQuery) {
      return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleEditTag = (tag: any) => {
    setSelectedTag(tag);
    setIsEditDialogOpen(true);
  };

  const handleMergeTag = (tagGroup: any) => {
    setSelectedTag(tagGroup);
    setIsMergeDialogOpen(true);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Tag & Content Taxonomy">
        <div className="space-y-4">
          <Tabs defaultValue="tags" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tags">Tag Management</TabsTrigger>
              <TabsTrigger value="duplicates">Duplicate Tags</TabsTrigger>
              <TabsTrigger value="relations">Tag Relationships</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tags">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tag Management</CardTitle>
                    <CardDescription>
                      Create, edit, and manage content tags
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Tag</DialogTitle>
                        <DialogDescription>
                          Add a new tag for categorizing content
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tag-name">Tag Name</Label>
                          <Input id="tag-name" placeholder="e.g., recovery-tips" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tag-color">Tag Color</Label>
                          <Select defaultValue="blue">
                            <SelectTrigger id="tag-color">
                              <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="yellow">Yellow</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="pink">Pink</SelectItem>
                              <SelectItem value="orange">Orange</SelectItem>
                              <SelectItem value="teal">Teal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tag-description">Description (Optional)</Label>
                          <Textarea 
                            id="tag-description" 
                            placeholder="Brief description of what content this tag represents"
                            className="h-20"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Tag</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      placeholder="Search tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Tag Name</div>
                      <div className="col-span-2">Color</div>
                      <div className="col-span-2">Usage</div>
                      <div className="col-span-2">Posts</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    <div className="divide-y">
                      {filteredTags.map((tag) => (
                        <div key={tag.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-4 font-medium flex items-center">
                            <Hash className={`h-4 w-4 mr-1 text-${tag.color}-500`} />
                            {tag.name}
                          </div>
                          <div className="col-span-2">
                            <Badge className={`bg-${tag.color}-100 text-${tag.color}-800 hover:bg-${tag.color}-100`}>
                              {tag.color}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            {tag.usage === 'high' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">High</Badge>
                            )}
                            {tag.usage === 'medium' && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>
                            )}
                            {tag.usage === 'low' && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">Low</Badge>
                            )}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                              {tag.postsCount}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Edit" 
                                onClick={() => handleEditTag(tag)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="View Posts">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Tag
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Merge className="mr-2 h-4 w-4" />
                                    Find Duplicates
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Edit Relations
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hide Tag
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
            
            <TabsContent value="duplicates">
              <Card>
                <CardHeader>
                  <CardTitle>Duplicate Tag Management</CardTitle>
                  <CardDescription>
                    Identify and merge similar tags to improve content organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {duplicateTags.map((group, i) => (
                      <div key={i} className="rounded border p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Primary Tag:</span>
                            <Badge className="bg-blue-100 text-blue-800">#{group.primary}</Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMergeTag(group)}
                          >
                            <Merge className="h-4 w-4 mr-1" />
                            Merge All
                          </Button>
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm font-medium mr-2">Duplicates:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {group.duplicates.map((dupe, j) => (
                              <Badge key={j} variant="outline">#{dupe}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mt-3">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{group.postsAffected}</span> posts will be affected
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 px-2">View Posts</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="relations">
              <Card>
                <CardHeader>
                  <CardTitle>Tag Relationships</CardTitle>
                  <CardDescription>
                    Configure recommended related tags to improve user navigation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {tagRelationships.map((relation, i) => (
                      <div key={i} className="rounded border p-4">
                        <div className="mb-3">
                          <span className="font-medium">When viewing: </span>
                          <Badge className="bg-blue-100 text-blue-800">#{relation.tag}</Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center mb-2">
                            <ArrowRight className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="font-medium">Also suggest:</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-6">
                            {relation.relatedTags.map((tag, j) => (
                              <div key={j} className="flex items-center">
                                <Badge variant="outline">#{tag}</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="h-7">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Tag
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            Save Relations
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Edit Tag Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update this tag's properties
              </DialogDescription>
            </DialogHeader>
            {selectedTag && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tag-name">Tag Name</Label>
                  <Input id="edit-tag-name" defaultValue={selectedTag.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tag-color">Tag Color</Label>
                  <Select defaultValue={selectedTag.color}>
                    <SelectTrigger id="edit-tag-color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="teal">Teal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tag-description">Description</Label>
                  <Textarea 
                    id="edit-tag-description" 
                    placeholder="Brief description of what content this tag represents"
                    className="h-20"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Merge Tags Dialog */}
        <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Merge Duplicate Tags</DialogTitle>
              <DialogDescription>
                Combine duplicate tags into a single tag
              </DialogDescription>
            </DialogHeader>
            {selectedTag && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-medium">Primary Tag</Label>
                  <div className="flex items-center p-2 rounded border">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <Badge className="bg-blue-100 text-blue-800">#{selectedTag.primary}</Badge>
                    <span className="ml-2 text-muted-foreground text-sm">
                      (Will be preserved)
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Tags to Merge</Label>
                  <div className="flex flex-col gap-2">
                    {selectedTag.duplicates.map((dupe: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center">
                          <Badge variant="outline">#{dupe}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7">
                          <X className="h-4 w-4 mr-1" />
                          Exclude
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="rounded-md bg-amber-50 p-3 text-amber-800 text-sm">
                  <p>
                    <b>Warning:</b> This will update all posts using duplicate tags to use the primary tag.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMergeDialogOpen(false)}>Cancel</Button>
              <Button>
                <Merge className="h-4 w-4 mr-1" />
                Merge Tags
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default TagsManagementPage;