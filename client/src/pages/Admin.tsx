import { useState } from "react";
import AdminPostGenerator from "@/components/AdminPostGenerator";
import AdminPostList from "@/components/AdminPostList";
import AdminOpenAI from "@/components/AdminOpenAI";
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Content Generator</TabsTrigger>
              <TabsTrigger value="manage">Manage Posts</TabsTrigger>
              <TabsTrigger value="openai">OpenAI Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <AdminPostGenerator />
            </TabsContent>
            <TabsContent value="manage">
              <AdminPostList />
            </TabsContent>
            <TabsContent value="openai">
              <AdminOpenAI />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
