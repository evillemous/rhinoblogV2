import { useState } from "react";
import { CommentWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CommentForm from "@/components/CommentForm";

interface CommentProps {
  comment: CommentWithUser;
}

const Comment = ({ comment }: CommentProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Format the date
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  // Get user initials for avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  // Mutation for voting
  const voteMutation = useMutation({
    mutationFn: async (voteType: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to vote");
      }
      const res = await apiRequest("POST", `/api/comments/${comment.id}/vote`, { voteType });
      return res.json();
    },
    onSuccess: () => {
      // Refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${comment.postId}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on comment",
        variant: "destructive",
      });
    }
  });
  
  const handleVote = (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You must be logged in to vote on comments",
        variant: "destructive",
      });
      return;
    }
    
    voteMutation.mutate(type);
    
    if (type === "upvote") {
      setIsUpvoted(!isUpvoted);
      if (isDownvoted) setIsDownvoted(false);
    } else {
      setIsDownvoted(!isDownvoted);
      if (isUpvoted) setIsUpvoted(false);
    }
  };
  
  return (
    <div className="p-4">
      {/* Comment header */}
      <div className="flex items-start">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="bg-reddit-blue text-white">
            {getInitials(comment.user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-medium text-gray-900 dark:text-gray-200 mr-2">
              {comment.user.username}
            </span>
            <span>{formattedDate}</span>
          </div>
          
          {/* Comment content */}
          <div className="text-sm mb-2">{comment.content}</div>
          
          {/* Comment actions */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Button 
              variant="ghost" 
              size="sm"
              className={`p-0 h-auto mr-2 ${isUpvoted ? "text-reddit-orange" : ""}`}
              onClick={() => handleVote("upvote")}
            >
              <i className="fas fa-arrow-up mr-1"></i>
              <span>{comment.upvotes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`p-0 h-auto mr-4 ${isDownvoted ? "text-blue-600" : ""}`}
              onClick={() => handleVote("downvote")}
            >
              <i className="fas fa-arrow-down mr-1"></i>
              <span>{comment.downvotes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-0 h-auto mr-4"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <i className="fas fa-reply mr-1"></i>
              <span>Reply</span>
            </Button>
            {isAuthenticated && user?.id === comment.user.id && (
              <Button 
                variant="ghost" 
                size="sm"
                className="p-0 h-auto text-red-500"
              >
                <i className="fas fa-trash-alt mr-1"></i>
                <span>Delete</span>
              </Button>
            )}
          </div>
          
          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm 
                postId={comment.postId} 
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="pt-2">
                  <div className="flex items-start">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="bg-reddit-blue text-white text-xs">
                        {getInitials(reply.user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-200 mr-2">
                          {reply.user.username}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm mb-2">{reply.content}</div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-0 h-auto mr-2"
                          onClick={() => handleVote("upvote")}
                        >
                          <i className="fas fa-arrow-up mr-1"></i>
                          <span>{reply.upvotes}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-0 h-auto mr-4"
                          onClick={() => handleVote("downvote")}
                        >
                          <i className="fas fa-arrow-down mr-1"></i>
                          <span>{reply.downvotes}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
