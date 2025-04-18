import { useState } from "react";
import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  ShieldAlert, 
  Shield, 
  User, 
  UserCheck,
  Filter
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { format } from "date-fns";

const UserManagement = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Fetch users
  const { 
    data: users, 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: false
  });
  
  // User creation form schema
  const userFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Must be a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string(),
    contributorType: z.string().optional(),
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      contributorType: undefined,
    },
  });
  
  // Display correct contributor type field based on role
  const watchRole = form.watch("role");
  const showContributorField = watchRole === "contributor";
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "User has been created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      refetchUsers();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully",
      });
      refetchUsers();
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler for user creation
  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
  };
  
  // Filter users based on search query and role
  const filteredUsers = users 
    ? users.filter((user: any) => {
        const matchesSearch = searchQuery
          ? user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
          : true;
        
        const matchesRole = selectedRole
          ? user.role === selectedRole
          : true;
          
        const matchesTab = activeTab === "all" 
          ? true 
          : activeTab === "active" 
            ? !user.isLocked 
            : user.isLocked;
            
        return matchesSearch && matchesRole && matchesTab;
      })
    : [];
  
  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <ShieldAlert className="mr-2 h-4 w-4" />;
      case "admin":
        return <Shield className="mr-2 h-4 w-4" />;
      case "contributor":
        return <UserCheck className="mr-2 h-4 w-4" />;
      default:
        return <User className="mr-2 h-4 w-4" />;
    }
  };
  
  return (
    <SuperAdminGuard>
      <SuperuserLayout title="User Management">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and access permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="locked">Locked</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  onValueChange={(value) => setSelectedRole(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoadingUsers ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getRoleIcon(user.role)}
                              <span className="capitalize">{user.role}</span>
                              {user.contributorType && (
                                <span className="ml-1 text-xs text-gray-500">
                                  ({user.contributorType})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.createdAt 
                              ? format(new Date(user.createdAt), "MMM d, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <span 
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.isLocked 
                                  ? "bg-red-100 text-red-800" 
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.isLocked ? "Locked" : "Active"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={user.role === "superadmin"}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={user.role === "superadmin" || deleteUserMutation.isPending}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <p className="text-gray-500">No users found</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure permissions for each user role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Superadmin
                          </div>
                        </TableCell>
                        <TableCell>Full system access and control</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" disabled>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin
                          </div>
                        </TableCell>
                        <TableCell>Site administration and moderation</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Contributor
                          </div>
                        </TableCell>
                        <TableCell>Verified content creators</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            User
                          </div>
                        </TableCell>
                        <TableCell>Regular registered users</TableCell>
                        <TableCell>24</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user account to the platform.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Superadmin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {showContributorField && (
                  <FormField
                    control={form.control}
                    name="contributorType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contributor Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contributor type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SURGEON">Surgeon</SelectItem>
                            <SelectItem value="PATIENT">Patient</SelectItem>
                            <SelectItem value="INFLUENCER">Influencer</SelectItem>
                            <SelectItem value="BLOGGER">Blogger</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Required for users with the contributor role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </SuperuserLayout>
    </SuperAdminGuard>
  );
};

export default UserManagement;