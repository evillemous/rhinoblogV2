import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import UserGuard from "@/lib/guards/UserGuard";
import UserLayout from "@/components/user/UserLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  MessageSquare,
  Bookmark,
  PlusCircle,
  ThumbsUp,
  Tag,
  Clock
} from "lucide-react";

// User dashboard analytics types
interface UserStats {
  totalPosts: number;
  totalComments: number;
  savedPosts: number;
  followedTags: number;
  totalUpvotes: number;
  totalViews: number;
  pendingPosts: number;
  trustScore: number;
}

interface RecentActivity {
  id: number;
  type: 'post' | 'comment' | 'saved' | 'vote';
  title: string;
  target?: string;
  createdAt: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalComments: 0,
    savedPosts: 0,
    followedTags: 0,
    totalUpvotes: 0,
    totalViews: 0,
    pendingPosts: 0,
    trustScore: user?.trustScore || 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Fetch user dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/user/dashboard"],
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
    }
  }, [data]);

  const trustScoreProgress = Math.min(100, (stats.trustScore / 50) * 100);
  const needForContributor = Math.max(0, 50 - stats.trustScore);

  return (
    <UserGuard>
      <UserLayout title="Dashboard">
        <div className="space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Welcome back, {user?.username}!</CardTitle>
              <CardDescription>
                Here's an overview of your activity and contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Trust Score: {stats.trustScore}</div>
                  <div className="text-sm text-muted-foreground">{needForContributor} points to contributor eligibility</div>
                </div>
                <Progress value={trustScoreProgress} className="h-2" />
              </div>
              
              {stats.trustScore >= 50 && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                  <p className="text-sm text-green-800 font-medium">
                    🎉 You've unlocked contributor eligibility! 
                  </p>
                  <Link href="/user/apply-contributor">
                    <a className="text-sm text-green-700 underline">
                      Apply now to share stories more freely
                    </a>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base font-medium flex justify-between items-center">
                  <span>Your Posts</span>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                {stats.pendingPosts > 0 && (
                  <div className="text-xs text-amber-600">
                    {stats.pendingPosts} pending review
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-2">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                  <Link href="/user/posts">
                    <a>View all posts</a>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base font-medium flex justify-between items-center">
                  <span>Comments</span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <div className="text-xs text-muted-foreground">
                  Your contributions
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-2">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                  <Link href="/user/comments">
                    <a>View your comments</a>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base font-medium flex justify-between items-center">
                  <span>Saved Content</span>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.savedPosts}</div>
                <div className="text-xs text-muted-foreground">
                  Saved for later
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-2">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                  <Link href="/user/saved">
                    <a>View saved content</a>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base font-medium flex justify-between items-center">
                  <span>Followed Tags</span>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.followedTags}</div>
                <div className="text-xs text-muted-foreground">
                  Topics you follow
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-2">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                  <Link href="/user/tags">
                    <a>Manage tags</a>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading your activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity. Start engaging with the community!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {activity.type === 'post' && <FileText className="h-4 w-4 text-muted-foreground" />}
                        {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                        {activity.type === 'saved' && <Bookmark className="h-4 w-4 text-muted-foreground" />}
                        {activity.type === 'vote' && <ThumbsUp className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {activity.type === 'post' && 'Created a post'}
                          {activity.type === 'comment' && 'Commented on'}
                          {activity.type === 'saved' && 'Saved'}
                          {activity.type === 'vote' && 'Upvoted'}
                          
                          {activity.type !== 'post' && (
                            <span className="ml-1 font-normal">
                              <Link href={`/post/${activity.id}`}>{activity.title}</Link>
                            </span>
                          )}
                        </div>
                        
                        {activity.type === 'post' && (
                          <div className="text-sm">
                            <Link href={`/post/${activity.id}`}>{activity.title}</Link>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(activity.createdAt), "MMM d, yyyy • h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/user/create-post">
                  <a className="flex items-center justify-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create a new post
                  </a>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </UserLayout>
    </UserGuard>
  );
};

export default UserDashboard;