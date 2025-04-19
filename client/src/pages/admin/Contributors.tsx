import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Eye, 
  Edit, 
  MoreHorizontal,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Star,
  Clock,
  ExternalLink,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const ContributorsManagementPage = () => {
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Mock data for contributor applications
  const applications = [
    {
      id: 1,
      name: "Dr. Jennifer Smith",
      username: "dr_smith_rhino",
      type: "SURGEON",
      date: new Date(2023, 3, 15),
      status: "pending",
      evidence: "Board certification, clinic website, 15 years experience",
      profile: "Specializing in ethnic rhinoplasty with over 1,500 procedures performed.",
      contactInfo: "smith@rhinoclinic.com",
    },
    {
      id: 2,
      name: "Michael Jones",
      username: "mike_nose_journey",
      type: "PATIENT",
      date: new Date(2023, 3, 14),
      status: "pending",
      evidence: "Pre/post-op photos, receipt from surgery, timeline documented",
      profile: "Had rhinoplasty in 2022, documenting my full journey and recovery.",
      contactInfo: "mike.j@gmail.com",
    },
    {
      id: 3,
      name: "RhinoBeauty",
      username: "rhino_beauty_official",
      type: "INFLUENCER",
      date: new Date(2023, 3, 12),
      status: "pending",
      evidence: "100k+ followers on Instagram, verified social accounts",
      profile: "Beauty influencer focusing on facial plastic surgery transformations.",
      contactInfo: "partnerships@rhinobeauty.com",
    },
  ];

  // Mock data for verified contributors
  const verifiedContributors = [
    {
      id: 101,
      name: "Dr. Robert Chen",
      username: "dr_chen_rhinoplasty",
      type: "SURGEON",
      verifiedDate: new Date(2023, 2, 10),
      posts: 12,
      rating: 4.9,
      status: "active",
      featured: true,
    },
    {
      id: 102,
      name: "Sarah Williams",
      username: "sarah_rhino_journey",
      type: "PATIENT",
      verifiedDate: new Date(2023, 2, 5),
      posts: 8,
      rating: 4.7,
      status: "active",
      featured: false,
    },
    {
      id: 103,
      name: "NoseKnowsBest",
      username: "nose_knows_best",
      type: "BLOGGER",
      verifiedDate: new Date(2023, 1, 20),
      posts: 24,
      rating: 4.5,
      status: "active",
      featured: true,
    },
    {
      id: 104,
      name: "Dr. Maria Garcia",
      username: "dr_garcia_plastic",
      type: "SURGEON",
      verifiedDate: new Date(2023, 1, 15),
      posts: 7,
      rating: 4.8,
      status: "active",
      featured: false,
    },
  ];

  // Mock data for story submissions
  const storySubmissions = [
    {
      id: 201,
      title: "My Unexpected Rhinoplasty Journey - The Good and Bad",
      author: "sarah_rhino_journey",
      date: new Date(2023, 3, 10),
      snippet: "After years of breathing issues and feeling self-conscious...",
      status: "pending",
      type: "PATIENT",
      wordCount: 1850,
      images: 6,
    },
    {
      id: 202,
      title: "What to Really Expect After Rhinoplasty - A Surgeon's Honest Take",
      author: "dr_chen_rhinoplasty",
      date: new Date(2023, 3, 8),
      snippet: "As a surgeon who has performed over 1,000 rhinoplasties...",
      status: "pending",
      type: "SURGEON",
      wordCount: 2300,
      images: 4,
    },
  ];

  const getContributorTypeBadge = (type) => {
    switch (type) {
      case "SURGEON":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Surgeon</Badge>;
      case "PATIENT":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Patient</Badge>;
      case "INFLUENCER":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Influencer</Badge>;
      case "BLOGGER":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Blogger</Badge>;
      default:
        return null;
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Contributor Management">
        <div className="space-y-4">
          <Tabs defaultValue="applications" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications" className="relative">
                New Applications
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2">
                  {applications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="contributors">Verified Contributors</TabsTrigger>
              <TabsTrigger value="submissions" className="relative">
                Story Submissions
                <Badge className="ml-2 absolute right-2 top-1/2 -translate-y-1/2">
                  {storySubmissions.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Contributor Applications</CardTitle>
                  <CardDescription>
                    Review and approve special contributor status requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Username</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-3">Evidence</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {applications.map((app) => (
                        <div key={app.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-3 font-medium">{app.name}</div>
                          <div className="col-span-2">@{app.username}</div>
                          <div className="col-span-2">
                            {getContributorTypeBadge(app.type)}
                          </div>
                          <div className="col-span-3 truncate text-muted-foreground">{app.evidence}</div>
                          <div className="col-span-1 text-muted-foreground">
                            {format(app.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    title="View"
                                    onClick={() => handleViewApplication(app)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Contributor Application</DialogTitle>
                                    <DialogDescription>
                                      Review application details and make a decision
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedApplication && (
                                    <div className="space-y-4 mt-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h3 className="text-sm font-medium mb-1">Applicant</h3>
                                          <p>{selectedApplication.name}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium mb-1">Username</h3>
                                          <p>@{selectedApplication.username}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium mb-1">Contributor Type</h3>
                                          <p>{getContributorTypeBadge(selectedApplication.type)}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium mb-1">Contact</h3>
                                          <p>{selectedApplication.contactInfo}</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-sm font-medium mb-1">Profile Description</h3>
                                        <p className="text-sm text-muted-foreground border rounded-md p-3">
                                          {selectedApplication.profile}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-sm font-medium mb-1">Verification Evidence</h3>
                                        <p className="text-sm text-muted-foreground border rounded-md p-3">
                                          {selectedApplication.evidence}
                                        </p>
                                      </div>
                                      
                                      <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium mb-2">Application Decision</h3>
                                        <RadioGroup defaultValue="pending">
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="approve" id="approve" />
                                            <Label htmlFor="approve" className="flex items-center">
                                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                              Approve as {selectedApplication.type}
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="change" id="change" />
                                            <Label htmlFor="change">Change contributor type</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="deny" id="deny" />
                                            <Label htmlFor="deny" className="flex items-center">
                                              <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                              Deny application
                                            </Label>
                                          </div>
                                        </RadioGroup>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="notes" className="mb-1 block">Internal Notes</Label>
                                        <Textarea 
                                          id="notes"
                                          placeholder="Add internal notes about this application (not visible to user)"
                                          className="h-20"
                                        />
                                      </div>
                                      
                                      <div className="flex justify-end space-x-2 pt-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Submit Decision</Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deny
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Request More Info
                                  </DropdownMenuItem>
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
            </TabsContent>
            
            <TabsContent value="contributors">
              <Card>
                <CardHeader>
                  <CardTitle>Verified Contributors</CardTitle>
                  <CardDescription>
                    Manage special contributors and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Username</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-1">Posts</div>
                      <div className="col-span-1">Rating</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Featured</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {verifiedContributors.map((contributor) => (
                        <div key={contributor.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-3 font-medium">{contributor.name}</div>
                          <div className="col-span-2">@{contributor.username}</div>
                          <div className="col-span-2">
                            {getContributorTypeBadge(contributor.type)}
                          </div>
                          <div className="col-span-1">{contributor.posts}</div>
                          <div className="col-span-1">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {contributor.rating}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Active
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            {contributor.featured ? (
                              <Badge className="bg-amber-100 text-amber-800">Featured</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
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
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Posts
                                  </DropdownMenuItem>
                                  {contributor.featured ? (
                                    <DropdownMenuItem>
                                      <Star className="mr-2 h-4 w-4" />
                                      Remove from Featured
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem>
                                      <Star className="mr-2 h-4 w-4" />
                                      Add to Featured
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-red-600">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Suspend Access
                                  </DropdownMenuItem>
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
            </TabsContent>
            
            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle>Story Submissions</CardTitle>
                  <CardDescription>
                    Review and approve contributor story submissions for homepage features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-1">Type</div>
                      <div className="col-span-1">Words</div>
                      <div className="col-span-1">Images</div>
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y">
                      {storySubmissions.map((submission) => (
                        <div key={submission.id} className="grid grid-cols-12 p-3 text-sm items-center">
                          <div className="col-span-5 font-medium">{submission.title}</div>
                          <div className="col-span-2">@{submission.author}</div>
                          <div className="col-span-1">
                            {getContributorTypeBadge(submission.type)}
                          </div>
                          <div className="col-span-1">{submission.wordCount}</div>
                          <div className="col-span-1">{submission.images}</div>
                          <div className="col-span-1 text-muted-foreground">
                            {format(submission.date, "MMM d")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" title="View">
                                <Eye className="h-4 w-4" />
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
                                    View Full Story
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Request Edits
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve for Homepage
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Submission
                                  </DropdownMenuItem>
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
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default ContributorsManagementPage;