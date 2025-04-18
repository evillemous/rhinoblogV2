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

// Superuser Dashboard Pages
import AIEngine from "@/pages/superuser/AIEngine";
import PlatformSettings from "@/pages/superuser/PlatformSettings";
import UserManagement from "@/pages/superuser/UserManagement";

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
      
      {/* Superuser Dashboard Routes */}
      <Route path="/super/ai-engine" component={AIEngine} />
      <Route path="/super/platform-settings" component={PlatformSettings} />
      <Route path="/super/users" component={UserManagement} />
      
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
  
  // Check if current route is a superuser dashboard route
  const isSuperuserRoute = location.startsWith('/super/');
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        {!isSuperuserRoute && <Header />}
        <main className={`flex-grow ${isSuperuserRoute ? '' : ''}`}>
          <Router />
        </main>
        {!isSuperuserRoute && <Footer />}
        <Toaster />
      </div>
    </div>
  );
}

export default App;
