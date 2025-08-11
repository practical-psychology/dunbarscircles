import fs from "fs";
import path from "path";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-static";

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function toRouteFromPageFile(file: string, appDir: string): string | null {
  if (
    !/\\page\.(tsx|ts|jsx|js)$/.test(file) &&
    !/\/page\.(tsx|ts|jsx|js)$/.test(file)
  )
    return null;
  const rel = path.relative(appDir, path.dirname(file));
  const route = "/" + rel.replace(/\\\\/g, "/");
  return route === "/" ? "/" : route;
}



// Manually defined routes for pages that might not be auto-discovered
const additionalRoutes = [
  // Main pages
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/sitemap", label: "Sitemap" },

  // Tabbed interface sections
  { path: "/#overview", label: "Home - Overview Tab" },
  { path: "/#visualization", label: "Home - Visualization Tab" },
  { path: "/#tutorial", label: "Home - Tutorial Tab" },
  { path: "/#about", label: "Home - About Tab" },

  // Auth related
  { path: "/login", label: "Login" },
  { path: "/signup", label: "Sign Up" },

  // Other potential routes (add as needed)
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms of Service" },
  { path: "/contact", label: "Contact Us" },
];

export default function SiteMapPage() {
  const appDir = path.join(process.cwd(), "app");
  const files = walkDir(appDir);

  // Get auto-discovered page routes
  const autoPageRoutes = files
    .map((f) => toRouteFromPageFile(f, appDir))
    .filter((r): r is string => Boolean(r));

  // Combine auto-discovered routes with manual routes
  const allRoutes = [...autoPageRoutes, ...additionalRoutes.map((r) => r.path)]
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .sort();

  // Group routes by section for better organization
  const routeSections = {
    main: allRoutes.filter((route) =>
      ["/", "/dashboard", "/sitemap"].includes(route),
    ),
    tabs: allRoutes.filter(
      (route) =>
        route.includes("#") ||
        additionalRoutes.some((r) => r.path === route && r.path.includes("#")),
    ),
    auth: allRoutes.filter((route) =>
      ["/login", "/signup", "/dashboard"].includes(route),
    ),
    other: allRoutes.filter(
      (route) =>
        !["/", "/dashboard", "/sitemap", "/login", "/signup"].includes(route) &&
        !route.includes("#"),
    ),
  };

  // Get route label for display
  const getRouteLabel = (route: string) => {
    const additional = additionalRoutes.find((r) => r.path === route);
    if (additional) return additional.label;
    return route === "/" ? "Home" : route;
  };

  // Get icon for route
  const getRouteIcon = (route: string) => {
    if (route === "/") return "🏠";
    if (route === "/dashboard") return "📊";
    if (route === "/sitemap") return "🗺️";
    if (route.includes("#")) return "🔹";
    return "📄";
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

        {/* Main Pages Section */}
        {routeSections.main.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Main Pages</CardTitle>
              <CardDescription>
                Primary navigation pages of the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {routeSections.main.map((route) => (
                  <li key={route} className="flex items-center">
                    <span className="mr-2">{getRouteIcon(route)}</span>
                    <Link
                      href={route}
                      className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
                    >
                      {getRouteLabel(route)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Interface Sections */}
        {routeSections.tabs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tabbed Sections</CardTitle>
              <CardDescription>
                Interactive tabs within the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {routeSections.tabs.map((route) => (
                  <li key={route} className="flex items-center">
                    <span className="mr-2">{getRouteIcon(route)}</span>
                    <Link
                      href={route}
                      className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
                    >
                      {getRouteLabel(route)}
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
