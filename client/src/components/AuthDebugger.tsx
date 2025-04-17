import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthDebugger = () => {
  const { isAuthenticated, user, login } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("rhinoadmin123");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  useEffect(() => {
    // Get token from localStorage on component mount
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);
  
  // Manually check token in localStorage
  const refreshToken = () => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  };
  
  // Manual login function
  const manualLogin = async () => {
    try {
      setIsLoggingIn(true);
      
      // Direct login request
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Manual login through Auth context
      login(data.token, data.user);
      
      toast({
        title: "Manual login successful",
        description: `Logged in as ${data.user.username}`,
      });
      
      // Refresh token display
      refreshToken();
    } catch (error) {
      toast({
        title: "Manual login failed",
        description: error.message || "Check console for details",
        variant: "destructive",
      });
      console.error("Manual login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Test API key save
  const testApiKeySave = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/update-openai-key", { 
        apiKey: "sk-test-debugger-key-123" 
      });
      
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }
      
      toast({
        title: "API key save test successful",
        description: "API key request was successful",
      });
    } catch (error) {
      toast({
        title: "API key save test failed",
        description: error.message || "Check console for details",
        variant: "destructive",
      });
      console.error("API key save test error:", error);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Authentication Debugger</CardTitle>
        <CardDescription>
          Troubleshoot authentication issues and test API requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Auth Status */}
        <div>
          <h3 className="text-md font-medium mb-2">Current Authentication Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Status:</div>
            <div>{isAuthenticated ? 
              <span className="text-green-600 font-bold">Authenticated</span> : 
              <span className="text-red-600 font-bold">Not Authenticated</span>}
            </div>
            
            <div className="font-medium">User:</div>
            <div>{user ? `${user.username} (ID: ${user.id}, Admin: ${user.isAdmin ? 'Yes' : 'No'})` : "No user"}</div>
            
            <div className="font-medium">Token in localStorage:</div>
            <div className="break-all">
              {token ? (
                <div>
                  <span className="text-green-600">Token exists</span>
                  <div className="mt-1 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    {token.substring(0, 20)}...{token.substring(token.length - 10)}
                  </div>
                </div>
              ) : (
                <span className="text-red-600">No token found</span>
              )}
            </div>
          </div>
          
          <Button 
            onClick={refreshToken}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Refresh Token Status
          </Button>
        </div>
        
        <Separator />
        
        {/* Manual Login Tool */}
        <div>
          <h3 className="text-md font-medium mb-2">Manual Login Tool</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="font-medium">Username:</div>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
              
              <div className="font-medium">Password:</div>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="rhinoadmin123"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={manualLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging In..." : "Manual Login"}
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* API Request Tests */}
        <div>
          <h3 className="text-md font-medium mb-2">API Request Tests</h3>
          
          <Button 
            onClick={testApiKeySave}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={!isAuthenticated}
          >
            Test OpenAI API Key Save
          </Button>
          
          {!isAuthenticated && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Not Authenticated</AlertTitle>
              <AlertDescription>
                You must be logged in with an admin account to test API requests.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;