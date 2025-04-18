// Import the existing useAuth hook from the AuthContext
import { useAuth as useExistingAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  role?: string;
  contributorType?: string;
}

// Create enhanced hook that wraps the existing hook
export function useAuth() {
  const auth = useExistingAuth();
  const { toast } = useToast();
  
  // Add new mutations for compatibility with the superuser dashboard components
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Use the existing login method with the token and user data
      auth.login(data.token, data.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      auth.logout();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Return combined object with both old and new properties
  return {
    ...auth,
    // Add TanStack mutations for new components
    loginMutation,
    logoutMutation,
    error: null,
    // Make sure user is available in the expected format
    user: auth.user
  };
}