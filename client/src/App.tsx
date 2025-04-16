import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { theme } = useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="bg-reddit-lightBg dark:bg-reddit-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-200 min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
