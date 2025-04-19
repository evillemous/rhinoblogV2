import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Flag, 
  CheckSquare, 
  XSquare, 
  Users,
  Clock,
  Calendar,
  Tag,
  MessageSquare
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Mock chart component since we don't have actual recharts here
const ChartPlaceholder = ({ title, height = 300 }: { title: string, height?: number }) => (
  <div 
    className="border rounded-md p-4 flex items-center justify-center bg-muted/20" 
    style={{ height }}
  >
    <div className="text-center">
      <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{title} chart would display here</p>
    </div>
  </div>
);

const ModerationStatsPage = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data for moderation stats
  const moderationOverview = {
    totalFlags: 78,
    flagsThisWeek: 23,
    approvedContent: 145,
    rejectedContent: 17,
    flagsResolved: 62,
    pendingFlags: 16,
    falseFlags: 9,
    averageResponseTime: "3.2 hours",
  };
  
  // Mock data for content metrics
  const contentMetrics = {
    totalPosts: 412,
    aiGeneratedPosts: 320,
    userPosts: 92,
    totalComments: 875,
    flaggedComments: 32,
    topContentCategories: [
      { name: "recovery", count: 68 },
      { name: "surgeons", count: 53 },
      { name: "results", count: 47 },
      { name: "cost", count: 41 },
      { name: "complications", count: 27 },
    ],
  };
  
  // Mock data for top contributors
  const topContributors = [
    { username: "dr_jones", role: "contributor", type: "SURGEON", contributions: 18, rating: 4.9 },
    { username: "nose_expert", role: "contributor", type: "BLOGGER", contributions: 12, rating: 4.7 },
    { username: "sarah_smith", role: "user", contributions: 9, rating: 4.5 },
    { username: "rhino_lover", role: "user", contributions: 7, rating: 4.3 },
    { username: "medical_pro", role: "contributor", type: "SURGEON", contributions: 6, rating: 4.8 },
  ];
  
  // Mock data for spam detection
  const spamMetrics = {
    detectedThisWeek: 28,
    preventedPosts: 12,
    preventedComments: 16,
    commonSpamPatterns: [
      { pattern: "External clinic promotions", occurrences: 9 },
      { pattern: "Unverified medical claims", occurrences: 7 },
      { pattern: "Non-rhinoplasty plastic surgery", occurrences: 5 },
      { pattern: "Unauthorized product promotions", occurrences: 4 },
      { pattern: "Excessive self-promotion", occurrences: 3 },
    ],
    spamByTag: [
      { tag: "results", count: 8 },
      { tag: "surgeons", count: 7 },
      { tag: "cost", count: 5 },
      { tag: "before-after", count: 4 },
      { tag: "recovery", count: 3 },
    ],
  };
  
  // Mock data for moderation activity
  const recentActivity = [
    { 
      action: "Comment approved", 
      content: "Addressed a question about recovery timelines", 
      moderator: "admin", 
      timestamp: new Date(2023, 3, 18, 14, 23) 
    },
    { 
      action: "Post rejected", 
      content: "Promotional content for non-rhinoplasty procedures", 
      moderator: "moderator1", 
      timestamp: new Date(2023, 3, 18, 10, 12) 
    },
    { 
      action: "User flagged", 
      content: "Added marketing_pro123 to watchlist", 
      moderator: "admin", 
      timestamp: new Date(2023, 3, 17, 16, 45) 
    },
    { 
      action: "Comment removed", 
      content: "Harassing comment on user recovery post", 
      moderator: "moderator2", 
      timestamp: new Date(2023, 3, 17, 11, 30) 
    },
    { 
      action: "False flag cleared", 
      content: "Medical terminology incorrectly flagged as spam", 
      moderator: "admin", 
      timestamp: new Date(2023, 3, 16, 15, 20) 
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Moderation Metrics">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Moderation Analytics Dashboard</h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Flags This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{moderationOverview.flagsThisWeek}</div>
                  <div className="flex items-center text-green-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">-12% vs last week</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {moderationOverview.pendingFlags} pending, {moderationOverview.falseFlags} false flags
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Content Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="flex items-center text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">+4% vs last week</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {moderationOverview.approvedContent} approved, {moderationOverview.rejectedContent} rejected
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{moderationOverview.averageResponseTime}</div>
                  <div className="flex items-center text-green-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">-18% vs last week</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Goal: under 4 hours
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Spam Prevented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{spamMetrics.detectedThisWeek}</div>
                  <div className="flex items-center text-red-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">+8% vs last week</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {spamMetrics.preventedPosts} posts, {spamMetrics.preventedComments} comments
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content Metrics</TabsTrigger>
              <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Moderation Activity Timeline</CardTitle>
                    <CardDescription>
                      View moderation actions over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartPlaceholder title="Moderation Activity" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Flag Distribution by Type</CardTitle>
                    <CardDescription>
                      Categories of content flags received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartPlaceholder title="Flag Distribution" height={220} />
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Badge className="bg-red-100 text-red-800 mr-2">Spam</Badge>
                          <span>32%</span>
                        </span>
                        <span>{Math.round(moderationOverview.totalFlags * 0.32)} flags</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Badge className="bg-yellow-100 text-yellow-800 mr-2">Misinformation</Badge>
                          <span>28%</span>
                        </span>
                        <span>{Math.round(moderationOverview.totalFlags * 0.28)} flags</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Badge className="bg-purple-100 text-purple-800 mr-2">Harassment</Badge>
                          <span>22%</span>
                        </span>
                        <span>{Math.round(moderationOverview.totalFlags * 0.22)} flags</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-800 mr-2">Off-topic</Badge>
                          <span>18%</span>
                        </span>
                        <span>{Math.round(moderationOverview.totalFlags * 0.18)} flags</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Common Spam Patterns</CardTitle>
                    <CardDescription>
                      Most frequently detected spam content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {spamMetrics.commonSpamPatterns.map((pattern, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{pattern.pattern}</div>
                            <div className="text-xs text-muted-foreground">
                              {pattern.occurrences} occurrences
                            </div>
                          </div>
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2" 
                              style={{ 
                                width: `${(pattern.occurrences / spamMetrics.commonSpamPatterns[0].occurrences) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Content Creation & Flags</CardTitle>
                    <CardDescription>
                      Tracking content creation vs. moderation issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartPlaceholder title="Content Creation & Flags" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of content by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">User Posts</span>
                        <span className="text-sm font-medium">
                          {Math.round((contentMetrics.userPosts / contentMetrics.totalPosts) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${(contentMetrics.userPosts / contentMetrics.totalPosts) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">AI Posts</span>
                        <span className="text-sm font-medium">
                          {Math.round((contentMetrics.aiGeneratedPosts / contentMetrics.totalPosts) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${(contentMetrics.aiGeneratedPosts / contentMetrics.totalPosts) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-center mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-3">
                          <div className="text-2xl font-bold">{contentMetrics.totalPosts}</div>
                          <div className="text-xs text-muted-foreground">Total Posts</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-2xl font-bold">{contentMetrics.totalComments}</div>
                          <div className="text-xs text-muted-foreground">Total Comments</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Content Categories</CardTitle>
                    <CardDescription>
                      Most active content tags
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contentMetrics.topContentCategories.map((category, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm font-medium">#{category.name}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm mr-2">{category.count} posts</div>
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary rounded-full h-1.5" 
                                style={{ 
                                  width: `${(category.count / contentMetrics.topContentCategories[0].count) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="contributors">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors This Month</CardTitle>
                  <CardDescription>
                    Most active and highly-rated content contributors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Username</div>
                      <div className="col-span-2">Role</div>
                      <div className="col-span-2">Contributions</div>
                      <div className="col-span-3">Rating</div>
                    </div>
                    <div className="divide-y">
                      {topContributors.map((contributor, i) => (
                        <div key={i} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-1 font-medium">{i + 1}</div>
                          <div className="col-span-4">
                            <div className="font-medium">@{contributor.username}</div>
                          </div>
                          <div className="col-span-2">
                            {contributor.role === "contributor" ? (
                              <Badge className="bg-green-100 text-green-800">
                                {contributor.type}
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">
                                {contributor.role}
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                              {contributor.contributions}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-1">
                                {Array.from({ length: 5 }).map((_, starIdx) => (
                                  <svg
                                    key={starIdx}
                                    className={`h-3 w-3 ${
                                      starIdx < Math.floor(contributor.rating)
                                        ? "fill-current"
                                        : "text-muted"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs ml-1">{contributor.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Moderation Activity</CardTitle>
                  <CardDescription>
                    Latest actions taken by the moderation team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="relative pl-6 pb-8 border-l last:pb-0">
                        <div className="absolute left-0 top-0 -translate-x-1/2 rounded-full bg-muted p-1">
                          {activity.action.includes("approved") && (
                            <CheckSquare className="h-3 w-3 text-green-500" />
                          )}
                          {activity.action.includes("rejected") && (
                            <XSquare className="h-3 w-3 text-red-500" />
                          )}
                          {activity.action.includes("flagged") && (
                            <Flag className="h-3 w-3 text-amber-500" />
                          )}
                          {activity.action.includes("removed") && (
                            <XSquare className="h-3 w-3 text-red-500" />
                          )}
                          {activity.action.includes("cleared") && (
                            <CheckSquare className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <div className="mb-1 text-sm font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground mb-2">{activity.content}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span className="mr-2">By @{activity.moderator}</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{format(activity.timestamp, "MMM d, h:mm a")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default ModerationStatsPage;