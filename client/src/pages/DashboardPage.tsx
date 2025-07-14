import { useQuery } from "@tanstack/react-query";

interface DashboardPageProps {
  user: any;
  onNavigate: (path: string) => void;
}

export default function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const { data: uploads = [] } = useQuery({
    queryKey: ["/api/uploads", user?.id],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const lastUpload = uploads[0];
  const progressPercentage = user?.balanceINR ? (parseFloat(user.balanceINR) / 50) * 100 : 0;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-primary to-green-dark p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {user?.name} 👋</h1>
            <p className="text-green-100">Keep driving green!</p>
          </div>
          <button className="bg-white bg-opacity-20 p-2 rounded-full">
            <i className="fas fa-bell text-white"></i>
          </button>
        </div>
        
        {/* Wallet Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Carbon Credits</p>
              <p className="text-2xl font-bold">{user?.carbonCredits || "0.000"} CC</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Balance</p>
              <p className="text-2xl font-bold">₹{user?.balanceINR || "0"}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onNavigate("/upload")}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-light rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-camera text-green-primary text-xl"></i>
            </div>
            <p className="font-medium text-gray-800">Upload Photo</p>
            <p className="text-sm text-gray-500">Odometer reading</p>
          </button>
          
          <button
            onClick={() => onNavigate("/wallet")}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-wallet text-blue-500 text-xl"></i>
            </div>
            <p className="font-medium text-gray-800">Withdraw</p>
            <p className="text-sm text-gray-500">Cash out credits</p>
          </button>
        </div>
        
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Upload Status</h3>
            <span className="text-green-primary text-sm font-medium">
              {lastUpload ? "Active" : "No uploads yet"}
            </span>
          </div>
          {lastUpload ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-light rounded-full flex items-center justify-center">
                <i className="fas fa-check text-green-primary"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  Last upload: {new Date(lastUpload.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Reward: ₹{lastUpload.rewardINR} earned
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
              <p className="text-gray-500">Upload your first odometer photo to get started!</p>
            </div>
          )}
        </div>
        
        {/* Milestone Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Next Milestone</h3>
            <span className="text-sm text-gray-500">₹50 goal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-green-primary h-3 rounded-full" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            ₹{user?.balanceINR || "0"} of ₹50 completed
          </p>
        </div>
      </div>
    </div>
  );
}
