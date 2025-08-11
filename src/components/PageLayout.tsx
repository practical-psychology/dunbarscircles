import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Brain,
  Heart,
  Eye,
  Smartphone,
  Clock,
  Book,
  Plane,
} from "lucide-react";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const navigationItems = [
  { path: "/", label: "Overview", icon: Brain },
  { path: "/radial", label: "Radial View", icon: Eye },
  { path: "/levels", label: "Levels", icon: Users },
  { path: "/network", label: "Network Graph", icon: Heart },
  { path: "/digital", label: "Digital", icon: Smartphone },
  { path: "/lifecycle", label: "Life Stages", icon: Clock },
  { path: "/dashboard", label: "Dashboard", icon: Book },
  { path: "/sitemap", label: "Sitemap", icon: Plane },
];

export default function PageLayout({
  children,
  title,
  description,
}: PageLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Dunbar Hierarchy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the cognitive limits of human social relationships across
            different levels of intimacy and frequency of contact.
          </p>
        </div>

        <div className="mb-8">
          <nav className="flex flex-wrap justify-center gap-2 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Page Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
