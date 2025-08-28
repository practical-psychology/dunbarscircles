import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import PageLayout from "../components/PageLayout";

const routes = [
  { path: "/", label: "Overview", icon: "🏠" },
  { path: "/onboarding", label: "Tutorial & Guide", icon: "📚" },
  { path: "/radial", label: "Radial View", icon: "👁️" },
  { path: "/levels", label: "Levels", icon: "👥" },
  { path: "/network", label: "Network Graph", icon: "❤️" },
  { path: "/digital", label: "Digital Parallels", icon: "📱" },
  { path: "/lifecycle", label: "Life Stages", icon: "🕐" },
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/firebase-test", label: "Firebase Test", icon: "🔥" },
  { path: "/sitemap", label: "Sitemap", icon: "🗺️" },
];

export default function SitemapPage() {
  const routeSections = {
    main: routes.filter((route) =>
      [
        "/",
        "/onboarding",
        "/radial",
        "/levels",
        "/network",
        "/digital",
        "/lifecycle",
        "/dashboard",
      ].includes(route.path),
    ),
    utility: routes.filter((route) =>
      ["/firebase-test", "/sitemap"].includes(route.path),
    ),
  };

  return (
    <PageLayout
      title="Sitemap"
      description="Complete list of all pages and sections in the application"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Sitemap</h1>
            <p className="text-gray-600">
              Complete list of all pages and sections in the application.
            </p>
          </div>

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
        </div>
      </div>
    </PageLayout>
  );
}
