import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface SuperAdminGuardProps {
  children: ReactNode;
}

const SuperAdminGuard = ({ children }: SuperAdminGuardProps) => {
  const auth = useAuth();
  const user = auth.user;
  const isLoading = auth.isLoading;

  useEffect(() => {
    // Additional logging for debugging access control
    if (user) {
      console.log("SuperAdminGuard - User:", user.username, "Role:", user.role);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rhino-navy" />
      </div>
    );
  }

  // Only allow superadmin role
  if (!auth.isSuperAdmin()) {
    console.log("Access denied - insufficient role:", user?.role);
    return <Redirect to="/" />;
  }

  return <>{children}</>;
};

export default SuperAdminGuard;