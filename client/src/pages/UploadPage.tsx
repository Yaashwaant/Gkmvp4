import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface UploadPageProps {
  user: any;
  onBack: () => void;
}

export default function UploadPage({ user, onBack }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", user.id.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Upload Successful!",
        description: `You earned ₹${data.rewardINR} from ${data.estimatedKm} km!`,
      });
      
      setSelectedFile(null);
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Upload Odometer</h2>
          <div></div>
        </div>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-light rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-camera text-green-primary text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Take a clear photo</h3>
          <p className="text-gray-600">Make sure your odometer reading is visible and clear</p>
        </div>
        
        {/* File Preview */}
        <div className="bg-gray-100 rounded-2xl h-64 mb-6 relative overflow-hidden">
          {selectedFile ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-image text-green-primary text-4xl mb-2"></i>
                <p className="text-gray-700 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-camera text-gray-400 text-4xl mb-2"></i>
                <p className="text-gray-500">Select an image</p>
              </div>
            </div>
          )}
          
          {/* Upload guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white border-dashed rounded-lg w-48 h-24 flex items-center justify-center">
              <span className="text-white text-sm">Position odometer here</span>
            </div>
          </div>
        </div>
        
        {/* Upload Instructions */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">📸 Tips for best results:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Keep the phone steady</li>
            <li>• Make sure numbers are clearly visible</li>
            <li>• Avoid reflections and shadows</li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={triggerFileInput}
            className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            disabled={uploadMutation.isPending}
          >
            <i className="fas fa-image mr-2"></i>
            Choose from Gallery
          </Button>
          
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full bg-green-primary hover:bg-green-dark text-white py-4 px-6 rounded-xl font-medium transition-colors"
            >
              {uploadMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Upload & Calculate Reward
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
