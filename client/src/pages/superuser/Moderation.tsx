import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Filter, Flag, MessageSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Moderation = () => {
  const [activeTab, setActiveTab] = useState("reported");
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <SuperAdminGuard>
      <SuperuserLayout title="Content Moderation">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Moderation</CardTitle>
                  <CardDescription>
                    Review and moderate user-generated content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reported" className="mb-6" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="reported">Reported Content</TabsTrigger>
                  <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search content..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {activeTab === "reported" && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Inappropriate Comment</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Comment
                          </Badge>
                        </TableCell>
                        <TableCell>user123</TableCell>
                        <TableCell>Spam content</TableCell>
                        <TableCell>Apr 15, 2025</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Flag className="mr-1 h-3 w-3" />
                            Pending Review
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm" className="text-green-600">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No more reported content to review
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {activeTab === "pending" && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No pending content awaiting approval
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {activeTab === "comments" && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comment</TableHead>
                        <TableHead>Post</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No comments requiring moderation
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Moderation Statistics</CardTitle>
              <CardDescription>
                Overview of moderation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-gray-500">Reported Content</div>
                  <div className="mt-1 text-2xl font-semibold">1</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-gray-500">Pending Approval</div>
                  <div className="mt-1 text-2xl font-semibold">0</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-gray-500">Moderated Today</div>
                  <div className="mt-1 text-2xl font-semibold">0</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SuperuserLayout>
    </SuperAdminGuard>
  );
};

export default Moderation;