import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required")
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const AdminOpenAI = () => {
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    tagline?: string;
  } | null>(null);
  
  // Form for API key
  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: ""
    }
  });
  
  // Check current API key status
  // Define the API status response type
  type ApiStatusResponse = {
    configured: boolean;
    key?: string;
    fullKey?: string;
  };

  const { data: apiStatus, isLoading: apiStatusLoading, error: apiStatusError } = useQuery<ApiStatusResponse>({
    queryKey: ["/api/admin/openai-status"],
    refetchInterval: false,
    retry: 1
  });
  
  // Set the API key in the form when the data is loaded
  useEffect(() => {
    if (apiStatus?.fullKey) {
      apiKeyForm.setValue("apiKey", apiStatus.fullKey);
    }
  }, [apiStatus, apiKeyForm]);
  
  // Test API key mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/admin/test-openai", data);
      return res.json();
    },
    onSuccess: (data) => {
      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "API Test Successful",
          description: "The OpenAI API key is working correctly",
        });
      } else {
        toast({
          title: "API Test Failed",
          description: data.message || "The API key did not work",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setTestResult({
        success: false,
        message: error.message || "Error testing API key"
      });
      
      toast({
        title: "Test Failed",
        description: error.message || "Error testing OpenAI API key",
        variant: "destructive",
      });
    }
  });
  
  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/admin/update-openai-key", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Updated",
        description: "The OpenAI API key has been updated successfully",
      });
      
      // Refetch status
      queryClient.invalidateQueries({ queryKey: ["/api/admin/openai-status"] });
      
      // Don't reset the form so key remains visible
      // Keep the current value in the form
      
      // Clear test result
      setTestResult(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Error updating OpenAI API key",
        variant: "destructive",
      });
    }
  });
  
  const onTestApiKey = (data: ApiKeyFormValues) => {
    setTestResult(null);
    testApiKeyMutation.mutate(data);
  };
  
  const onUpdateApiKey = () => {
    // Get the API key value directly from the form
    const apiKey = apiKeyForm.getValues().apiKey;
    
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: "API Key Required",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }
    
    // Update the API key without requiring a test
    updateApiKeyMutation.mutate({ apiKey });
    
    // Show feedback toast
    toast({
      title: "Updating API Key",
      description: "Please wait while we update your OpenAI API key...",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">OpenAI API Configuration</CardTitle>
        <CardDescription>
          Manage your OpenAI API key for content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current API Status</h3>
          
          {apiStatusLoading ? (
            <div className="flex items-center space-x-2 text-sm">
              <i className="fas fa-spinner fa-spin text-gray-400"></i>
              <span>Checking API status...</span>
            </div>
          ) : apiStatusError ? (
            <div className="flex items-center space-x-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>Error checking API status</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {apiStatus?.configured ? (
                <>
                  <Badge variant="outline" className="bg-rhino-navy/10 text-rhino-navy border-rhino-navy/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                  <span className="text-sm text-gray-500">Key: {apiStatus.key}</span>
                </>
              ) : (
                <Badge variant="outline" className="bg-rhino-orange/10 text-rhino-orange border-rhino-orange/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Test & Update Form */}
        <Form {...apiKeyForm}>
          <form className="space-y-4">
            <FormField
              control={apiKeyForm.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="sk-..." 
                      {...field} 
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="border-rhino-navy text-rhino-navy hover:bg-rhino-navy/10"
                onClick={apiKeyForm.handleSubmit(onTestApiKey)}
                disabled={testApiKeyMutation.isPending}
              >
                {testApiKeyMutation.isPending ? "Testing..." : "Test API Key"}
              </Button>
              
              <Button
                type="button"
                className="bg-rhino-navy hover:bg-rhino-navy/90"
                onClick={onUpdateApiKey}
                disabled={updateApiKeyMutation.isPending}
              >
                {updateApiKeyMutation.isPending ? "Updating..." : "Update API Key"}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Test Results */}
        {testResult && (
          <div className="mt-4">
            {testResult.success ? (
              <Alert className="bg-rhino-navy/10 text-rhino-navy border-rhino-navy/20">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>API Key is Valid</AlertTitle>
                <AlertDescription>
                  {testResult.tagline && (
                    <div className="mt-2 p-2 bg-white rounded-md border-rhino-navy/20 text-gray-700">
                      {testResult.tagline}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-rhino-orange/10 border-rhino-orange/20 text-rhino-orange">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Key Test Failed</AlertTitle>
                <AlertDescription>
                  {testResult.message || "Unable to connect to OpenAI API with this key."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Help Information */}
        <div className="space-y-2 text-sm text-gray-600">
          <h3 className="text-sm font-medium text-gray-700">How to Get an OpenAI API Key</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-rhino-navy hover:underline">OpenAI API Keys</a></li>
            <li>Log in to your OpenAI account (or create one)</li>
            <li>Click "Create New Secret Key" and give it a name</li>
            <li>Copy the key immediately (it won't be shown again)</li>
            <li>Paste it here and click "Test API Key" before saving</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 px-6 py-3">
        Your API key is used to generate AI content for the site. API costs will be billed to your OpenAI account.
      </CardFooter>
    </Card>
  );
};

export default AdminOpenAI;