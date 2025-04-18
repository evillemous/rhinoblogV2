import { useQuery } from "@tanstack/react-query";
import { Topic } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

const Topics = () => {
  // Fetch topics
  const { data: topics, isLoading, error } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 60000, // 1 minute stale time
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Communities</h1>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center p-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
          <p className="mt-2 text-gray-500">Loading communities...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <p className="text-red-600 dark:text-red-400 text-center">
            Error loading communities. Please try again later.
          </p>
        </div>
      )}

      {/* Topics */}
      {topics && topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => (
            <Card key={topic.id} className="overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">{topic.icon}</div>
                  <h2 className="text-xl font-semibold">{topic.name}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {topic.description || `Community for discussing ${topic.name} related topics`}
                </p>
                <Link href={`/topic/${topic.slug}`}>
                  <Button className="w-full bg-reddit-orange hover:bg-orange-600">
                    Visit Community
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-md border dark:border-gray-800">
            <p className="text-gray-500">No communities found</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Back to Home
              </Button>
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default Topics;