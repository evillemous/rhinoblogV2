import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  Shield,
  BarChart3,
  Bot,
  Code,
  FileText,
  Menu,
  X,
  Compass,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface SuperuserLayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  title: string;
  icon: ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: "AI Content Engine",
    icon: <Bot className="mr-2 h-4 w-4" />,
    href: "/super/ai-engine",
  },
  {
    title: "Platform Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
    href: "/super/platform-settings",
  },
  {
    title: "User Management",
    icon: <Users className="mr-2 h-4 w-4" />,
    href: "/super/users",
  },
  {
    title: "Moderation",
    icon: <Shield className="mr-2 h-4 w-4" />,
    href: "/super/moderation",
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
    href: "/super/analytics",
  },
  {
    title: "Developer Tools",
    icon: <Code className="mr-2 h-4 w-4" />,
    href: "/super/dev-tools",
  },
  {
    title: "Content Management",
    icon: <FileText className="mr-2 h-4 w-4" />,
    href: "/super/content",
  },
];

const SuperuserLayout = ({ children, title }: SuperuserLayoutProps) => {
  const [location] = useLocation();
  const auth = useAuth();
  const user = auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-rhino-navy text-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-screen flex-col">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-10 mt-5">
              <Compass className="h-8 w-8 text-[#F4884A]" />
              <div>
                <h2 className="text-lg font-bold">RhinoplastyBlogs</h2>
                <p className="text-xs text-gray-400">Superuser Dashboard</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="rounded-lg bg-white/10 p-2 text-sm">
                <div className="font-medium">{user?.username}</div>
                <div className="text-xs text-gray-400">{user?.role}</div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      location === item.href
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </a>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4">
            <div className="space-y-2">
              <Link href="/">
                <a className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white">
                  <Compass className="mr-2 h-4 w-4" />
                  Back to Main Site
                </a>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-rhino-navy">{title}</h1>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default SuperuserLayout;