import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@shared/schema';

interface UserGuardProps {
  children: ReactNode;
}

const UserGuard = ({ children }: UserGuardProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access to any authenticated user
  const hasAccess = !!user;

  if (!hasAccess) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

export default UserGuard;