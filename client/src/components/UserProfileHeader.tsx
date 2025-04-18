import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRoleBadge } from "@/components/UserRoleBadge";
import { UserRole, ContributorType } from "@/context/AuthContext";

interface User {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  role?: string;
  contributorType?: string;
  verified?: boolean;
  bio?: string;
  trustScore?: number;
}

interface UserProfileHeaderProps {
  user: User;
  className?: string;
  showBio?: boolean;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserProfileHeader({
  user,
  className = "",
  showBio = true,
  showRole = true,
  size = 'md'
}: UserProfileHeaderProps) {
  // Calculate avatar size
  const avatarSizeClass = size === 'sm' 
    ? 'h-10 w-10' 
    : size === 'lg' 
      ? 'h-24 w-24' 
      : 'h-16 w-16';
      
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className={`flex items-start ${className}`}>
      <Avatar className={avatarSizeClass}>
        <AvatarImage src={user.avatarUrl} alt={user.username} />
        <AvatarFallback className="bg-primary/10">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>
      
      <div className="ml-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'}`}>
            {user.username}
          </h3>
          
          {showRole && (
            <UserRoleBadge 
              role={user.role}
              contributorType={user.contributorType}
              verified={user.verified}
              showLabel={true}
            />
          )}
        </div>
        
        {user.trustScore !== undefined && (
          <div className="text-xs text-muted-foreground mt-1">
            Trust Score: {user.trustScore}
          </div>
        )}
        
        {showBio && user.bio && (
          <p className="mt-2 text-muted-foreground text-sm">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}