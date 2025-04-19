import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import UserGuard from "@/lib/guards/UserGuard";
import UserLayout from "@/components/user/UserLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tag, Search, Plus, X, ArrowRight } from "lucide-react";

interface FollowedTag {
  id: number;
  tagId: number;
  name: string;
  color: string;
  followedAt: string;
  postCount: number;
}

interface PopularTag {
  id: number;
  name: string;
  color: string;
  postCount: number;
  isFollowed: boolean;
}

// Mock API endpoint - replace with actual endpoint when available
const fetchUserTags = async (): Promise<{ 
  followedTags: FollowedTag[],
  popularTags: PopularTag[],
  stats: { 
    totalFollowed: number;
  }
}> => {
  const res = await apiRequest("GET", "/api/user/tags");
  return await res.json();
};

const UserTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<FollowedTag | null>(null);
  const [isUnfollowDialogOpen, setIsUnfollowDialogOpen] = useState(false);

  // Fetch user tags
  const { data, isLoading } = useQuery({
    queryKey: ["/api/user/tags"],
    queryFn: fetchUserTags,
    enabled: !!user,
  });

  // Follow tag mutation
  const followTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      const res = await apiRequest("POST", `/api/user/tags/${tagId}/follow`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tag Followed",
        description: "You're now following this tag.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tags"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to follow tag. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unfollow tag mutation
  const unfollowTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      const res = await apiRequest("DELETE", `/api/user/tags/${tagId}/follow`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tag Unfollowed",
        description: "You've unfollowed this tag.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tags"] });
      setIsUnfollowDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to unfollow tag. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmUnfollow = () => {
    if (selectedTag) {
      unfollowTagMutation.mutate(selectedTag.tagId);
    }
  };

  // Filter tags based on search term
  const filteredFollowedTags = data?.followedTags.filter((tag) => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPopularTags = data?.popularTags.filter((tag) => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sort followed tags alphabetically
  const sortedFollowedTags = [...filteredFollowedTags].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Sort popular tags by post count
  const sortedPopularTags = [...filteredPopularTags].sort((a, b) => 
    b.postCount - a.postCount
  );

  // Get tag color classes
  const getTagColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      red: "bg-red-100 text-red-800 hover:bg-red-200",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    };
    
    return colorMap[color] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <UserGuard>
      <UserLayout title="Followed Tags">
        <div className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Manage tags you follow to personalize your feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {isLoading ? (
                <div className="text-center py-6">Loading tags...</div>
              ) : null}
            </CardContent>
          </Card>
          
          {/* Followed Tags Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Tags You Follow ({data?.stats.totalFollowed || 0})
              </CardTitle>
              <CardDescription>
                You'll see more content from these tags in your feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && sortedFollowedTags.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No followed tags</h3>
                  <p className="text-muted-foreground">
                    Follow tags to see more related content in your feed.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedFollowedTags.map((tag) => (
                    <div key={tag.id} className="relative group">
                      <Badge
                        className={`flex items-center px-3 py-1 ${getTagColorClass(tag.color)}`}
                      >
                        <span>{tag.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setSelectedTag(tag);
                            setIsUnfollowDialogOpen(true);
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Unfollow</span>
                        </Button>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/tag-explorer">
                <a className="text-sm text-primary flex items-center">
                  Explore popular tags
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Popular Tags Section */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags to Follow</CardTitle>
              <CardDescription>
                Discover trending topics in the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && sortedPopularTags.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No tags found matching your search.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedPopularTags.map((tag) => (
                    <div key={tag.id} className="flex">
                      {tag.isFollowed ? (
                        <Badge
                          className={`flex items-center px-3 py-1 ${getTagColorClass(tag.color)}`}
                        >
                          <span>{tag.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 ml-1 rounded-full"
                            onClick={() => unfollowTagMutation.mutate(tag.id)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Unfollow</span>
                          </Button>
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-full flex items-center gap-1 text-xs"
                          onClick={() => followTagMutation.mutate(tag.id)}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{tag.name}</span>
                          <span className="text-muted-foreground ml-1">({tag.postCount})</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Unfollow Confirmation Dialog */}
        <AlertDialog open={isUnfollowDialogOpen} onOpenChange={setIsUnfollowDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unfollow Tag?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll see less content related to "{selectedTag?.name}" in your feed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmUnfollow}>
                Unfollow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </UserLayout>
    </UserGuard>
  );
};

export default UserTags;