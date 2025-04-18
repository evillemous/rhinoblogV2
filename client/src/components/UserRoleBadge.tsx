import { UserRole, ContributorType } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldAlert, ShieldCheck, User, UserCheck, Award, Stethoscope, HeartPulse, Camera, Pencil } from "lucide-react";

interface UserRoleBadgeProps {
  role?: string;
  contributorType?: string;
  showLabel?: boolean;
  className?: string;
  verified?: boolean;
}

export function UserRoleBadge({ 
  role = UserRole.USER, 
  contributorType,
  showLabel = true,
  className = "",
  verified = false
}: UserRoleBadgeProps) {
  let badgeColor = "";
  let badgeText = "";
  let icon = null;
  let tooltipText = "";

  // Determine badge style based on role
  switch (role) {
    case UserRole.SUPERADMIN:
      badgeColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      badgeText = "Superadmin";
      icon = <ShieldAlert className="h-3.5 w-3.5 mr-1" />;
      tooltipText = "Superadmin - Full platform control";
      break;
      
    case UserRole.ADMIN:
      badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      badgeText = "Admin";
      icon = <ShieldCheck className="h-3.5 w-3.5 mr-1" />;
      tooltipText = "Admin - Moderation privileges";
      break;
      
    case UserRole.CONTRIBUTOR:
      badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      badgeText = "Contributor";
      icon = <Award className="h-3.5 w-3.5 mr-1" />;
      
      // Add contributor type if available
      if (contributorType) {
        switch (contributorType) {
          case ContributorType.SURGEON:
            badgeText = verified ? "Verified Surgeon" : "Surgeon";
            icon = <Stethoscope className="h-3.5 w-3.5 mr-1" />;
            tooltipText = "Medical professional with rhinoplasty expertise";
            break;
            
          case ContributorType.PATIENT:
            badgeText = "Patient";
            icon = <HeartPulse className="h-3.5 w-3.5 mr-1" />;
            tooltipText = "Someone who has undergone rhinoplasty";
            break;
            
          case ContributorType.INFLUENCER:
            badgeText = verified ? "Verified Influencer" : "Influencer";
            icon = <Camera className="h-3.5 w-3.5 mr-1" />;
            tooltipText = "Social media content creator";
            break;
            
          case ContributorType.BLOGGER:
            badgeText = "Writer";
            icon = <Pencil className="h-3.5 w-3.5 mr-1" />;
            tooltipText = "Writes about rhinoplasty and related topics";
            break;
            
          default:
            tooltipText = "Trusted community contributor";
        }
      } else {
        tooltipText = "Trusted community contributor";
      }
      break;
      
    case UserRole.USER:
    default:
      badgeColor = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      badgeText = "Member";
      icon = <User className="h-3.5 w-3.5 mr-1" />;
      tooltipText = "Registered community member";
  }

  if (verified && role === UserRole.USER) {
    badgeColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    badgeText = "Verified User";
    icon = <UserCheck className="h-3.5 w-3.5 mr-1" />;
    tooltipText = "Verified community member";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`px-2 py-1 font-medium text-xs ${badgeColor} ${className}`}>
            {icon}
            {showLabel ? badgeText : null}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}