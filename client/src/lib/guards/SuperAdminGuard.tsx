import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface SuperAdminGuardProps {
  children: ReactNode;
}

const SuperAdminGuard = ({ children }: SuperAdminGuardProps) => {
  const { user, isLoading } = useAuth();

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
  if (!user || user.role !== 'superadmin') {
    console.log("Access denied - insufficient role:", user?.role);
    return <Redirect to="/" />;
  }

  return <>{children}</>;
};

export default SuperAdminGuard;