import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleRedirectResult } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onUserLoaded?: (user: any) => void;
}

export default function ProtectedRoute({ children, onUserLoaded }: ProtectedRouteProps) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        onUserLoaded?.(user);
      } else {
        // Check for redirect result
        try {
          const result = await handleRedirectResult();
          if (result) {
            setFirebaseUser(result);
            onUserLoaded?.(result);
          }
        } catch (error) {
          console.error("Redirect handling error:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [onUserLoaded]);

  const { data: dbUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/user", firebaseUser?.email],
    enabled: !!firebaseUser?.email,
    queryFn: async () => {
      const response = await fetch(`/api/user/${firebaseUser.email}`);
      if (response.status === 404) {
        return null; // User not found in DB
      }
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
  });

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

  return children;
}
