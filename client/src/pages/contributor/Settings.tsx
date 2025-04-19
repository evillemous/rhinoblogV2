import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ContributorType, UserRole } from "@shared/schema";
import ContributorGuard from "@/lib/guards/ContributorGuard";
import ContributorLayout from "@/components/contributor/ContributorLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, User, BarChart2, PenTool, ClipboardCheck, 
  AlertCircle, Link as LinkIcon, CheckCircle
} from "lucide-react";

// Form schema definitions
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional(),
  avatarUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().nullable(),
});

// For each contributor type, define their specific profile links
const surgeonLinksSchema = z.object({
  clinicWebsite: z.string().url({ message: "Please enter a valid URL" }).optional(),
  consultationLink: z.string().url({ message: "Please enter a valid URL" }).optional(),
  certifications: z.string().optional(),
  contact: z.string().optional(),
});

const influencerLinksSchema = z.object({
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),
});

const patientLinksSchema = z.object({
  healingGallery: z.string().url({ message: "Please enter a valid URL" }).optional(),
  timeline: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

const bloggerLinksSchema = z.object({
  personalBlog: z.string().url({ message: "Please enter a valid URL" }).optional(),
  youtube: z.string().url({ message: "Please enter a valid URL" }).optional(),
  medium: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

// Define types for the form data
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SurgeonLinksValues = z.infer<typeof surgeonLinksSchema>;
type InfluencerLinksValues = z.infer<typeof influencerLinksSchema>;
type PatientLinksValues = z.infer<typeof patientLinksSchema>;
type BloggerLinksValues = z.infer<typeof bloggerLinksSchema>;

const ContributorSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("profile");

  // Initialize forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const surgeonLinksForm = useForm<SurgeonLinksValues>({
    resolver: zodResolver(surgeonLinksSchema),
    defaultValues: {
      clinicWebsite: "",
      consultationLink: "",
      certifications: "",
      contact: "",
    },
  });

  const influencerLinksForm = useForm<InfluencerLinksValues>({
    resolver: zodResolver(influencerLinksSchema),
    defaultValues: {
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
    },
  });

  const patientLinksForm = useForm<PatientLinksValues>({
    resolver: zodResolver(patientLinksSchema),
    defaultValues: {
      healingGallery: "",
      timeline: "",
    },
  });

  const bloggerLinksForm = useForm<BloggerLinksValues>({
    resolver: zodResolver(bloggerLinksSchema),
    defaultValues: {
      personalBlog: "",
      youtube: "",
      medium: "",
    },
  });

  // Fetch contributor profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/contributor/profile"],
    enabled: !!user && user.role === UserRole.CONTRIBUTOR,
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        username: profileData.username || "",
        email: profileData.email || "",
        bio: profileData.bio || "",
        avatarUrl: profileData.avatarUrl || "",
      });

      // Parse profile links if they exist
      if (profileData.profileLinks) {
        const links = typeof profileData.profileLinks === 'string' 
          ? JSON.parse(profileData.profileLinks) 
          : profileData.profileLinks;

        // Set the appropriate form values based on contributor type
        if (profileData.contributorType === ContributorType.SURGEON) {
          surgeonLinksForm.reset({
            clinicWebsite: links.clinicWebsite || "",
            consultationLink: links.consultationLink || "",
            certifications: links.certifications || "",
            contact: links.contact || "",
          });
        } else if (profileData.contributorType === ContributorType.INFLUENCER) {
          influencerLinksForm.reset({
            instagram: links.instagram || "",
            tiktok: links.tiktok || "",
            youtube: links.youtube || "",
            twitter: links.twitter || "",
          });
        } else if (profileData.contributorType === ContributorType.PATIENT) {
          patientLinksForm.reset({
            healingGallery: links.healingGallery || "",
            timeline: links.timeline || "",
          });
        } else if (profileData.contributorType === ContributorType.BLOGGER) {
          bloggerLinksForm.reset({
            personalBlog: links.personalBlog || "",
            youtube: links.youtube || "",
            medium: links.medium || "",
          });
        }
      }
    }
  }, [profileData, profileForm, surgeonLinksForm, influencerLinksForm, patientLinksForm, bloggerLinksForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/contributor/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update profile links mutation
  const updateLinksMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/contributor/profile", {
        profileLinks: data,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Links Updated",
        description: "Your external links have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributor/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update links. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onSurgeonLinksSubmit = (data: SurgeonLinksValues) => {
    updateLinksMutation.mutate(data);
  };

  const onInfluencerLinksSubmit = (data: InfluencerLinksValues) => {
    updateLinksMutation.mutate(data);
  };

  const onPatientLinksSubmit = (data: PatientLinksValues) => {
    updateLinksMutation.mutate(data);
  };

  const onBloggerLinksSubmit = (data: BloggerLinksValues) => {
    updateLinksMutation.mutate(data);
  };

  // Helper functions
  const getContributorTypeIcon = () => {
    switch (user?.contributorType) {
      case ContributorType.SURGEON:
        return <Briefcase className="h-5 w-5" />;
      case ContributorType.PATIENT:
        return <User className="h-5 w-5" />;
      case ContributorType.INFLUENCER:
        return <BarChart2 className="h-5 w-5" />;
      case ContributorType.BLOGGER:
        return <PenTool className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getContributorTypeName = (): string => {
    switch (user?.contributorType) {
      case ContributorType.SURGEON:
        return "Surgeon";
      case ContributorType.PATIENT:
        return "Patient";
      case ContributorType.INFLUENCER:
        return "Influencer";
      case ContributorType.BLOGGER:
        return "Blogger";
      default:
        return "Contributor";
    }
  };

  // Render the appropriate links form based on contributor type
  const renderLinksForm = () => {
    switch (user?.contributorType) {
      case ContributorType.SURGEON:
        return (
          <Form {...surgeonLinksForm}>
            <form onSubmit={surgeonLinksForm.handleSubmit(onSurgeonLinksSubmit)} className="space-y-6">
              <FormField
                control={surgeonLinksForm.control}
                name="clinicWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-clinic.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your official clinic or practice website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={surgeonLinksForm.control}
                name="consultationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Booking Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://consultation-booking-link.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link for patients to book consultations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={surgeonLinksForm.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List your board certifications and specializations" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={surgeonLinksForm.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Office phone, email, or other contact methods" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateLinksMutation.isPending}>
                {updateLinksMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        );

      case ContributorType.INFLUENCER:
        return (
          <Form {...influencerLinksForm}>
            <form onSubmit={influencerLinksForm.handleSubmit(onInfluencerLinksSubmit)} className="space-y-6">
              <FormField
                control={influencerLinksForm.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={influencerLinksForm.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={influencerLinksForm.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="Channel URL or handle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={influencerLinksForm.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X/Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateLinksMutation.isPending}>
                {updateLinksMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        );

      case ContributorType.PATIENT:
        return (
          <Form {...patientLinksForm}>
            <form onSubmit={patientLinksForm.handleSubmit(onPatientLinksSubmit)} className="space-y-6">
              <FormField
                control={patientLinksForm.control}
                name="healingGallery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Healing Gallery</FormLabel>
                    <FormControl>
                      <Input placeholder="https://gallery-link.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional link to before/after photos or healing progression
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={patientLinksForm.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Timeline</FormLabel>
                    <FormControl>
                      <Input placeholder="https://timeline-link.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to more detailed recovery journey
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateLinksMutation.isPending}>
                {updateLinksMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        );

      case ContributorType.BLOGGER:
        return (
          <Form {...bloggerLinksForm}>
            <form onSubmit={bloggerLinksForm.handleSubmit(onBloggerLinksSubmit)} className="space-y-6">
              <FormField
                control={bloggerLinksForm.control}
                name="personalBlog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Blog</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-blog.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your main blog or website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bloggerLinksForm.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Channel</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/c/yourchannel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bloggerLinksForm.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium Profile</FormLabel>
                    <FormControl>
                      <Input placeholder="https://medium.com/@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateLinksMutation.isPending}>
                {updateLinksMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        );

      default:
        return (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              External link settings not available for your contributor type.
            </p>
          </div>
        );
    }
  };

  return (
    <ContributorGuard>
      <ContributorLayout title="Profile Settings">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading profile data...</div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileData?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-white">
                  {profileData?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">{profileData?.username}</h2>
                  {profileData?.verified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                  {getContributorTypeIcon()}
                  <span className="ml-1">{getContributorTypeName()} Contributor</span>
                </div>
              </div>
            </div>

            {!profileData?.verified && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification In Progress</AlertTitle>
                <AlertDescription>
                  Your profile is being reviewed. Complete all profile information to speed up verification.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="external">External Links</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
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
                                This is your public display name
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
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Used for account notifications and updates
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
                                <Input {...field} value={field.value || ""} />
                              </FormControl>
                              <FormDescription>
                                URL to your profile picture
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
                                  placeholder="Tell readers about yourself..."
                                  className="resize-none"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Brief description about yourself (max 500 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      form="profile-form"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="external">
                <Card>
                  <CardHeader>
                    <CardTitle>External Links</CardTitle>
                    <CardDescription className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Add your external profiles and links
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderLinksForm()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </ContributorLayout>
    </ContributorGuard>
  );
};

export default ContributorSettings;