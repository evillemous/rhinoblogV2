import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, User, Shield, Bell, Globe } from "lucide-react";

// Form schemas
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not exceed 160 characters.",
  }).optional(),
  avatarUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  displayName: z.string().max(50, {
    message: "Display name must not exceed 50 characters.",
  }).optional(),
});

const privacyFormSchema = z.object({
  isProfilePublic: z.boolean().default(true),
  showComments: z.boolean().default(true),
  allowTagging: z.boolean().default(true),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  commentReplies: z.boolean().default(true),
  postUpvotes: z.boolean().default(true),
  commentUpvotes: z.boolean().default(true),
  newsletterSubscribed: z.boolean().default(false),
});

const socialFormSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PrivacyFormValues = z.infer<typeof privacyFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type SocialFormValues = z.infer<typeof socialFormSchema>;

const UserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Initialize forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
      displayName: user?.displayName || "",
    },
  });

  const privacyForm = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      isProfilePublic: user?.isProfilePublic ?? true,
      showComments: user?.showComments ?? true,
      allowTagging: user?.allowTagging ?? true,
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: user?.emailNotifications ?? true,
      commentReplies: user?.commentReplies ?? true,
      postUpvotes: user?.postUpvotes ?? false,
      commentUpvotes: user?.commentUpvotes ?? false,
      newsletterSubscribed: user?.newsletterSubscribed ?? false,
    },
  });

  const socialForm = useForm<SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      instagram: user?.social?.instagram || "",
      twitter: user?.social?.twitter || "",
      facebook: user?.social?.facebook || "",
      tiktok: user?.social?.tiktok || "",
      website: user?.social?.website || "",
    },
  });

  // Fetch user settings data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        // Update profile form
        profileForm.reset({
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          displayName: data.displayName || "",
        });

        // Update privacy form
        privacyForm.reset({
          isProfilePublic: data.isProfilePublic ?? true,
          showComments: data.showComments ?? true,
          allowTagging: data.allowTagging ?? true,
        });

        // Update notification form
        notificationForm.reset({
          emailNotifications: data.emailNotifications ?? true,
          commentReplies: data.commentReplies ?? true,
          postUpvotes: data.postUpvotes ?? false,
          commentUpvotes: data.commentUpvotes ?? false,
          newsletterSubscribed: data.newsletterSubscribed ?? false,
        });

        // Update social form
        socialForm.reset({
          instagram: data.social?.instagram || "",
          twitter: data.social?.twitter || "",
          facebook: data.social?.facebook || "",
          tiktok: data.social?.tiktok || "",
          website: data.social?.website || "",
        });
      }
    },
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Privacy settings mutation
  const privacyMutation = useMutation({
    mutationFn: async (data: PrivacyFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/privacy", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Notification settings mutation
  const notificationMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Social links mutation
  const socialMutation = useMutation({
    mutationFn: async (data: SocialFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/social", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Social Links Updated",
        description: "Your social links have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update social links. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submit handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };

  const onPrivacySubmit = (data: PrivacyFormValues) => {
    privacyMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    notificationMutation.mutate(data);
  };

  const onSocialSubmit = (data: SocialFormValues) => {
    socialMutation.mutate(data);
  };

  return (
    <UserGuard>
      <UserLayout title="Account Settings">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Social</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and public profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading your profile...</div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={profileForm.getValues("avatarUrl") || ""} />
                          <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-medium">{user?.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name. It must be unique.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Your real name or preferred display name.
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
                              <Input placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your email address is used for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell the community about yourself..."
                                className="resize-none h-20"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Write a short bio about yourself (max 160 characters).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Enter the URL of your profile picture.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={profileMutation.isPending || !profileForm.formState.isDirty}
                      >
                        {profileMutation.isPending ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy preferences and profile visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading your privacy settings...</div>
                ) : (
                  <Form {...privacyForm}>
                    <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                      <FormField
                        control={privacyForm.control}
                        name="isProfilePublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Public Profile</FormLabel>
                              <FormDescription>
                                Make your profile visible to all users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="showComments"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Comments</FormLabel>
                              <FormDescription>
                                Display your comments on your public profile
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowTagging"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Tagging</FormLabel>
                              <FormDescription>
                                Allow other users to tag you in posts or comments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Privacy Notice</p>
                          <p className="mt-1">
                            Your posts and community contributions are visible to all users. Keeping your profile 
                            private will only hide your profile information, not your content.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={privacyMutation.isPending || !privacyForm.formState.isDirty}
                      >
                        {privacyMutation.isPending ? "Updating..." : "Save Privacy Settings"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading your notification preferences...</div>
                ) : (
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="commentReplies"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Comment Replies</FormLabel>
                              <FormDescription>
                                Notify when someone replies to your comments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="postUpvotes"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Post Upvotes</FormLabel>
                              <FormDescription>
                                Notify when your posts receive upvotes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="commentUpvotes"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Comment Upvotes</FormLabel>
                              <FormDescription>
                                Notify when your comments receive upvotes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="newsletterSubscribed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Newsletter</FormLabel>
                              <FormDescription>
                                Receive our weekly newsletter with the latest rhinoplasty insights
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={notificationMutation.isPending || !notificationForm.formState.isDirty}
                      >
                        {notificationMutation.isPending ? "Updating..." : "Save Notification Settings"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Social Links */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Link your social media accounts (optional and private by default)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading your social links...</div>
                ) : (
                  <Form {...socialForm}>
                    <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                          These links are private by default and will only be visible to community 
                          moderators. They will be publicly shown only if you apply to become a 
                          Contributor and specify which ones to display.
                        </p>
                      </div>
                      
                      <FormField
                        control={socialForm.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="@username" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={socialForm.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="@username" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={socialForm.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="Username or profile URL" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={socialForm.control}
                        name="tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok</FormLabel>
                            <FormControl>
                              <Input placeholder="@username" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={socialForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={socialMutation.isPending || !socialForm.formState.isDirty}
                      >
                        {socialMutation.isPending ? "Updating..." : "Save Social Links"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </UserLayout>
    </UserGuard>
  );
};

export default UserSettings;