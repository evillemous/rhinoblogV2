import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import AdminPostGenerator from "@/components/AdminPostGenerator";
import AdminPostList from "@/components/AdminPostList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, user, setLocation]);
  
  // Don't render the component until we've checked auth status
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Loading admin dashboard...</p>
      </div>
    );
  }
  
  // Redirect if not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }
  
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Content Generator</TabsTrigger>
              <TabsTrigger value="manage">Manage Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <AdminPostGenerator />
            </TabsContent>
            <TabsContent value="manage">
              <AdminPostList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
