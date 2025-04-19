import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import UserGuard from "@/lib/guards/UserGuard";
import UserLayout from "@/components/user/UserLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FileText, Image, Tag as TagIcon, Info, Check, AlertTriangle } from "lucide-react";

// Define the schema for post creation
const postFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(120, {
    message: "Title must not exceed 120 characters."
  }),
  content: z.string().min(200, {
    message: "Content must be at least 200 characters.",
  }).max(20000, {
    message: "Content must not exceed 20,000 characters."
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  topicId: z.number().optional(),
  tags: z.array(z.number()).min(1, {
    message: "Please select at least one tag.",
  }).max(5, {
    message: "You can select up to 5 tags.",
  }),
  consent: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and community guidelines."
  })
});

// Define the post form values type
type PostFormValues = z.infer<typeof postFormSchema>;

// Topic and Tag types
interface Topic {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

const UserCreatePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  
  // Get user trust score
  const trustScore = user?.trustScore || 0;
  const isPublishDirectly = trustScore >= 50;

  // Create form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      topicId: undefined,
      tags: [],
      consent: false
    },
  });

  // Fetch topics
  const { data: topics } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    enabled: !!user,
  });

  // Fetch tags
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    enabled: !!user,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      setIsSubmitting(true);
      const res = await apiRequest("POST", "/api/user/posts", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Post Created",
        description: isPublishDirectly 
          ? "Your post has been published successfully." 
          : "Your post has been submitted for review and will be published once approved.",
      });
      
      // Reset form after a brief delay
      setTimeout(() => {
        form.reset();
        setSelectedTags([]);
        queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
        
        // Navigate to posts page after success
        setTimeout(() => {
          navigate("/user/posts");
        }, 500);
      }, 2000);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle tag selection
  const handleTagSelect = (tagId: number) => {
    const tag = tags?.find(t => t.id === tagId);
    if (!tag) return;
    
    // Check if already selected
    if (selectedTags.some(t => t.id === tagId)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tagId));
      form.setValue("tags", form.getValues("tags").filter(id => id !== tagId));
    } else {
      // Check if max tags limit reached
      if (selectedTags.length >= 5) {
        toast({
          title: "Tag Limit Reached",
          description: "You can select up to 5 tags.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedTags([...selectedTags, tag]);
      form.setValue("tags", [...form.getValues("tags"), tagId]);
    }
  };

  // Form submission handler
  const onSubmit = (data: PostFormValues) => {
    createPostMutation.mutate(data);
  };
  
  // Character count helpers
  const contentLength = form.watch("content").length;
  const titleLength = form.watch("title").length;
  
  // Get tag color classes
  const getTagColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      red: "bg-red-100 text-red-800 hover:bg-red-200",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    };
    
    return colorMap[color] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <UserGuard>
      <UserLayout title="Create Post">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>
              Create a post to share your rhinoplasty journey or insights with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Post Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a descriptive title..." 
                          {...field} 
                          disabled={isSubmitting || isSuccess}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Make your title clear and engaging</span>
                        <span className={titleLength > 100 ? "text-orange-500" : ""}>
                          {titleLength}/120
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Post Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your experience, journey, or insights in detail..." 
                          className="min-h-[300px] resize-y"
                          {...field}
                          disabled={isSubmitting || isSuccess}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => setIsInfoDialogOpen(true)}
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Posting tips
                          </Button>
                        </span>
                        <span className={
                          contentLength < 200 
                            ? "text-red-500" 
                            : contentLength > 15000 
                              ? "text-orange-500" 
                              : ""
                        }>
                          {contentLength}/20,000 characters
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image URL..." 
                          {...field} 
                          value={field.value || ""}
                          disabled={isSubmitting || isSuccess}
                        />
                      </FormControl>
                      <FormDescription>
                        Add an image to your post to make it more engaging
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Topic */}
                <FormField
                  control={form.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic (Optional)</FormLabel>
                      <Select
                        disabled={isSubmitting || isSuccess}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics?.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.icon} {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categorize your post to help others find it
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Required)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <Badge
                                key={tag.id}
                                className={`${getTagColorClass(tag.color)} cursor-pointer`}
                                onClick={() => !isSubmitting && !isSuccess && handleTagSelect(tag.id)}
                              >
                                {tag.name} <span className="ml-1">×</span>
                              </Badge>
                            ))}
                            {selectedTags.length === 0 && (
                              <div className="text-sm text-muted-foreground">
                                No tags selected
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Available Tags:</div>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                              {tags?.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant={selectedTags.some(t => t.id === tag.id) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => !isSubmitting && !isSuccess && handleTagSelect(tag.id)}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select 1-5 tags that best describe your post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Consent Checkbox */}
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting || isSuccess}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the community guidelines
                        </FormLabel>
                        <FormDescription>
                          By submitting this post, you confirm that your content follows our 
                          <Button variant="link" className="h-auto p-0 ml-1" onClick={() => window.open('/guidelines', '_blank')}>
                            community guidelines
                          </Button>
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Trust Score Info */}
                <div className={`p-4 rounded-md ${isPublishDirectly ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex items-start">
                    {isPublishDirectly ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    )}
                    <div>
                      <h4 className={`text-sm font-medium ${isPublishDirectly ? 'text-green-800' : 'text-amber-800'}`}>
                        {isPublishDirectly ? 'Direct Publishing Enabled' : 'Post Will Be Reviewed'}
                      </h4>
                      <p className={`text-xs ${isPublishDirectly ? 'text-green-700' : 'text-amber-700'}`}>
                        {isPublishDirectly 
                          ? 'Your trust score allows your posts to be published immediately.' 
                          : `Your posts require approval from moderators before publishing. Build your trust score (currently ${trustScore}/50) to unlock direct publishing.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Submit Button */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/user/posts")}
                    disabled={isSubmitting || isSuccess}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess || !form.formState.isValid}
                    className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span> 
                        Submitting...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> 
                        {isPublishDirectly ? "Published" : "Submitted for Review"}
                      </>
                    ) : (
                      `${isPublishDirectly ? "Publish" : "Submit for Review"} Post`
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Tips Dialog */}
        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tips for a Great Post</DialogTitle>
              <DialogDescription>
                Follow these guidelines to create engaging content
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Structure Your Post
                </h4>
                <p className="text-sm text-muted-foreground">
                  Include an introduction, your journey/experience, and a conclusion. Break text into paragraphs for readability.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Use Relevant Tags
                </h4>
                <p className="text-sm text-muted-foreground">
                  Select specific tags that match your content to help others find your post.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Add Visual Content
                </h4>
                <p className="text-sm text-muted-foreground">
                  Include an image if appropriate to make your post more engaging (ensure you have rights to share any images).
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsInfoDialogOpen(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </UserLayout>
    </UserGuard>
  );
};

export default UserCreatePost;