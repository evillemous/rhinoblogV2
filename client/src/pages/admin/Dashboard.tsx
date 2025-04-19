import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  FileText, 
  UserCog, 
  Users, 
  Tag, 
  Inbox, 
  BarChart3, 
  AlertCircle, 
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

const AdminDashboard = () => {
  // In a real app, these would be fetched from the API
  const dashboardStats = {
    flaggedContent: 12,
    pendingApproval: 5,
    activeContributors: 38,
    registeredUsers: 247,
    tagsCount: 156,
    pendingReports: 3,
    moderationRate: "93%"
  };

  const quickLinks = [
    {
      name: "Content Moderation",
      href: "/admin/moderation",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-100",
      count: dashboardStats.flaggedContent,
      description: "Review flagged content"
    },
    {
      name: "Posts & Comments",
      href: "/admin/posts",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      count: dashboardStats.pendingApproval,
      description: "Manage site content"
    },
    {
      name: "Contributors",
      href: "/admin/contributors",
      icon: UserCog,
      color: "text-green-500",
      bgColor: "bg-green-100",
      count: dashboardStats.activeContributors,
      description: "Manage special users"
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      count: dashboardStats.registeredUsers,
      description: "Oversee user accounts"
    },
  ];

  const recentActions = [
    { action: "Flagged content reviewed", status: "Approved", time: "2 hours ago", icon: CheckCircle, color: "text-green-500" },
    { action: "New contributor verified", status: "Dr. Smith", time: "5 hours ago", icon: UserCog, color: "text-blue-500" },
    { action: "Spam comments removed", status: "15 items", time: "Yesterday", icon: Shield, color: "text-red-500" },
    { action: "Tags merged", status: "Consolidated", time: "2 days ago", icon: Tag, color: "text-orange-500" },
    { action: "User reports processed", status: "All Clear", time: "3 days ago", icon: AlertCircle, color: "text-purple-500" },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Admin Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a className="block">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{link.name}</CardTitle>
                      <div className={`${link.bgColor} ${link.color} p-1 rounded-full`}>
                        <link.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{link.count}</div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Activity</CardTitle>
              <CardDescription>Your team's latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`mr-3 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{action.action}</div>
                      <div className="text-sm text-muted-foreground">{action.status}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {action.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Frequently needed tools</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/admin/moderation">
                <a className="flex items-center rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <Shield className="mr-3 h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Content Moderation</div>
                    <div className="text-xs text-muted-foreground">Review flagged content</div>
                  </div>
                  <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-900 font-medium">
                    {dashboardStats.flaggedContent}
                  </div>
                </a>
              </Link>
              
              <Link href="/admin/inbox">
                <a className="flex items-center rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <Inbox className="mr-3 h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Moderation Inbox</div>
                    <div className="text-xs text-muted-foreground">User reports and messages</div>
                  </div>
                  <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900 font-medium">
                    {dashboardStats.pendingReports}
                  </div>
                </a>
              </Link>
              
              <Link href="/admin/stats">
                <a className="flex items-center rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <BarChart3 className="mr-3 h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Moderation Metrics</div>
                    <div className="text-xs text-muted-foreground">Performance statistics</div>
                  </div>
                  <div className="ml-auto flex h-8 items-center justify-center rounded-full bg-green-100 text-green-900 font-medium px-2 text-sm">
                    {dashboardStats.moderationRate}
                  </div>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;