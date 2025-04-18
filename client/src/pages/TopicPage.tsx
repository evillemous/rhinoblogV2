import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags, Topic } from "@shared/schema";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TopicPage = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const postsPerPage = 5;

  // Fetch topic details
  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError,
  } = useQuery<Topic>({
    queryKey: [`/api/topics/slug/${topicSlug}`],
    staleTime: 60000,
  });

  // Fetch posts for this topic
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<PostWithTags[]>({
    queryKey: [`/api/topics/${topicSlug}/posts`],
    staleTime: 60000,
    enabled: !!topicSlug,
  });

  // Fetch all topics for the sidebar
  const {
    data: allTopics,
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 60000,
  });

  // Pagination
  const totalPages = posts ? Math.ceil(posts.length / postsPerPage) : 0;
  const currentPosts = posts?.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Reset to page 1 when topic changes
  useEffect(() => {
    setCurrentPage(1);
  }, [topicSlug]);

  const isLoading = topicLoading || postsLoading || topicsLoading;
  const hasError = topicError || postsError || topicsError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rhino-navy" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading page. Please try again later.
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The topic you're looking for doesn't exist.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{topic.icon} {topic.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {topic.description}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No posts found in this topic yet.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.history.back()}>Go Back</Button>
            
            {isAuthenticated && (
              <Button
                onClick={() => setIsPostFormOpen(true)}
                className="bg-reddit-orange hover:bg-orange-600 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Create First Post
              </Button>
            )}
          </div>
          
          {/* Post Form (appears when isPostFormOpen is true) */}
          <PostForm
            isOpen={isPostFormOpen}
            onClose={() => setIsPostFormOpen(false)}
            defaultTopicId={topic.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-2">
              <span className="mr-2">{topic.icon}</span>
              {topic.name}
            </h1>
            <Badge variant="secondary" className="ml-2">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </Badge>
          </div>
          
          {isAuthenticated && (
            <Button 
              onClick={() => setIsPostFormOpen(true)}
              className="bg-reddit-orange hover:bg-orange-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Create Post
            </Button>
          )}
        </div>
        
        {topic.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {topic.description}
          </p>
        )}
        <Separator className="my-4" />
      </div>

      {/* Other Topics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">All Topics</h2>
        <div className="flex flex-wrap gap-2">
          {allTopics?.map((t) => (
            <Link
              key={t.id}
              href={`/topic/${encodeURIComponent(t.slug)}`}
              className={`text-sm font-medium px-3 py-1 rounded-full flex items-center ${
                t.slug === topic.slug
                  ? "bg-rhino-navy text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-1">{t.icon}</span> {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {currentPosts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="join">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Post Form (appears when isPostFormOpen is true) */}
      <PostForm
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        defaultTopicId={topic.id}
      />
    </div>
  );
};

export default TopicPage;