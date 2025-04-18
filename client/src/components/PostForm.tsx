import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Topic } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopicId?: number; // Optional default topic ID
}

const postSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(300, "Title must be less than 300 characters"),
  content: z.string().min(30, "Content must be at least 30 characters"),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  topicId: z.string().optional() // Topic ID is optional
});

type PostFormValues = z.infer<typeof postSchema>;

const PostForm = ({ isOpen, onClose, defaultTopicId }: PostFormProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  
  // Fetch all topics for the dropdown
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 60000,
  });
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      topicId: defaultTopicId?.toString() || ""
    }
  });
  
  // Define an interface for the data we're submitting
  interface PostSubmissionData {
    title: string;
    content: string;
    tags: string[];
    topicId?: number;
  }

  const postMutation = useMutation({
    mutationFn: async (data: PostSubmissionData) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to create a post");
      }
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      // Close dialog
      onClose();
      // Show success toast
      toast({
        title: "Post created",
        description: "Your post has been created successfully",
      });
      // Refetch posts
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: PostFormValues) => {
    // Create a new object for submission to ensure type safety
    const submissionData: PostSubmissionData = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      // Convert topicId to number if it exists, otherwise use the default or undefined
      topicId: data.topicId 
        ? parseInt(data.topicId, 10)
        : (defaultTopicId || undefined)
    };
    
    postMutation.mutate(submissionData);
  };
  
  const addTag = () => {
    if (!tagInput) return;
    
    const lowerTag = tagInput.toLowerCase().replace(/\s+/g, '');
    if (lowerTag && !form.getValues().tags.includes(lowerTag)) {
      form.setValue("tags", [...form.getValues().tags, lowerTag]);
      setTagInput("");
      form.clearErrors("tags");
    }
  };
  
  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      form.getValues().tags.filter((t) => t !== tag)
    );
  };
  
  // If not authenticated, don't render the form
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-ibm-plex">Create a New Post</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="An eye-catching title for your post" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your rhinoplasty experience or ask a question..."
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={topicsLoading || !!defaultTopicId}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch("tags").map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>#{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-muted-foreground"
                          onClick={() => removeTag(tag)}
                        >
                          <i className="fas fa-times"></i>
                          <span className="sr-only">Remove tag</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (e.g. recovery, day1)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>Add</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-reddit-orange hover:bg-orange-600"
                disabled={postMutation.isPending}
              >
                {postMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PostForm;
