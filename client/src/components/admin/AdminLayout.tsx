import { Link, useLocation } from "wouter";
import { 
  Shield, 
  FileText, 
  Users, 
  UserCog, 
  Tag, 
  Inbox, 
  BarChart3, 
  Home, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: "Content Moderation",
      href: "/admin/moderation",
      icon: Shield,
      active: location === "/admin/moderation",
    },
    {
      name: "Posts & Comments",
      href: "/admin/posts",
      icon: FileText,
      active: location === "/admin/posts",
    },
    {
      name: "Contributors",
      href: "/admin/contributors",
      icon: UserCog,
      active: location === "/admin/contributors",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      active: location === "/admin/users",
    },
    {
      name: "Tags & Taxonomy",
      href: "/admin/tags",
      icon: Tag,
      active: location === "/admin/tags",
    },
    {
      name: "Inbox",
      href: "/admin/inbox",
      icon: Inbox,
      active: location === "/admin/inbox",
    },
    {
      name: "Moderation Metrics",
      href: "/admin/stats",
      icon: BarChart3,
      active: location === "/admin/stats",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <header className="border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user?.username || "Admin"}</span>
            </span>
            <Link href="/">
              <a className="flex items-center text-sm text-primary">
                <Home className="mr-1 h-4 w-4" />
                Back to Site
              </a>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar navigation */}
        <aside className="w-64 border-r bg-muted/30">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-1 p-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/80"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-6">
            <div className="mb-6 flex items-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Admin Dashboard
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;