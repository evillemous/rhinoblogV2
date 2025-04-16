import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const generatorSchema = z.object({
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  procedure: z.string().min(1, "Procedure type is required"),
  reason: z.string().min(1, "Reason is required")
});

const scheduleSchema = z.object({
  enabled: z.boolean(),
  cronExpression: z.string().min(1, "Cron expression is required")
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;
type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const AdminPostGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  // Form for generating posts
  const generatorForm = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      age: "",
      gender: "",
      procedure: "",
      reason: ""
    }
  });
  
  // Form for scheduling
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      enabled: false,
      cronExpression: "0 12 * * *" // Default: daily at 12 PM
    }
  });
  
  // Query to get current schedule settings
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["/api/admin/schedule"],
    onSettled: (data) => {
      if (data) {
        scheduleForm.setValue("enabled", data.enabled || false);
        scheduleForm.setValue("cronExpression", data.cronExpression || "0 12 * * *");
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load schedule settings",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for generating posts
  const generateMutation = useMutation({
    mutationFn: async (data: GeneratorFormValues) => {
      setIsGenerating(true);
      const res = await apiRequest("POST", "/api/admin/generate-post", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post generated",
        description: "The AI post has been generated successfully",
      });
      // Reset form
      generatorForm.reset();
      // Refetch posts in the admin list
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate post",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });
  
  // Mutation for updating schedule
  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      const res = await apiRequest("POST", "/api/admin/schedule", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule updated",
        description: "The posting schedule has been updated successfully",
      });
      // Refetch schedule
      queryClient.invalidateQueries({ queryKey: ["/api/admin/schedule"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Schedule update failed",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for batch generating posts
  const batchGenerateMutation = useMutation({
    mutationFn: async () => {
      setIsBatchGenerating(true);
      const res = await apiRequest("POST", "/api/admin/generate-batch", {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch generation completed",
        description: `Successfully generated ${data.posts?.length || 0} posts`,
      });
      // Refetch posts in the admin list
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsBatchGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Batch generation failed",
        description: error.message || "Failed to generate batch content",
        variant: "destructive",
      });
      setIsBatchGenerating(false);
    }
  });
  
  const onGenerateSubmit = (data: GeneratorFormValues) => {
    generateMutation.mutate(data);
  };
  
  const onScheduleSubmit = (data: ScheduleFormValues) => {
    scheduleMutation.mutate(data);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Generate AI Post</CardTitle>
          <CardDescription>
            Create a new AI-generated rhinoplasty story to publish on the site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...generatorForm}>
            <form onSubmit={generatorForm.handleSubmit(onGenerateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={generatorForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Age</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 27" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={generatorForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={generatorForm.control}
                  name="procedure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedure Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select procedure type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="closed">Closed Rhinoplasty</SelectItem>
                          <SelectItem value="open">Open Rhinoplasty</SelectItem>
                          <SelectItem value="revision">Revision Rhinoplasty</SelectItem>
                          <SelectItem value="ethnic">Ethnic Rhinoplasty</SelectItem>
                          <SelectItem value="tip plasty">Tip Plasty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={generatorForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Surgery</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixing a deviated septum">Deviated Septum</SelectItem>
                          <SelectItem value="correcting a dorsal hump">Dorsal Hump</SelectItem>
                          <SelectItem value="refining a bulbous tip">Bulbous Tip</SelectItem>
                          <SelectItem value="improving breathing">Breathing Issues</SelectItem>
                          <SelectItem value="fixing a previous surgery">Previous Surgery</SelectItem>
                          <SelectItem value="reshaping after injury">Injury</SelectItem>
                          <SelectItem value="ethnic refinement">Ethnic Refinement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating AI Post...
                  </>
                ) : (
                  "Generate Post"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Batch Content Generation</CardTitle>
          <CardDescription>
            Populate the site with multiple rhinoplasty posts at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Batch Generation</AlertTitle>
            <AlertDescription>
              This will generate 4 posts at once: 2 informational posts about rhinoplasty and 2 personal experience stories. 
              This process may take a few minutes.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => batchGenerateMutation.mutate()}
            className="w-full"
            disabled={isBatchGenerating}
            variant="secondary"
          >
            {isBatchGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating Batch Content...
              </>
            ) : (
              "Generate Multiple Posts"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Automated Posting Schedule</CardTitle>
          <CardDescription>
            Configure automatic AI post generation schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleLoading ? (
            <div className="text-center p-4">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading schedule...
            </div>
          ) : (
            <Form {...scheduleForm}>
              <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-4">
                <FormField
                  control={scheduleForm.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Automated Posting</FormLabel>
                        <FormDescription>
                          When enabled, new AI posts will be generated automatically according to the schedule
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={scheduleForm.control}
                  name="cronExpression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule (Cron Expression)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0 12 * * *">Daily at 12 PM</SelectItem>
                          <SelectItem value="0 12 * * 1,4">Twice a week (Mon, Thu at 12 PM)</SelectItem>
                          <SelectItem value="0 12 * * 1">Weekly (Monday at 12 PM)</SelectItem>
                          <SelectItem value="0 12 1,15 * *">Twice a month (1st & 15th at 12 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={scheduleMutation.isPending}
                >
                  {scheduleMutation.isPending ? "Updating..." : "Save Schedule"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPostGenerator;
