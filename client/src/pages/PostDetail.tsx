import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags, CommentWithUser } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import CommentForm from "@/components/CommentForm";
import Comment from "@/components/Comment";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const PostDetail = () => {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id ? parseInt(params.id) : 0;
  const { isAuthenticated } = useAuth();
  
  const { data: post, isLoading: postLoading, error: postError } = useQuery<PostWithTags>({
    queryKey: [`/api/posts/${postId}`],
    staleTime: 60000, // 1 minute stale time
    enabled: !!postId,
  });
  
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    staleTime: 60000, // 1 minute stale time
    enabled: !!postId,
  });
  
  const isLoading = postLoading || commentsLoading;
  const error = postError || commentsError;
  
  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading post...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md p-6 text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
            <p className="text-red-500">Error loading post. It might have been deleted or doesn't exist.</p>
            <Button className="mt-4" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        )}
        
        {/* Post */}
        {post && <PostCard post={post} expanded />}
        
        {/* Comments */}
        <div className="bg-white dark:bg-reddit-darkCard shadow rounded-md overflow-hidden">
          {/* Comment Form */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-ibm-plex font-bold mb-3">Comments</h2>
            {isAuthenticated ? (
              <CommentForm postId={postId} />
            ) : (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Log in to leave a comment</p>
                <Button asChild>
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* Comments List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {commentsLoading ? (
              <div className="p-4 text-center">
                <div className="animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
              </div>
            ) : comments?.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments?.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default PostDetail;
