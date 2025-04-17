import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const AuthDebugger = () => {
  const { isAuthenticated, user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  
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
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Authentication Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Authentication Status:</div>
          <div>{isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>
          
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
        >
          Refresh Token Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;