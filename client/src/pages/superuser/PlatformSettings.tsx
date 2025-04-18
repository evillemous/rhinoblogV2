import { useState } from "react";
import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Check, AlertCircle, Upload } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Tag Management Component
const TagManagement = () => {
  const { toast } = useToast();
  const [tagToDelete, setTagToDelete] = useState<{ id: number; name: string } | null>(null);
  
  // Form schema
  const tagFormSchema = z.object({
    name: z.string().min(2, "Tag name must be at least 2 characters"),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color code"),
  });
  
  type TagFormValues = z.infer<typeof tagFormSchema>;
  
  // Initialize form
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6", // Default blue
    },
  });
  
  // Fetch tags
  const { 
    data: tags, 
    isLoading: isLoadingTags,
    refetch: refetchTags
  } = useQuery({
    queryKey: ['/api/tags'],
    refetchInterval: false
  });
  
  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (data: TagFormValues) => {
      const res = await apiRequest("POST", "/api/admin/tags", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tag Created",
        description: "Tag has been created successfully",
      });
      refetchTags();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    }
  });
  
  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/tags/${tagId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tag Deleted",
        description: "Tag has been deleted successfully",
      });
      refetchTags();
      setTagToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete tag",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: TagFormValues) => {
    createTagMutation.mutate(data);
  };
  
  const handleDeleteTag = (id: number) => {
    deleteTagMutation.mutate(id);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
          <CardDescription>
            Create, edit, and delete tags used for categorizing content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag Name</FormLabel>
                        <FormControl>
                          <Input placeholder="recovery" {...field} />
                        </FormControl>
                        <FormDescription>
                          Short descriptive name for the tag
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-12 h-8 p-1" />
                          </FormControl>
                          <Input {...field} placeholder="#3b82f6" className="flex-1" />
                        </div>
                        <FormDescription>
                          Choose a color for this tag
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    disabled={createTagMutation.isPending || !form.formState.isDirty}
                  >
                    {createTagMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Tag"}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-medium">Existing Tags</h3>
              {isLoadingTags ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : tags && tags.length > 0 ? (
                <div className="space-y-2">
                  {tags.map((tag: any) => (
                    <div key={tag.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center">
                        <div 
                          className="mr-2 h-4 w-4 rounded-full" 
                          style={{ backgroundColor: tag.color || '#3b82f6' }} 
                        />
                        <span>{tag.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={deleteTagMutation.isPending && tagToDelete?.id === tag.id}
                      >
                        {deleteTagMutation.isPending && tagToDelete?.id === tag.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : "Delete"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-gray-500">No tags found</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Featured Posts Settings</CardTitle>
          <CardDescription>
            Configure how featured posts are displayed and rotated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rotation-interval">Rotation Interval</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger id="rotation-interval">
                    <SelectValue placeholder="Select rotation interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  How often featured posts should be automatically rotated
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="featured-count">Number of Featured Posts</Label>
                <Input id="featured-count" type="number" defaultValue="3" min="1" max="10" />
                <p className="text-xs text-gray-500">
                  How many posts should be featured at once
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="auto-feature-popular" />
              <Label htmlFor="auto-feature-popular">Automatically feature popular posts</Label>
            </div>
            
            <div className="flex justify-end">
              <Button>Save Feature Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>
            Upload and manage site branding elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input id="site-title" defaultValue="RhinoplastyBlogs" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea 
                  id="site-description" 
                  defaultValue="A community for sharing rhinoplasty experiences and information"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center justify-center h-32 rounded-md border border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="mt-2">
                      <Button variant="outline" size="sm">Upload Logo</Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      SVG, PNG, or JPG (max. 2MB)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center justify-center h-24 rounded-md border border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <Button variant="outline" size="sm">Upload Favicon</Button>
                    <p className="mt-1 text-xs text-gray-500">
                      ICO, PNG (32x32)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-3">
          <Button>Save Branding Settings</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>
            Enable maintenance mode to temporarily take the site offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="text-base">Enable Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                When enabled, all users except superadmins will see a maintenance page
              </p>
            </div>
            <Switch id="maintenance-mode" />
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea 
              id="maintenance-message" 
              placeholder="We're currently performing some maintenance. Please check back later."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-3">
          <Button>Save Maintenance Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const PlatformSettings = () => {
  return (
    <SuperAdminGuard>
      <SuperuserLayout title="Platform Settings">
        <TagManagement />
      </SuperuserLayout>
    </SuperAdminGuard>
  );
};

export default PlatformSettings;