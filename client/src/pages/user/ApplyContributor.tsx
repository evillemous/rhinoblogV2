import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import UserGuard from "@/lib/guards/UserGuard";
import UserLayout from "@/components/user/UserLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Award,
  Stethoscope,
  UserCog,
  User,
  FileText,
  Check,
  ArrowLeft,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import { ContributorType } from "@shared/schema";

// Application form schema
const applicationFormSchema = z.object({
  contributorType: z.string({
    required_error: "Please select a contributor type",
  }),
  motivation: z.string().min(200, {
    message: "Motivation must be at least 200 characters.",
  }).max(1000, {
    message: "Motivation must not exceed 1000 characters."
  }),
  experience: z.string().min(100, {
    message: "Experience must be at least 100 characters.",
  }).max(1000, {
    message: "Experience must not exceed 1000 characters."
  }),
  websiteUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookUrl: z.string().optional(),
  credentials: z.string().optional(),
  certificationYear: z.string().optional(),
  surgeryCount: z.string().optional(),
  influencerFollowers: z.string().optional(),
  patientSurgeryDate: z.string().optional(),
  patientSurgeryType: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms."
  })
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// Contributor type information
const contributorTypeInfo = {
  [ContributorType.SURGEON]: {
    title: "Surgeon",
    description: "For rhinoplasty surgeons sharing expertise and educational content",
    icon: <Stethoscope className="h-5 w-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    requirements: [
      "Active medical license verification required",
      "Credentials will be verified",
      "Professional bio and image required",
      "Will be labeled as 'Verified Surgeon'"
    ],
    fields: ["credentials", "certificationYear", "surgeryCount", "websiteUrl"]
  },
  [ContributorType.INFLUENCER]: {
    title: "Influencer",
    description: "For content creators with an established audience",
    icon: <Award className="h-5 w-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    requirements: [
      "Established social media presence required",
      "Minimum follower count verification",
      "Content must be rhinoplasty-related",
      "Will be labeled as 'Verified Influencer'"
    ],
    fields: ["instagramHandle", "twitterHandle", "facebookUrl", "websiteUrl", "influencerFollowers"]
  },
  [ContributorType.PATIENT]: {
    title: "Patient",
    description: "For individuals who have undergone rhinoplasty",
    icon: <User className="h-5 w-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    requirements: [
      "Verification of procedure required",
      "Honest, authentic personal experiences only",
      "Before/after sharing optional",
      "Will be labeled as 'Verified Patient'"
    ],
    fields: ["patientSurgeryDate", "patientSurgeryType", "instagramHandle"]
  },
  [ContributorType.BLOGGER]: {
    title: "Blogger",
    description: "For writers and content creators focused on rhinoplasty topics",
    icon: <FileText className="h-5 w-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    requirements: [
      "Writing samples required",
      "Consistent posting commitment",
      "Research-backed content preferred",
      "Will be labeled as 'Verified Blogger'"
    ],
    fields: ["websiteUrl", "instagramHandle", "twitterHandle"]
  }
};

const UserApplyContributor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>(ContributorType.PATIENT);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const trustScore = user?.trustScore || 0;
  
  // Initialize form
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      contributorType: ContributorType.PATIENT,
      motivation: "",
      experience: "",
      websiteUrl: "",
      instagramHandle: "",
      twitterHandle: "",
      facebookUrl: "",
      credentials: "",
      certificationYear: "",
      surgeryCount: "",
      influencerFollowers: "",
      patientSurgeryDate: "",
      patientSurgeryType: "",
      consent: false
    },
  });
  
  // Update contributor type when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("contributorType", value);
  };
  
  // Submit mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      const res = await apiRequest("POST", "/api/user/contributor-application", data);
      return await res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Application Submitted",
        description: "Your contributor application has been submitted successfully. We'll review it and get back to you soon.",
      });
      
      // Reset form after success
      setTimeout(() => {
        form.reset();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: ApplicationFormValues) => {
    submitApplicationMutation.mutate(data);
  };
  
  // Character count helpers
  const motivationLength = form.watch("motivation").length;
  const experienceLength = form.watch("experience").length;
  
  if (trustScore < 50) {
    return (
      <UserGuard>
        <UserLayout title="Become a Contributor">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">Trust Score Requirement</CardTitle>
              <CardDescription className="text-red-700">
                You need a trust score of at least 50 to apply as a contributor.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Your current trust score is <strong>{trustScore}/50</strong>. Continue engaging with the community to increase your score:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                <li>Create quality posts that receive upvotes</li>
                <li>Participate in discussions by commenting on posts</li>
                <li>Provide helpful and supportive feedback to others</li>
                <li>Report inappropriate content to help moderate the community</li>
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" onClick={() => navigate("/user/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </UserLayout>
      </UserGuard>
    );
  }

  return (
    <UserGuard>
      <UserLayout title="Become a Contributor">
        {isSuccess ? (
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Application Submitted</CardTitle>
              <CardDescription className="text-green-700">
                Thank you for applying to become a contributor on RhinoplastyBlogs.com
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto bg-green-100 text-green-800 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Application Received</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Our team will review your application within 2-3 business days. 
                    You'll receive an email notification once a decision has been made.
                  </p>
                  <Button onClick={() => navigate("/user/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Apply to Become a Contributor</CardTitle>
              <CardDescription>
                Join our community of contributors and share your expertise and experiences with rhinoplasty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Select Contributor Type:</h3>
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(contributorTypeInfo).map(([type, info]) => (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        className="flex flex-col items-center p-3 h-auto"
                      >
                        <div className={`${info.color} mb-1`}>
                          {info.icon}
                        </div>
                        <span>{info.title}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {Object.entries(contributorTypeInfo).map(([type, info]) => (
                  <TabsContent key={type} value={type} className="space-y-6">
                    <div className={`p-4 rounded-md ${info.bgColor} border ${info.borderColor}`}>
                      <div className="flex">
                        <div className={`${info.color} mt-1 mr-3`}>
                          {info.icon}
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium ${info.color}`}>
                            {info.title} Contributor
                          </h4>
                          <p className="text-sm text-gray-700">
                            {info.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Requirements:</h5>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                          {info.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="motivation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motivation</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Why do you want to become a contributor? What unique perspective can you bring to our community?" 
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="flex justify-between">
                                <span>Explain why you'd like to join as a {info.title} contributor</span>
                                <span className={motivationLength < 200 ? "text-red-500" : ""}>
                                  {motivationLength}/1000
                                </span>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your relevant experience with rhinoplasty or content creation. Include any professional background, personal experiences, or special qualifications." 
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="flex justify-between">
                                <span>Share your background and qualifications</span>
                                <span className={experienceLength < 100 ? "text-red-500" : ""}>
                                  {experienceLength}/1000
                                </span>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Dynamic fields based on contributor type */}
                        {type === ContributorType.SURGEON && (
                          <>
                            <FormField
                              control={form.control}
                              name="credentials"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medical Credentials</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your credentials (e.g., MD, FACS)" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="certificationYear"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Year of Certification</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="YYYY" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="surgeryCount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Approximate Rhinoplasty Procedures</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Number of procedures performed" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="websiteUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Professional Website</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="https://www.example.com" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        
                        {type === ContributorType.INFLUENCER && (
                          <>
                            <FormField
                              control={form.control}
                              name="influencerFollowers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Follower Count</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Total followers across platforms" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Combined follower count across all your social media platforms
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Social Media Profiles</h4>
                              
                              <FormField
                                control={form.control}
                                name="instagramHandle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="Instagram username (without @)" 
                                          {...field} 
                                          value={field.value || ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="twitterHandle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <Twitter className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="Twitter/X username (without @)" 
                                          {...field} 
                                          value={field.value || ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="facebookUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <Facebook className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="Facebook URL or username" 
                                          {...field} 
                                          value={field.value || ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="websiteUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="Your website or blog URL" 
                                          {...field} 
                                          value={field.value || ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </>
                        )}
                        
                        {type === ContributorType.PATIENT && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="patientSurgeryDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Surgery Date</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="MM/YYYY" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Approximate month and year
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="patientSurgeryType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type of Rhinoplasty</FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select procedure type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="primary">Primary Rhinoplasty</SelectItem>
                                        <SelectItem value="revision">Revision Rhinoplasty</SelectItem>
                                        <SelectItem value="ethnic">Ethnic Rhinoplasty</SelectItem>
                                        <SelectItem value="septorhinoplasty">Septorhinoplasty</SelectItem>
                                        <SelectItem value="nonsurgical">Non-Surgical Rhinoplasty</SelectItem>
                                        <SelectItem value="other">Other (explain in experience)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="instagramHandle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram (Optional)</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Instagram username (without @)" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        
                        {type === ContributorType.BLOGGER && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Your Online Presence</h4>
                            
                            <FormField
                              control={form.control}
                              name="websiteUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Blog/Website</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="https://www.yourblog.com" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="instagramHandle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram (Optional)</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Instagram username (without @)" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="twitterHandle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter/X (Optional)</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Twitter className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Twitter/X username (without @)" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        {/* Consent Checkbox */}
                        <FormField
                          control={form.control}
                          name="consent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I agree to the contributor terms
                                </FormLabel>
                                <FormDescription>
                                  By applying, you agree to our <a href="/terms" className="text-primary underline" target="_blank">contributor terms</a> and community guidelines. You confirm that all information provided is true and accurate.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Security Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                          <div className="flex items-start">
                            <ShieldCheck className="h-5 w-5 text-gray-600 mt-0.5 mr-2" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">
                                Verification Process
                              </h4>
                              <p className="text-xs text-gray-600">
                                All contributor applications are reviewed by our team. You may be asked to provide additional verification documents depending on your contributor type. Your privacy will be protected throughout this process.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Submit Buttons */}
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/user/dashboard")}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitApplicationMutation.isPending || !form.formState.isValid}
                          >
                            {submitApplicationMutation.isPending ? (
                              <>
                                <span className="animate-spin mr-2">⟳</span> 
                                Submitting...
                              </>
                            ) : (
                              "Submit Application"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </UserLayout>
    </UserGuard>
  );
};

export default UserApplyContributor;