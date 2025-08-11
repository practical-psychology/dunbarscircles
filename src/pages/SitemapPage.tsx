import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Manually defined routes for the Vite app
const routes = [
  // Main Dunbar Hierarchy pages
  { path: "/", label: "Overview", icon: "🏠" },
  { path: "/radial", label: "Radial View", icon: "👁️" },
  { path: "/levels", label: "Levels", icon: "👥" },
  { path: "/network", label: "Network Graph", icon: "❤️" },
  { path: "/digital", label: "Digital Parallels", icon: "📱" },
  { path: "/lifecycle", label: "Life Stages", icon: "🕐" },

  // Utility pages
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/sitemap", label: "Sitemap", icon: "🗺️" },
];

export default function SitemapPage() {
  // Group routes by section for better organization
  const routeSections = {
    main: routes.filter((route) =>
      [
        "/",
        "/radial",
        "/levels",
        "/network",
        "/digital",
        "/lifecycle",
      ].includes(route.path),
    ),
    utility: routes.filter((route) =>
      ["/dashboard", "/sitemap"].includes(route.path),
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Sitemap</h1>
          <p className="text-gray-600">
            Complete list of all pages and sections in the application.
          </p>
        </div>

        {/* Dunbar Hierarchy Pages */}
        {routeSections.main.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dunbar Hierarchy Pages</CardTitle>
              <CardDescription>
                Explore different aspects of social relationship hierarchies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {routeSections.main.map((route) => (
                  <li key={route.path} className="flex items-center">
                    <span className="mr-2">{route.icon}</span>
                    <Link
                      to={route.path}
                      className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
                    >
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Utility Pages */}
        {routeSections.utility.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Utility Pages</CardTitle>
              <CardDescription>
                Additional application features and navigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {routeSections.utility.map((route) => (
                  <li key={route.path} className="flex items-center">
                    <span className="mr-2">{route.icon}</span>
                    <Link
                      to={route.path}
                      className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
                    >
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-gray-500 text-center pt-4">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
