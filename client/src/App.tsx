import { lazy, Suspense } from "react";
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
import UserGuard from "@/lib/guards/UserGuard";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminModeration from "@/pages/admin/Moderation";
import AdminPosts from "@/pages/admin/Posts";
import AdminContributors from "@/pages/admin/Contributors";
import AdminUsers from "@/pages/admin/Users";
import AdminTags from "@/pages/admin/Tags";
import AdminStats from "@/pages/admin/Stats";
import AdminInbox from "@/pages/admin/Inbox";

// Contributor Dashboard Pages
import ContributorDashboard from "@/pages/contributor/Dashboard";
import ContributorContent from "@/pages/contributor/Content";
import ContributorSettings from "@/pages/contributor/Settings";
import ContributorComments from "@/pages/contributor/Comments";

// User Dashboard Pages
import UserDashboard from "@/pages/user/Dashboard";
import UserSettings from "@/pages/user/Settings";
import UserPosts from "@/pages/user/Posts";

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
      
      {/* Contributor Dashboard Routes */}
      <Route path="/contributor/dashboard" component={ContributorDashboard} />
      <Route path="/contributor/content" component={ContributorContent} />
      <Route path="/contributor/settings" component={ContributorSettings} />
      <Route path="/contributor/comments" component={ContributorComments} />
      
      {/* User Dashboard Routes - Protected with UserGuard */}
      <Route path="/user/dashboard">
        {() => (
          <UserGuard>
            <UserDashboard />
          </UserGuard>
        )}
      </Route>
      <Route path="/user/settings">
        {() => (
          <UserGuard>
            <UserSettings />
          </UserGuard>
        )}
      </Route>
      <Route path="/user/posts">
        {() => (
          <UserGuard>
            <UserPosts />
          </UserGuard>
        )}
      </Route>
      <Route path="/user/comments">
        {() => (
          <UserGuard>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              {lazy(() => import("@/pages/user/Comments"))()}
            </Suspense>
          </UserGuard>
        )}
      </Route>
      <Route path="/user/saved">
        {() => (
          <UserGuard>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              {lazy(() => import("@/pages/user/Saved"))()}
            </Suspense>
          </UserGuard>
        )}
      </Route>
      <Route path="/user/tags">
        {() => (
          <UserGuard>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              {lazy(() => import("@/pages/user/Tags"))()}
            </Suspense>
          </UserGuard>
        )}
      </Route>
      <Route path="/user/create-post">
        {() => (
          <UserGuard>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              {lazy(() => import("@/pages/user/CreatePost"))()}
            </Suspense>
          </UserGuard>
        )}
      </Route>
      <Route path="/user/apply-contributor">
        {() => (
          <UserGuard>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              {lazy(() => import("@/pages/user/ApplyContributor"))()}
            </Suspense>
          </UserGuard>
        )}
      </Route>
      
      {/* Superuser Dashboard Routes - Protected with SuperAdminGuard */}
      <Route path="/super/ai-engine">
        {() => (
          <SuperAdminGuard>
            <AIEngine />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/platform-settings">
        {() => (
          <SuperAdminGuard>
            <PlatformSettings />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/users">
        {() => (
          <SuperAdminGuard>
            <UserManagement />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/moderation">
        {() => (
          <SuperAdminGuard>
            <Moderation />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/analytics">
        {() => (
          <SuperAdminGuard>
            <Analytics />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/dev-tools">
        {() => (
          <SuperAdminGuard>
            <DevTools />
          </SuperAdminGuard>
        )}
      </Route>
      <Route path="/super/content">
        {() => (
          <SuperAdminGuard>
            <ContentManagement />
          </SuperAdminGuard>
        )}
      </Route>
      
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
  
  // Check if current route is a dashboard route (superuser, admin, contributor, or user)
  const isSuperuserRoute = location.includes('/super/');
  const isAdminRoute = location.includes('/admin/') && location !== '/admin-link';
  const isContributorRoute = location.includes('/contributor/');
  const isUserRoute = location.includes('/user/');
  const isDashboardRoute = isSuperuserRoute || isAdminRoute || isContributorRoute || isUserRoute;
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        {!isDashboardRoute && <Header />}
        <main className="flex-grow">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <Router />
          </Suspense>
        </main>
        {!isDashboardRoute && <Footer />}
        <Toaster />
      </div>
    </div>
  );
}

export default App;
