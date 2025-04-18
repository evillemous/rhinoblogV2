import { useState } from "react";
import AdminPostGenerator from "@/components/AdminPostGenerator";
import AdminPostList from "@/components/AdminPostList";
import AdminOpenAI from "@/components/AdminOpenAI";
import AdminTagManagement from "@/components/AdminTagManagement";
import AdminTopicManagement from "@/components/AdminTopicManagement";
import AuthDebugger from "@/components/AuthDebugger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  // We'll skip authentication checks for now
  const [isLoading, setIsLoading] = useState(false);
  
  // No authentication or admin checks - direct access
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-ibm-plex">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage posts, generate AI content, and configure automated posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="generate">Content Generator</TabsTrigger>
              <TabsTrigger value="manage">Manage Posts</TabsTrigger>
              <TabsTrigger value="tags">Manage Tags</TabsTrigger>
              <TabsTrigger value="topics">Manage Topics</TabsTrigger>
              <TabsTrigger value="openai">OpenAI Settings</TabsTrigger>
              <TabsTrigger value="debug">Auth Debug</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <AdminPostGenerator />
            </TabsContent>
            <TabsContent value="manage">
              <AdminPostList />
            </TabsContent>
            <TabsContent value="tags">
              <AdminTagManagement />
            </TabsContent>
            <TabsContent value="topics">
              <AdminTopicManagement />
            </TabsContent>
            <TabsContent value="openai">
              <AdminOpenAI />
            </TabsContent>
            <TabsContent value="debug">
              <AuthDebugger />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
