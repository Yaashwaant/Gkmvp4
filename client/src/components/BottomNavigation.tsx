import { useLocation } from "wouter";

interface BottomNavigationProps {
  onNavigate: (path: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: "fas fa-home", label: "Home" },
    { path: "/upload", icon: "fas fa-camera", label: "Upload" },
    { path: "/wallet", icon: "fas fa-wallet", label: "Wallet" },
    { path: "/history", icon: "fas fa-history", label: "History" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon, label }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className={`flex flex-col items-center py-2 px-4 ${
              location === path
                ? "text-green-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <i className={`${icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
