import { useState } from "react";
import { Link } from "wouter";
import { Post, PostWithTags } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface PostCardProps {
  post: PostWithTags;
  expanded?: boolean;
}

const PostCard = ({ post, expanded = false }: PostCardProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  
  // Format the date
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "recently";
  
  // Mutation for voting
  const voteMutation = useMutation({
    mutationFn: async (voteType: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to vote");
      }
      const res = await apiRequest("POST", `/api/posts/${post.id}/vote`, { voteType });
      return res.json();
    },
    onSuccess: (data: Post) => {
      // Update post in cache
      queryClient.setQueryData([`/api/posts/${post.id}`], (oldData: any) => {
        return { ...oldData, ...data };
      });
      
      // Also update in posts list
      queryClient.setQueryData(["/api/posts"], (oldData: any) => {
        return oldData?.map((p: Post) => 
          p.id === post.id ? { ...p, ...data } : p
        );
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on post",
        variant: "destructive",
      });
    }
  });
  
  const handleVote = (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You must be logged in to vote on posts",
        action: (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        ),
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
    <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md flex">
      {/* Vote column */}
      <div className="w-10 sm:w-12 bg-gray-50 dark:bg-reddit-darkCard flex flex-col items-center pt-2 rounded-l-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`text-gray-400 hover:text-reddit-orange ${isUpvoted ? "text-reddit-orange" : ""}`}
          onClick={() => handleVote("upvote")}
        >
          <i className="fas fa-arrow-up"></i>
        </Button>
        <span className={`text-xs font-medium my-1 ${isUpvoted ? "text-reddit-orange" : isDownvoted ? "text-blue-600" : ""}`}>
          {(post.upvotes || 0) - (post.downvotes || 0)}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`text-gray-400 hover:text-blue-600 ${isDownvoted ? "text-blue-600" : ""}`}
          onClick={() => handleVote("downvote")}
        >
          <i className="fas fa-arrow-down"></i>
        </Button>
      </div>
      
      {/* Post content */}
      <div className="flex-1 p-3">
        {/* Post header */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium">Posted by</span>
          {post.user ? (
            <Link href={`/user/${post.user.id}`} className="ml-1 hover:underline">
              u/{post.user.username}
            </Link>
          ) : (
            <span className="ml-1">u/admin</span>
          )}
          <span className="mx-1">•</span>
          <span>{formattedDate}</span>
          {post.isAiGenerated && (
            <div className="ml-2 flex items-center">
              <i className="fas fa-robot text-blue-400 mr-1"></i>
              <span className="text-blue-600 dark:text-blue-400 font-medium">AI Generated</span>
            </div>
          )}
          {(post.upvotes || 0) > 100 && (
            <div className="ml-2 flex items-center">
              <i className="fas fa-award text-yellow-400 mr-1"></i>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">Top Post</span>
            </div>
          )}
        </div>
        
        {/* Post title */}
        <h2 className="font-ibm-plex text-lg font-semibold mb-2 leading-tight">
          {expanded ? (
            post.title
          ) : (
            <Link href={`/post/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          )}
        </h2>
        
        {/* Tags */}
        <div className="flex flex-wrap mb-3">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={`mr-2 mb-1 bg-${tag.color || 'gray'}-100 dark:bg-${tag.color || 'gray'}-900 text-${tag.color || 'gray'}-800 dark:text-${tag.color || 'gray'}-200`}
              >
                #{tag.name}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="mr-2 mb-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              #rhinoplasty
            </Badge>
          )}
        </div>
        
        {/* Post content */}
        {expanded ? (
          <div className="mb-4 prose dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-gray-100">
            {post.content ? (
              <ReactMarkdown>{post.content}</ReactMarkdown>
            ) : (
              <p className="italic text-gray-500">No content available for this post.</p>
            )}
          </div>
        ) : (
          <p className="text-sm mb-4 line-clamp-3 text-gray-900 dark:text-gray-100">
            {post.content ? (
              <>
                {post.content.substring(0, 300)}
                {post.content.length > 300 && "..."}
              </>
            ) : (
              <span className="italic text-gray-500">No content available for this post.</span>
            )}
          </p>
        )}
        
        {/* Post actions */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Link href={expanded ? `#comments` : `/post/${post.id}#comments`}>
            <Button variant="ghost" size="sm" className="flex items-center mr-4 hover:bg-gray-100 dark:hover:bg-reddit-darkHover p-1 rounded">
              <i className="far fa-comment mr-1"></i>
              <span>{post.commentCount || 0} comments</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="flex items-center mr-4 hover:bg-gray-100 dark:hover:bg-reddit-darkHover p-1 rounded">
            <i className="far fa-bookmark mr-1"></i>
            <span>Save</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center hover:bg-gray-100 dark:hover:bg-reddit-darkHover p-1 rounded">
            <i className="fas fa-share mr-1"></i>
            <span>Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
