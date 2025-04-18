import { useState } from "react";
import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, RefreshCw, Calendar, Hash, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleForm } from "@/components/superuser/ai-engine/ScheduleForm";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const AIEngine = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  
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
  
  // Get contributor types from schema
  const contributorTypes = [
    { value: "SURGEON", label: "Surgeon" },
    { value: "PATIENT", label: "Patient" },
    { value: "INFLUENCER", label: "Influencer" },
    { value: "BLOGGER", label: "Blogger" }
  ];
  
  // Toggle auto-publish mutation (simplified, would need API endpoint)
  const toggleAutoPublishMutation = useMutation({
    mutationFn: async (shouldAutoPublish: boolean) => {
      const res = await apiRequest("POST", "/api/admin/settings/auto-publish", { enabled: shouldAutoPublish });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Setting Updated",
        description: "Auto-publish setting updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    }
  });
  
  const handleGenerateBatch = () => {
    generateBatchMutation.mutate();
  };
  
  return (
    <SuperAdminGuard>
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
                    Checking...
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
                    Loading...
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
                  <Switch id="auto-publish" checked={false} />
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Batch
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Generated Posts</TabsTrigger>
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
                              <Button variant="ghost" size="sm">View</Button>
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
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Schedule</CardTitle>
                <CardDescription>
                  Configure when and how often new content should be generated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleForm currentSchedule={schedule as {enabled: boolean, cronExpression: string} | undefined} />
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
                    <Label htmlFor="auto-publish">Auto-Publish</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-publish" />
                      <Label htmlFor="auto-publish">Automatically publish generated content</Label>
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
    </SuperAdminGuard>
  );
};

export default AIEngine;