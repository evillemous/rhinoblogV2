import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  UserCog, 
  Clock, 
  Eye, 
  Ban, 
  MoreHorizontal,
  AlertCircle,
  MessageSquare,
  PenSquare,
  ShieldAlert,
  ShieldCheck,
  User,
  Flag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const UsersManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  
  // Mock data for users - in a real app, these would be fetched from API with pagination
  const users = [
    {
      id: 1,
      username: "sarah_smith",
      displayName: "Sarah Smith",
      email: "sarah.smith@example.com",
      role: "user",
      posts: 14,
      comments: 32,
      joined: new Date(2023, 1, 15),
      lastActive: new Date(2023, 3, 18),
      status: "active",
      flags: [],
    },
    {
      id: 2,
      username: "dr_jones",
      displayName: "Dr. Richard Jones",
      email: "dr.jones@example.com",
      role: "contributor",
      contributorType: "SURGEON",
      posts: 8,
      comments: 15,
      joined: new Date(2023, 2, 10),
      lastActive: new Date(2023, 3, 17),
      status: "active",
      flags: [],
    },
    {
      id: 3,
      username: "marketing_pro123",
      displayName: "Marketing Professional",
      email: "marketing@example.com",
      role: "user",
      posts: 3,
      comments: 7,
      joined: new Date(2023, 3, 5),
      lastActive: new Date(2023, 3, 15),
      status: "flagged",
      flags: ["spam_activity", "promotional_content"],
    },
    {
      id: 4,
      username: "nose_expert",
      displayName: "Rhinoplasty Expert",
      email: "expert@example.com",
      role: "contributor",
      contributorType: "BLOGGER",
      posts: 21,
      comments: 52,
      joined: new Date(2022, 11, 10),
      lastActive: new Date(2023, 3, 18),
      status: "active",
      flags: ["watchlist"],
    },
    {
      id: 5,
      username: "angry_user99",
      displayName: "Anonymous User",
      email: "anonymous@example.com",
      role: "user",
      posts: 2,
      comments: 28,
      joined: new Date(2023, 2, 20),
      lastActive: new Date(2023, 3, 16),
      status: "banned",
      flags: ["harassment", "multiple_warnings"],
    },
  ];

  const getRoleBadge = (role: string, contributorType?: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Admin</Badge>;
      case "contributor":
        return (
          <div className="flex space-x-1">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Contributor</Badge>
            {contributorType && (
              <Badge variant="outline" className="text-xs">
                {contributorType}
              </Badge>
            )}
          </div>
        );
      case "user":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "banned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Banned</Badge>;
      case "flagged":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) {
      return false;
    }
    
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(search) ||
        user.displayName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  return (
    <AdminGuard>
      <AdminLayout title="User Management">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">User Oversight</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                View and manage registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-1">Posts</div>
                  <div className="col-span-1">Comments</div>
                  <div className="col-span-2">Last Active</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Flags</div>
                  <div className="col-span-1">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 p-3 text-sm items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-muted-foreground">@{user.username}</div>
                      </div>
                      <div className="col-span-2">
                        {getRoleBadge(user.role, user.contributorType)}
                      </div>
                      <div className="col-span-1">{user.posts}</div>
                      <div className="col-span-1">{user.comments}</div>
                      <div className="col-span-2">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(user.lastActive, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined: {format(user.joined, "MMM yyyy")}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="col-span-1">
                        {user.flags.length > 0 ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {user.flags.length} {user.flags.length === 1 ? "flag" : "flags"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" title="View Profile">
                            <User className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Activity
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View Comments
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PenSquare className="mr-2 h-4 w-4" />
                                View Posts
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === "flagged" ? (
                                <DropdownMenuItem>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Clear Flags
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Flag className="mr-2 h-4 w-4" />
                                  Add to Watchlist
                                </DropdownMenuItem>
                              )}
                              {user.status === "banned" ? (
                                <DropdownMenuItem>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Unban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-red-600">
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default UsersManagementPage;