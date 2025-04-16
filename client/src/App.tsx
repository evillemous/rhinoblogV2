import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Admin from "@/pages/Admin";
import AdminLink from "@/pages/AdminLink";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/popular" component={Home} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/tag/:tagName" component={Home} />
      <Route path="/community/:communityName" component={Home} />
      <Route path="/my-profile" component={Home} />
      <Route path="/auth" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin-link" component={AdminLink} />
      <Route path="/login" component={Login} />
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
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-2">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
