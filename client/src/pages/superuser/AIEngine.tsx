import { useState } from "react";
import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, RefreshCw, Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Link } from "wouter";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Mock ScheduleForm component if it doesn't exist yet
const ScheduleForm = ({ currentSchedule }: { currentSchedule?: { enabled: boolean; cronExpression: string } }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schedule-enabled">Enable Scheduled Generation</Label>
        <div className="flex items-center space-x-2">
          <Switch id="schedule-enabled" defaultChecked={currentSchedule?.enabled} />
          <Label htmlFor="schedule-enabled">
            Automatically generate content on schedule
          </Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="schedule-frequency">Frequency</Label>
        <Select defaultValue={currentSchedule?.cronExpression || "0 12 * * *"}>
          <SelectTrigger id="schedule-frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0 12 * * *">Daily (12:00 PM)</SelectItem>
            <SelectItem value="0 12 * * 1">Weekly (Monday at 12:00 PM)</SelectItem>
            <SelectItem value="0 0 1 * *">Monthly (1st at 12:00 AM)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="post-count">Posts Per Run</Label>
        <Select defaultValue="3">
          <SelectTrigger id="post-count">
            <SelectValue placeholder="Select count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 post</SelectItem>
            <SelectItem value="3">3 posts</SelectItem>
            <SelectItem value="5">5 posts</SelectItem>
            <SelectItem value="10">10 posts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button className="mt-4">Save Schedule Settings</Button>
    </div>
  );
};

// Define the custom content schema
const customContentSchema = z.object({
  customPrompt: z.string().min(10, "Prompt must be at least 10 characters"),
  contentType: z.enum(["educational", "personal"], {
    required_error: "Please select a content type",
  })
});

type CustomContentFormValues = z.infer<typeof customContentSchema>;

const AIEngine = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [isCustomGenerating, setIsCustomGenerating] = useState(false);
  
  // Custom content form
  const customContentForm = useForm<CustomContentFormValues>({
    resolver: zodResolver(customContentSchema),
    defaultValues: {
      customPrompt: "",
      contentType: "educational"
    }
  });
  
  // Fetch AI-generated posts
  const { 
    data: aiPosts, 
    isLoading: isLoadingPosts,
    refetch: refetchPosts
  } = useQuery<any[]>({
    queryKey: ['/api/admin/ai-posts'],
    refetchInterval: false
  });
  
  // Fetch OpenAI status
  const { 
    data: apiStatus, 
    isLoading: isLoadingApiStatus 
  } = useQuery<{configured: boolean, key: string}>({
    queryKey: ['/api/admin/openai-status'],
    refetchInterval: false
  });
  
  // Fetch current schedule settings
  const { 
    data: schedule, 
    isLoading: isLoadingSchedule 
  } = useQuery<{enabled: boolean, cronExpression: string}>({
    queryKey: ['/api/admin/schedule'],
    refetchInterval: false
  });
  
  // Generate batch content mutation
  const generateBatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/generate-batch");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Generated",
        description: `Successfully generated ${data.posts?.length || 0} posts`,
      });
      // Refresh post list
      refetchPosts();
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    }
  });
  
  // Custom content generation mutation
  const customContentMutation = useMutation({
    mutationFn: async (data: CustomContentFormValues) => {
      setIsCustomGenerating(true);
      const res = await apiRequest("POST", "/api/admin/generate-custom", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Custom content generated",
        description: "The AI content has been generated successfully from your prompt",
      });
      // Reset form
      customContentForm.reset({
        customPrompt: "",
        contentType: "educational"
      });
      // Refetch posts in the admin list
      refetchPosts();
      setIsCustomGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Custom generation failed",
        description: error.message || "Failed to generate custom content",
        variant: "destructive",
      });
      setIsCustomGenerating(false);
    }
  });
  
  // Get contributor types from schema
  const contributorTypes = [
    { value: "SURGEON", label: "Surgeon" },
    { value: "PATIENT", label: "Patient" },
    { value: "INFLUENCER", label: "Influencer" },
    { value: "BLOGGER", label: "Blogger" }
  ];
  
  const handleGenerateBatch = () => {
    generateBatchMutation.mutate();
  };
  
  const onCustomSubmit = (data: CustomContentFormValues) => {
    customContentMutation.mutate(data);
  };
  
  return (
    <SuperuserLayout title="AI Content Engine">
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">API Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingApiStatus ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : apiStatus?.configured ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Not Configured</span>
                </div>
              )}
              {apiStatus?.key && (
                <p className="mt-1 text-xs text-gray-500">
                  API Key: {apiStatus.key}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSchedule ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <span className={schedule?.enabled ? "text-green-500" : "text-gray-500"}>
                      {schedule?.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  {schedule?.cronExpression && (
                    <p className="text-xs text-gray-500">
                      {schedule.cronExpression === "0 12 * * *" ? "Daily at 12:00 PM" :
                       schedule.cronExpression === "0 12 * * 1" ? "Weekly on Monday at 12:00 PM" :
                       schedule.cronExpression}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Auto-Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="auto-publish" />
                <Label htmlFor="auto-publish">Auto-publish new content</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Generate Now</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateBatch}
                disabled={generateBatchMutation.isPending || !apiStatus?.configured}
                className="w-full"
              >
                {generateBatchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Generate Batch</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Generated Posts</TabsTrigger>
          <TabsTrigger value="custom">Custom Content</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Settings</TabsTrigger>
          <TabsTrigger value="settings">Content Parameters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Posts</CardTitle>
              <CardDescription>
                View and manage posts created by the AI content engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : aiPosts && Array.isArray(aiPosts) && aiPosts.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-gray-50 px-4 py-3 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {aiPosts.map((post: any) => (
                        <div key={post.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                          <div className="col-span-5 truncate">{post.title}</div>
                          <div className="col-span-2">{post.author || "AI"}</div>
                          <div className="col-span-2 text-gray-500">
                            {post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy") : "—"}
                          </div>
                          <div className="col-span-2">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Published
                            </span>
                          </div>
                          <div className="col-span-1">
                            <Link href={`/post/${post.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                              >
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-gray-500">No posts generated yet</p>
                  <Button 
                    onClick={handleGenerateBatch} 
                    variant="outline" 
                    className="mt-2"
                    disabled={generateBatchMutation.isPending}
                  >
                    Generate Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Content Generator</CardTitle>
              <CardDescription>
                Create highly customized content with your own specific prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Custom Content Generation</AlertTitle>
                <AlertDescription>
                  This tool allows you to create content with a specific prompt. The AI will generate long-form content based on your exact instructions. The process may take up to a minute.
                </AlertDescription>
              </Alert>
              
              <Form {...customContentForm}>
                <form onSubmit={customContentForm.handleSubmit(onCustomSubmit)} className="space-y-6">
                  <FormField
                    control={customContentForm.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="educational">Educational Article</SelectItem>
                            <SelectItem value="personal">Personal Story</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Educational articles appear in the Articles section. Personal stories appear in the main feed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customContentForm.control}
                    name="customPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Prompt</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your detailed prompt for content generation. Be specific about the topic, structure, and style you want." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your prompt should be detailed. For example: "Write an article about the recovery process after closed rhinoplasty, focusing on the first month timeline, what to expect, and tips for easier healing."
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCustomGenerating || !apiStatus?.configured}
                    variant="default"
                  >
                    {isCustomGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Custom Content...
                      </>
                    ) : (
                      "Generate Custom Content"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Schedule</CardTitle>
              <CardDescription>
                Configure when and how often new content should be generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleForm currentSchedule={schedule} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Content Parameters</CardTitle>
              <CardDescription>
                Configure how AI-generated content should be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contributor-type">Contributor Type</Label>
                  <Select defaultValue="PATIENT">
                    <SelectTrigger id="contributor-type">
                      <SelectValue placeholder="Select contributor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contributorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Content will be generated simulating this contributor type's perspective
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-tone">Content Tone</Label>
                  <Select defaultValue="conversational">
                    <SelectTrigger id="content-tone">
                      <SelectValue placeholder="Select content tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auto-publish-setting">Auto-Publish</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-publish-setting" />
                    <Label htmlFor="auto-publish-setting">Automatically publish generated content</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    When disabled, content will be saved as drafts for review
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Parameters</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SuperuserLayout>
  );
};

export default AIEngine;