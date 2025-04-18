import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth, UserRole, ContributorType } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { UserRoleBadge } from "@/components/UserRoleBadge";

// Validation schemas
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(6)
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"], 
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfileSettings = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  
  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Update the auth context with the new user data
      if (data.token) {
        login(data.token, data.user);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });
  
  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("PATCH", "/api/users/password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      
      // Reset the password form
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    passwordMutation.mutate(data);
  };
  
  // Handle avatar URL change
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarPreview(url);
    profileForm.setValue("avatarUrl", url);
  };
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar preview */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={user?.username || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-reddit-orange text-white text-2xl">
                      {user ? getInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Enter an image URL below<br />to update your avatar
                  </p>
                </div>
                
                {/* Profile form */}
                <div className="flex-1">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public username that other users will see
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your email is private and used for notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Display name removed as it's not in the user model */}
                      
                      <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-avatar.jpg" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleAvatarUrlChange(e);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a URL to an image for your profile avatar
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={profileMutation.isPending}
                      >
                        {profileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="password" className="mt-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="mt-4"
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : "Update Password"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <p className="text-xs text-gray-500">
            Account ID: {user?.id || "N/A"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileSettings;