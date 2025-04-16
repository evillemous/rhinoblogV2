import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
}

const CommentForm = ({ postId, parentId, onSuccess }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to comment");
      }
      
      if (!content.trim()) {
        throw new Error("Comment cannot be empty");
      }
      
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, { 
        content, 
        parentId 
      });
      return res.json();
    },
    onSuccess: () => {
      // Clear form
      setContent("");
      // Show success toast
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      // Refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commentMutation.mutate();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="What are your thoughts?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[80px] resize-y"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-reddit-orange hover:bg-orange-600"
          disabled={commentMutation.isPending || !content.trim()}
        >
          {commentMutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
