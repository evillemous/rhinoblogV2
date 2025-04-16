import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality when backend supports it
    console.log("Search for:", searchQuery);
  };
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-reddit-orange flex items-center justify-center">
              <i className="fas fa-nose text-white"></i>
            </div>
            <span className="font-ibm-plex font-bold text-xl hidden sm:block">RhinoplastyBlogs</span>
          </Link>
        </div>
        
        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for posts, topics, experiences..."
                className="bg-gray-100 dark:bg-gray-800 w-full py-1.5 pl-10 pr-3 rounded-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-2 text-gray-400"></i>
            </div>
          </form>
        </div>
        
        {/* Right actions */}
        <div className="flex items-center space-x-4">
          {/* Admin Dashboard Button - only visible for admins */}
          {isAuthenticated && user?.isAdmin && (
            <Button
              variant="default"
              className="hidden md:flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => navigate("/admin")}
            >
              <i className="fas fa-user-shield mr-1"></i>
              Admin Dashboard
            </Button>
          )}
        
          {/* Dark mode toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Login/user */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-reddit-orange text-white">
                      {user ? getInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.username}
                  {user?.isAdmin && (
                    <span className="ml-2 px-1 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                      Admin
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/")}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex space-x-2">
              <Button 
                variant="outline" 
                className="text-reddit-blue border border-reddit-blue hover:bg-gray-50 dark:hover:bg-reddit-darkHover px-4 py-1 rounded-full text-sm font-medium"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button
                className="bg-reddit-blue hover:bg-blue-600 px-4 py-1 rounded-full text-sm font-medium"
                onClick={() => navigate("/login?tab=register")}
              >
                Sign Up
              </Button>
            </div>
          )}
          
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="p-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-reddit-orange text-white">
                      {user ? getInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user?.username}</span>
                  {user?.isAdmin && (
                    <span className="ml-2 px-1 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                      Admin
                    </span>
                  )}
                </div>
                {user?.isAdmin && (
                  <Button
                    variant="default"
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      navigate("/admin");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user-shield mr-2"></i>
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate("/login?tab=register");
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
