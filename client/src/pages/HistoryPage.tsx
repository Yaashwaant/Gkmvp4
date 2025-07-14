import { useQuery } from "@tanstack/react-query";

interface HistoryPageProps {
  user: any;
  onBack: () => void;
}

export default function HistoryPage({ user, onBack }: HistoryPageProps) {
  const { data: uploads = [] } = useQuery({
    queryKey: ["/api/uploads", user?.id],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Upload History</h2>
          <div></div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-primary">{stats?.totalUploads || 0}</p>
            <p className="text-xs text-gray-600">Total Uploads</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{stats?.totalKm || 0}</p>
            <p className="text-xs text-gray-600">KM Driven</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-purple-600">₹{stats?.totalEarned || 0}</p>
            <p className="text-xs text-gray-600">Total Earned</p>
          </div>
        </div>
        
        {/* Upload History List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Uploads</h3>
          
          {uploads.length > 0 ? (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{upload.estimatedKm} KM</p>
                      <span className="text-green-primary font-semibold">₹{upload.rewardINR}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(upload.createdAt).toLocaleString()} • {upload.carbonSavedKg} kg CO₂ saved
                    </p>
                    <p className="text-xs text-gray-400">
                      {upload.carbonCredits} Carbon Credits
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-history text-gray-400 text-2xl mb-2"></i>
              <p className="text-gray-500">No uploads yet</p>
              <p className="text-sm text-gray-400">Start uploading odometer photos to track your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
