import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ContributorGuardProps {
  children: ReactNode;
}

export const ContributorGuard = ({ children }: ContributorGuardProps) => {
  const { isLoading, isContributor } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isContributor()) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

export default ContributorGuard;