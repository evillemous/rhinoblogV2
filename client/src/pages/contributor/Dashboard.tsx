import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart, Clock, FileText, ThumbsUp, MessageCircle, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ContributorGuard from "@/lib/guards/ContributorGuard";
import ContributorLayout from "@/components/contributor/ContributorLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface ContentStats {
  totalPosts: number;
  totalUpvotes: number;
  totalComments: number;
  totalViews: number;
}

interface PostAnalytics {
  id: number;
  title: string;
  createdAt: string;
  analytics: {
    views: number;
    upvotes: number;
    downvotes: number;
    comments: number;
  };
}

interface ContributorContent {
  posts: PostAnalytics[];
  summary: ContentStats;
}

const ContributorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ContentStats>({
    totalPosts: 0,
    totalUpvotes: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<PostAnalytics[]>([]);

  // Fetch contributor content and analytics
  const { data, isLoading, error } = useQuery<ContributorContent>({
    queryKey: ["/api/contributor/content"],
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load your contributor data. Please try again.",
        variant: "destructive",
      });
    }

    if (data) {
      setStats(data.summary);
      // Sort by date (newest first) and take the 5 most recent posts
      const sorted = [...data.posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentPosts(sorted.slice(0, 5));
    }
  }, [data, error, toast]);

  const getContributorTypeInfo = () => {
    switch (user?.contributorType) {
      case "surgeon":
        return {
          title: "Surgeon Contributor",
          description: "Share your professional expertise and surgical insights",
          icon: <span className="text-2xl">🩺</span>,
        };
      case "patient":
        return {
          title: "Patient Contributor",
          description: "Share your personal journey and recovery experience",
          icon: <span className="text-2xl">👤</span>,
        };
      case "influencer":
        return {
          title: "Influencer Contributor",
          description: "Share trending content and build your audience",
          icon: <span className="text-2xl">✨</span>,
        };
      case "blogger":
        return {
          title: "Blogger Contributor",
          description: "Create in-depth articles and educational content",
          icon: <span className="text-2xl">✍️</span>,
        };
      default:
        return {
          title: "Contributor",
          description: "Share your knowledge and experiences",
          icon: <span className="text-2xl">📝</span>,
        };
    }
  };

  // Track verification progress
  const getVerificationProgress = () => {
    if (user?.verified) return 100;
    
    // For demo purposes, assign a percentage based on contributorType
    switch (user?.contributorType) {
      case "surgeon":
        return 40; // Surgeons have a longer verification process
      case "influencer":
        return 70;
      default:
        return 60;
    }
  };

  const contributorInfo = getContributorTypeInfo();
  const verificationProgress = getVerificationProgress();

  return (
    <ContributorGuard>
      <ContributorLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Your published content
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUpvotes}</div>
              <p className="text-xs text-muted-foreground">
                Community appreciation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                Engagement on your posts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Total post impressions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>
                Your most recent posts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading your data...</div>
              ) : recentPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">You haven't created any posts yet.</p>
                  <a href="/contributor/content" className="text-primary hover:underline">
                    Create your first post
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{post.title}</h4>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(post.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex space-x-2 text-xs">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1 text-muted-foreground" />
                            {post.analytics.views}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1 text-muted-foreground" />
                            {post.analytics.upvotes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                            {post.analytics.comments}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Contributor Status</CardTitle>
              <CardDescription>
                Your current standing and privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {contributorInfo.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">{contributorInfo.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {contributorInfo.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Verification Status</div>
                  <div className="text-xs">
                    {user?.verified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-amber-600">In Progress</span>
                    )}
                  </div>
                </div>
                <Progress value={verificationProgress} className="h-2" />
                {!user?.verified && (
                  <p className="text-xs text-muted-foreground">
                    Your profile is being reviewed. Complete your profile in settings.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Content Privileges</h4>
                <ul className="space-y-1">
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Create and publish posts
                  </li>
                  {user?.contributorType === "surgeon" && (
                    <li className="text-xs flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Add medical credentials
                    </li>
                  )}
                  {user?.contributorType === "influencer" && (
                    <li className="text-xs flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Link social media profiles
                    </li>
                  )}
                  {user?.verified && (
                    <li className="text-xs flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Verified badge on all posts
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContributorLayout>
    </ContributorGuard>
  );
};

export default ContributorDashboard;