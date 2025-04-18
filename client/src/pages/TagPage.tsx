import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostWithTags, Tag } from "@shared/schema";
import PostCard from "@/components/PostCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getTagColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const TagPage = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const decodedTagName = tagName ? decodeURIComponent(tagName) : "";
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts"],
    staleTime: 60000,
  });

  const {
    data: allTags,
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    staleTime: 60000,
  });

  // Filter posts by tag
  const filteredPosts = posts?.filter((post) =>
    post.tags.some((tag) => tag.name.toLowerCase() === decodedTagName.toLowerCase())
  );

  // Pagination
  const totalPages = filteredPosts ? Math.ceil(filteredPosts.length / postsPerPage) : 0;
  const currentPosts = filteredPosts?.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Reset to page 1 when tag changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tagName]);

  // Find the current tag
  const currentTag = allTags?.find(
    (tag) => tag.name.toLowerCase() === decodedTagName.toLowerCase()
  );

  if (postsLoading || tagsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rhino-navy" />
      </div>
    );
  }

  if (postsError || tagsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading page. Please try again later.
        </div>
      </div>
    );
  }

  if (!currentTag || !filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">#{decodedTagName}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No posts found with this tag.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <h1 className="text-2xl font-bold mr-2">
            <Badge
              className="text-lg py-1.5 px-4"
              style={{ backgroundColor: getTagColor(currentTag.name) }}
            >
              #{currentTag.name}
            </Badge>
          </h1>
          <span className="text-gray-600 dark:text-gray-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Browse all posts about #{currentTag.name}
        </p>
        <Separator className="my-4" />
      </div>

      {/* Related Tags */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Related Tags</h2>
        <div className="flex flex-wrap gap-2">
          {allTags?.slice(0, 10).map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                tag.name === currentTag.name
                  ? "bg-rhino-navy text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              #{tag.name}
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
    </div>
  );
};

export default TagPage;