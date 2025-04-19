import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Redirect to="/login?redirect=/admin/dashboard" />;
  }

  // Check if user has admin or superadmin role
  const isAdminOrSuperAdmin = 
    user.role === 'admin' || 
    user.role === 'superadmin';

  if (!isAdminOrSuperAdmin) {
    return <Redirect to="/" />;
  }

  // Render children if user has access
  return <>{children}</>;
};

export default AdminGuard;