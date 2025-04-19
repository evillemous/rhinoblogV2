import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Briefcase, FileText, Settings, BarChart2, 
  MessageSquare, User, PenTool, CheckCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, ContributorType } from "@shared/schema";

interface ContributorLayoutProps {
  children: ReactNode;
  title: string;
}

export default function ContributorLayout({ children, title }: ContributorLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isContributorType = (type: string): boolean => {
    return user?.contributorType === type;
  };
  
  const contributorTypeLabel = (): string => {
    if (isContributorType(ContributorType.SURGEON)) return "Surgeon Contributor";
    if (isContributorType(ContributorType.PATIENT)) return "Patient Contributor";
    if (isContributorType(ContributorType.INFLUENCER)) return "Influencer Contributor";
    if (isContributorType(ContributorType.BLOGGER)) return "Blogger Contributor";
    return "Contributor";
  };
  
  const getBadgeColor = (): string => {
    if (isContributorType(ContributorType.SURGEON)) return "bg-blue-100 text-blue-800";
    if (isContributorType(ContributorType.PATIENT)) return "bg-green-100 text-green-800";
    if (isContributorType(ContributorType.INFLUENCER)) return "bg-purple-100 text-purple-800";
    if (isContributorType(ContributorType.BLOGGER)) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };
  
  const getContributorIcon = () => {
    if (isContributorType(ContributorType.SURGEON)) return <Briefcase className="h-4 w-4" />;
    if (isContributorType(ContributorType.PATIENT)) return <User className="h-4 w-4" />;
    if (isContributorType(ContributorType.INFLUENCER)) return <BarChart2 className="h-4 w-4" />;
    if (isContributorType(ContributorType.BLOGGER)) return <PenTool className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };
  
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/contributor/dashboard",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Content Hub",
      href: "/contributor/content",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Profile Settings",
      href: "/contributor/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Comments",
      href: "/contributor/comments",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {getContributorIcon()}
                </div>
              </div>
              <div>
                <div className="font-medium">{user?.username || "Contributor"}</div>
                <div className={cn("text-xs px-2 py-0.5 rounded-full inline-flex items-center", getBadgeColor())}>
                  {user?.verified && <CheckCircle className="h-3 w-3 mr-1" />}
                  {contributorTypeLabel()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                >
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      location === item.href
                        ? "bg-gray-100 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div
                      className={cn(
                        "mr-3 flex-shrink-0 h-6 w-6",
                        location === item.href
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 md:hidden p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 hidden md:block">{title}</h1>
              <div className="py-4">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}