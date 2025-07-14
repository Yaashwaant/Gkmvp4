import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Signed In",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center bg-gradient-to-br from-green-light to-white">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-leaf text-white text-2xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">GreenKarma</h1>
        <p className="text-gray-600 text-lg">Earn rewards for your green rides</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-600 mb-6">
          {isSignUp 
            ? "Join GreenKarma and start earning rewards for your eco-friendly rides!"
            : "Track your EV kilometers and earn carbon credits that convert to real money!"
          }
        </p>
        
        {/* Google Authentication */}
        <button
          onClick={handleGoogleAuth}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors mb-4"
        >
          <i className="fab fa-google text-red-500"></i>
          <span className="font-medium text-gray-700">
            {isSignUp ? "Sign up with Google" : "Continue with Google"}
          </span>
        </button>
        
        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl"
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-primary hover:bg-green-dark text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
        </form>
        
        {/* Toggle between Sign In and Sign Up */}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-green-primary hover:text-green-dark font-medium"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}
