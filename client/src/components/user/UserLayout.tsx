import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  User, Settings, FileText, MessageSquare, 
  Bookmark, Tag, PlusCircle, BarChart,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

interface UserLayoutProps {
  children: ReactNode;
  title: string;
}

export default function UserLayout({ children, title }: UserLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Navigation items for the user dashboard
  const navigationItems = [
    {
      name: "Back to Main Site",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Dashboard",
      href: "/user/dashboard",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Profile Settings",
      href: "/user/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "My Posts",
      href: "/user/posts",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "My Comments",
      href: "/user/comments",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Saved Content",
      href: "/user/saved",
      icon: <Bookmark className="h-5 w-5" />,
    },
    {
      name: "Followed Tags",
      href: "/user/tags",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: "Create Post",
      href: "/user/create-post",
      icon: <PlusCircle className="h-5 w-5" />,
    }
  ];

  const getTrustScore = () => {
    // Placeholder for actual trust score calculation
    return user?.trustScore || 0;
  };

  // Trust level representation
  const getTrustLevel = (score: number) => {
    if (score >= 50) return { level: "Contributor Eligible", color: "text-green-600" };
    if (score >= 30) return { level: "Trusted Member", color: "text-blue-600" };
    if (score >= 10) return { level: "Active Member", color: "text-yellow-600" };
    return { level: "New Member", color: "text-gray-600" };
  };
  
  const trustScore = getTrustScore();
  const trustLevel = getTrustLevel(trustScore);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="font-medium">{user?.username || "User"}</div>
                <div className={cn("text-xs px-2 py-0.5 rounded-full", 
                                  "bg-gray-100 inline-flex items-center", 
                                  trustLevel.color)}>
                  {trustLevel.level}
                </div>
              </div>
            </div>
            
            {/* Trust score progress */}
            {trustScore < 50 && (
              <div className="mt-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>Trust Score</span>
                  <span className="font-medium">{trustScore}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (trustScore / 50) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {50 - trustScore} points to contributor eligibility
                </div>
              </div>
            )}
            
            {/* Contributor application prompt */}
            {trustScore >= 50 && user?.role === UserRole.USER && (
              <div className="mt-2 bg-green-50 p-2 rounded-md border border-green-200">
                <div className="text-xs text-green-800 font-medium">
                  You've unlocked contributor eligibility! 
                </div>
                <Link href="/user/apply-contributor">
                  <a className="text-xs text-green-700 underline">
                    Apply now to share stories more freely
                  </a>
                </Link>
              </div>
            )}
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
          <div className="flex items-center space-x-3">
            <Link href="/">
              <a className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                <Home className="h-5 w-5" />
              </a>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
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