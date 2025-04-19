import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/lib/guards/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Bell, 
  Flag, 
  Archive,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Search,
  User,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InboxPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  
  // Mock data for messages
  const messages = [
    {
      id: 1,
      from: "sarah_smith",
      subject: "Question about surgeon verification",
      preview: "Hello, I'd like to know more about how surgeons are verified on the platform and what criteria...",
      content: "Hello Admin Team,\n\nI'd like to know more about how surgeons are verified on the platform and what criteria you use to authenticate them. I've seen some contributors with the SURGEON tag, but I'm curious about the verification process.\n\nAlso, is there a way to see their credentials or certification information?\n\nThank you,\nSarah",
      timestamp: new Date(2023, 3, 18, 10, 23),
      read: false,
      category: "inquiry",
      starred: true,
      replies: [],
    },
    {
      id: 2,
      from: "concerned_user42",
      subject: "Medical misinformation in a popular post",
      preview: "I wanted to report a post that contains potentially dangerous medical advice regarding...",
      content: "Hello,\n\nI wanted to report a post that contains potentially dangerous medical advice regarding post-operation care. The post titled 'My recovery shortcuts' (posted by user recovery_guru) suggests skipping certain medications and treatments prescribed by doctors.\n\nAs a medical professional, I find this concerning and potentially harmful to patients. Could you review this content?\n\nBest regards,\nA concerned medical professional",
      timestamp: new Date(2023, 3, 17, 15, 45),
      read: true,
      category: "report",
      starred: false,
      replies: [],
    },
    {
      id: 3,
      from: "surgeon_applicant",
      subject: "Contributor application status inquiry",
      preview: "I submitted my verification documents to be listed as a surgeon contributor three weeks ago and...",
      content: "Hello Admin Team,\n\nI submitted my verification documents to be listed as a surgeon contributor three weeks ago and haven't heard back. Could you provide an update on my application status?\n\nI've included my medical license, board certification in plastic surgery, and other requested documents in my initial application.\n\nThank you for your time,\nDr. Michael Robertson\nBoard Certified Plastic Surgeon",
      timestamp: new Date(2023, 3, 16, 9, 12),
      read: true,
      category: "application",
      starred: true,
      replies: [
        {
          id: 101,
          from: "admin",
          content: "Hello Dr. Robertson,\n\nThank you for your patience. We are currently reviewing your application and documents. The verification process typically takes 3-4 weeks as we thoroughly verify all credentials.\n\nWe'll notify you as soon as the review is complete. If we need any additional information, we'll reach out to you directly.\n\nBest regards,\nRhinoplastyBlogs Admin Team",
          timestamp: new Date(2023, 3, 16, 14, 30),
        }
      ],
    },
    {
      id: 4,
      from: "new_blogger",
      subject: "Request to become a contributor",
      preview: "I run a blog about my rhinoplasty journey and would like to contribute regularly to your platform...",
      content: "Hi there,\n\nI run a blog about my rhinoplasty journey that has gained quite a following over the past year. I'd love to become a regular contributor to your platform to share my experiences and insights with your community.\n\nMy blog gets around 5,000 visitors per month, and I've documented my entire rhinoplasty experience from consultation to 1-year post-op. I think my content would be valuable to your users who are considering or recovering from rhinoplasty.\n\nHow can I apply to become a contributor? Do you have specific requirements or an application process?\n\nLooking forward to hearing from you,\nEmma Johnson",
      timestamp: new Date(2023, 3, 15, 11, 20),
      read: true,
      category: "application",
      starred: false,
      replies: [],
    },
    {
      id: 5,
      from: "technical_issue",
      subject: "Unable to upload before/after photos",
      preview: "I've been trying to upload comparison photos to my rhinoplasty journey post but keep getting an error...",
      content: "Hello Support Team,\n\nI've been trying to upload before/after photos to my rhinoplasty journey post but keep getting an error message saying 'File format not supported'. I've tried both JPEG and PNG formats but neither seem to work.\n\nI'm using Chrome on Windows 10, and the photos are under 5MB each.\n\nCan you help me troubleshoot this issue?\n\nThanks,\nAlexander",
      timestamp: new Date(2023, 3, 14, 16, 35),
      read: true,
      category: "support",
      starred: false,
      replies: [],
    },
  ];

  const filteredMessages = messages.filter((message) => {
    // First, filter by tab selection
    if (activeTab !== "all" && message.category !== activeTab) {
      return false;
    }
    
    // Then filter by search query
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        message.from.toLowerCase().includes(search) ||
        message.subject.toLowerCase().includes(search) ||
        message.content.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const handleSelectMessage = (message: any) => {
    setSelectedMessage(message);
    // In a real app, we would mark the message as read here
  };

  const handleSendReply = () => {
    if (!replyContent.trim() || !selectedMessage) return;
    
    // In a real app, we would send the reply to the API
    alert("Reply would be sent: " + replyContent);
    setReplyContent("");
    
    // For demo purposes, we'll just update the local state
    const updatedMessage = {
      ...selectedMessage,
      replies: [
        ...selectedMessage.replies,
        {
          id: Math.random(),
          from: "admin",
          content: replyContent,
          timestamp: new Date(),
        }
      ]
    };
    
    setSelectedMessage(updatedMessage);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inquiry":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "report":
        return <Flag className="h-4 w-4 text-red-500" />;
      case "application":
        return <Users className="h-4 w-4 text-green-500" />;
      case "support":
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "inquiry":
        return <Badge className="bg-blue-100 text-blue-800">Inquiry</Badge>;
      case "report":
        return <Badge className="bg-red-100 text-red-800">Report</Badge>;
      case "application":
        return <Badge className="bg-green-100 text-green-800">Application</Badge>;
      case "support":
        return <Badge className="bg-amber-100 text-amber-800">Support</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Admin Inbox">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Communication Center</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="inquiry">Inquiries</TabsTrigger>
                      <TabsTrigger value="report">Reports</TabsTrigger>
                      <TabsTrigger value="application">Applications</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] overflow-auto">
                  <div className="space-y-2">
                    {filteredMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id 
                            ? 'bg-muted border-primary' 
                            : message.read 
                              ? 'hover:bg-muted/50' 
                              : 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                        }`}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium flex items-center">
                            {getCategoryIcon(message.category)}
                            <span className="ml-1">@{message.from}</span>
                            {!message.read && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(message.timestamp, "MMM d")}
                          </div>
                        </div>
                        <div className="font-medium text-sm mb-1">{message.subject}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{message.preview}</div>
                        <div className="flex justify-between items-center mt-2">
                          <div>{getCategoryBadge(message.category)}</div>
                          {message.starred && <Star className="h-4 w-4 text-amber-400" />}
                        </div>
                      </div>
                    ))}
                    
                    {filteredMessages.length === 0 && (
                      <div className="text-center p-4 text-muted-foreground">
                        <Mail className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                        <p>No messages found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedMessage ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          From: @{selectedMessage.from}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span>Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              {selectedMessage.starred ? (
                                <>
                                  <Star className="mr-2 h-4 w-4 text-amber-400" />
                                  Unstar Message
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-4 w-4" />
                                  Star Message
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Mark as Spam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Received: {format(selectedMessage.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <div>{getCategoryBadge(selectedMessage.category)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto pt-4">
                    <div className="space-y-6">
                      <div className="bg-muted/20 p-4 rounded-md">
                        <div className="whitespace-pre-line">
                          {selectedMessage.content}
                        </div>
                      </div>
                      
                      {selectedMessage.replies.length > 0 && (
                        <div className="pt-4 space-y-4">
                          {selectedMessage.replies.map((reply: any) => (
                            <div key={reply.id} className="p-4 rounded-md bg-primary/5 border">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center text-sm font-medium">
                                  <User className="h-4 w-4 mr-1" />
                                  From: @{reply.from}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(reply.timestamp, "MMM d, yyyy 'at' h:mm a")}
                                </div>
                              </div>
                              <div className="whitespace-pre-line text-sm">
                                {reply.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-shrink-0 border-t p-4">
                    <div className="w-full">
                      <Textarea
                        placeholder="Type your reply here..."
                        className="mb-2 min-h-20"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Select defaultValue="template_none">
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Templates" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="template_none">No Template</SelectItem>
                              <SelectItem value="template_application">Application Response</SelectItem>
                              <SelectItem value="template_support">Support Response</SelectItem>
                              <SelectItem value="template_report">Report Acknowledgment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
                          <Send className="h-4 w-4 mr-1" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No message selected</h3>
                    <p className="mt-2 text-muted-foreground">
                      Select a message from the inbox to view its contents
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default InboxPage;