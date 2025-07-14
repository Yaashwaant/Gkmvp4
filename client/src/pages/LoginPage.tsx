import { signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to GreenKarma</h2>
        <p className="text-gray-600 mb-6">
          Track your EV kilometers and earn carbon credits that convert to real money!
        </p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors"
        >
          <i className="fab fa-google text-red-500"></i>
          <span className="font-medium text-gray-700">Continue with Google</span>
        </button>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}
