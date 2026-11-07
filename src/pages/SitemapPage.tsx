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
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/onboarding", label: "Tutorial & Guide", icon: "📚" },
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/radial", label: "Radial View", icon: "🌐" },
  { path: "/network", label: "Network Graph", icon: "🕸️" },
  { path: "/levels", label: "Relationship Levels", icon: "👥" },
  { path: "/digital", label: "Digital Parallels", icon: "📱" },
  { path: "/lifecycle", label: "Life Stages", icon: "🔄" },
  { path: "/contacts", label: "All Contacts", icon: "👤" },
  { path: "/contacts/import", label: "Import Contacts", icon: "📥" },
  { path: "/color-contrast-test", label: "Color Contrast Test", icon: "🎨" },
  { path: "/firebase-test", label: "Firebase Test", icon: "🔥" },
  { path: "/evidence", label: "Evidence & Limitations", icon: "🔬" },
  { path: "/about", label: "About & Contact", icon: "ℹ️" },
  { path: "/privacy", label: "Privacy & Cookies", icon: "🔒" },
  { path: "/sitemap", label: "Sitemap", icon: "🗺️" },
].filter(
  (route) =>
    import.meta.env.DEV ||
    !["/color-contrast-test", "/firebase-test"].includes(route.path),
);

export default function SitemapPage() {
  const routeSections = {
    core: routes.filter((route) =>
      ["/", "/onboarding", "/dashboard"].includes(route.path),
    ),
    visualizations: routes.filter((route) =>
      ["/radial", "/network", "/levels"].includes(route.path),
    ),
    content: routes.filter((route) =>
      ["/digital", "/lifecycle", "/evidence"].includes(route.path),
    ),
    contacts: routes.filter((route) =>
      ["/contacts", "/contacts/import"].includes(route.path),
    ),
    development: routes.filter((route) =>
      ["/color-contrast-test", "/firebase-test"].includes(route.path),
    ),
    utilities: routes.filter((route) =>
      ["/sitemap", "/about", "/privacy"].includes(route.path),
    ),
  };

  return (
    <PageLayout
      title="Sitemap"
      description="Complete list of all pages and sections in the application"
    >
      <div className="space-y-8">
        {/* Core Pages */}
        {routeSections.core.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Core Pages</CardTitle>
              <CardDescription>Main application sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.core.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualizations */}
        {routeSections.visualizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Visualizations</CardTitle>
              <CardDescription>
                Different views of your social network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.visualizations.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {routeSections.content.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Educational content and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.content.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Management */}
        {routeSections.contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>Manage your social connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.contacts.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Development & Testing */}
        {routeSections.development.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Development & Testing</CardTitle>
              <CardDescription>
                Tools for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.development.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Utilities */}
        {routeSections.utilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Utilities</CardTitle>
              <CardDescription>Application utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routeSections.utilities.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-3 p-4 transition-colors rounded-lg hover:bg-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {route.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{route.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.path}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
