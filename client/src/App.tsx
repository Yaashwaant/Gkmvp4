import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
// Remove redirect result import for popup auth
import { useQuery } from "@tanstack/react-query";

import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import WalletPage from "./pages/WalletPage";
import HistoryPage from "./pages/HistoryPage";
import BottomNavigation from "./components/BottomNavigation";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location, setLocation] = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email || "No user");
      if (user) {
        console.log("Firebase user authenticated:", user.email);
        setFirebaseUser(user);
      } else {
        console.log("No Firebase user found");
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { data: dbUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/user", firebaseUser?.email],
    enabled: !!firebaseUser?.email,
      queryFn: async () => {
      console.log("Fetching user from DB for:", firebaseUser.email);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/${firebaseUser.email}`);
      console.log("User fetch response status:", response.status);
      if (response.status === 404) {
        console.log("User not found in DB, showing onboarding");
        return null; // User not found in DB
      }
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const user = await response.json();
      console.log("User found in DB:", user);
      return user;
    },
  });

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-leaf text-white text-2xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!firebaseUser) {
    console.log("No Firebase user, showing LoginPage");
    return <LoginPage />;
  }

  // Authenticated but not onboarded
  if (firebaseUser && !dbUser) {
    console.log("Firebase user exists but no DB user, showing onboarding");
    return (
      <OnboardingPage 
        user={firebaseUser} 
        onComplete={() => {
          console.log("Onboarding completed, redirecting to dashboard");
          setLocation("/dashboard");
        }} 
      />
    );
  }

  // Authenticated and onboarded
  console.log("User authenticated and onboarded, showing main app");
  const showBottomNav = ["/dashboard", "/upload", "/wallet", "/history"].includes(location);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen relative">
      <Switch>
        <Route path="/dashboard">
          <DashboardPage user={dbUser} onNavigate={handleNavigation} />
        </Route>
        <Route path="/upload">
          <UploadPage user={dbUser} onBack={() => setLocation("/dashboard")} />
        </Route>
        <Route path="/wallet">
          <WalletPage user={dbUser} onBack={() => setLocation("/dashboard")} />
        </Route>
        <Route path="/history">
          <HistoryPage user={dbUser} onBack={() => setLocation("/dashboard")} />
        </Route>
        <Route path="/">
          <DashboardPage user={dbUser} onNavigate={handleNavigation} />
        </Route>
        <Route component={NotFound} />
      </Switch>
      
      {showBottomNav && (
        <BottomNavigation onNavigate={handleNavigation} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
