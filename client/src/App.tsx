import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import Admin from "@/pages/Admin";
import AdminLink from "@/pages/AdminLink";
import Login from "@/pages/Login";
import TagPage from "@/pages/TagPage";
import TopicPage from "@/pages/TopicPage";
import Topics from "@/pages/Topics";
import ProfileSettings from "@/pages/ProfileSettings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminModeration from "@/pages/admin/Moderation";
import AdminPosts from "@/pages/admin/Posts";
import AdminContributors from "@/pages/admin/Contributors";
import AdminUsers from "@/pages/admin/Users";
import AdminTags from "@/pages/admin/Tags";
import AdminStats from "@/pages/admin/Stats";
import AdminInbox from "@/pages/admin/Inbox";

// Superuser Dashboard Pages
import AIEngine from "@/pages/superuser/AIEngine";
import PlatformSettings from "@/pages/superuser/PlatformSettings";
import UserManagement from "@/pages/superuser/UserManagement";
import Moderation from "@/pages/superuser/Moderation";
import Analytics from "@/pages/superuser/Analytics";
import DevTools from "@/pages/superuser/DevTools";
import ContentManagement from "@/pages/superuser/ContentManagement";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/popular" component={Home} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/tag/:tagName" component={TagPage} />
      <Route path="/topic/:topicSlug" component={TopicPage} />
      <Route path="/topics" component={Topics} />
      <Route path="/login" component={Login} />
      <Route path="/profile/settings" component={ProfileSettings} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin-link" component={AdminLink} />
      
      {/* Admin Dashboard Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/contributors" component={AdminContributors} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/tags" component={AdminTags} />
      <Route path="/admin/stats" component={AdminStats} />
      <Route path="/admin/inbox" component={AdminInbox} />
      
      {/* Superuser Dashboard Routes */}
      <Route path="/super/ai-engine" component={AIEngine} />
      <Route path="/super/platform-settings" component={PlatformSettings} />
      <Route path="/super/users" component={UserManagement} />
      <Route path="/super/moderation" component={Moderation} />
      <Route path="/super/analytics" component={Analytics} />
      <Route path="/super/dev-tools" component={DevTools} />
      <Route path="/super/content" component={ContentManagement} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [location] = useLocation();
  
  // Check if current route is a dashboard route (superuser or admin)
  const isSuperuserRoute = location.includes('/super/');
  const isAdminRoute = location.includes('/admin/') && location !== '/admin-link';
  const isDashboardRoute = isSuperuserRoute || isAdminRoute;
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        {!isDashboardRoute && <Header />}
        <main className="flex-grow">
          <Router />
        </main>
        {!isDashboardRoute && <Footer />}
        <Toaster />
      </div>
    </div>
  );
}

export default App;
