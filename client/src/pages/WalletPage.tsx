import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface WalletPageProps {
  user: any;
  onBack: () => void;
}

export default function WalletPage({ user, onBack }: WalletPageProps) {
  const { toast } = useToast();

  const { data: uploads = [] } = useQuery({
    queryKey: ["/api/uploads", user?.id],
    enabled: !!user?.id,
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: string }) => {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process withdrawal");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Initiated",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = (method: string) => {
    const amount = parseFloat(user?.balanceINR || "0");
    if (amount <= 0) {
      toast({
        title: "No Balance",
        description: "You don't have any balance to withdraw",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount, method });
  };

  const recentActivity = uploads.slice(0, 5);

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Wallet</h2>
          <div></div>
        </div>
        
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-primary to-green-dark rounded-2xl p-6 text-white mb-6">
          <div className="text-center">
            <p className="text-green-100 mb-2">Total Balance</p>
            <p className="text-4xl font-bold mb-4">₹{user?.balanceINR || "0"}</p>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2 inline-block">
              <span className="text-sm">{user?.carbonCredits || "0.000"} Carbon Credits</span>
            </div>
          </div>
        </div>
        
        {/* Withdraw Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Withdraw Options</h3>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-university text-blue-500"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Bank Transfer</p>
                  <p className="text-sm text-gray-500">Instant transfer to bank</p>
                </div>
              </div>
              <Button
                onClick={() => handleWithdraw("Bank Transfer")}
                disabled={withdrawMutation.isPending}
                className="bg-green-primary hover:bg-green-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-mobile-alt text-purple-500"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">UPI Transfer</p>
                  <p className="text-sm text-gray-500">Transfer to UPI ID</p>
                </div>
              </div>
              <Button
                onClick={() => handleWithdraw("UPI Transfer")}
                disabled={withdrawMutation.isPending}
                className="bg-green-primary hover:bg-green-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-light rounded-full flex items-center justify-center">
                      <i className="fas fa-plus text-green-primary text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Odometer Upload</p>
                      <p className="text-xs text-gray-500">
                        {new Date(upload.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-primary font-medium text-sm">+₹{upload.rewardINR}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-history text-gray-400 text-2xl mb-2"></i>
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
