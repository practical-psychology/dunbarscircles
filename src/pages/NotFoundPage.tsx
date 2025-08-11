import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-6xl font-bold text-gray-400 mb-4">
              404
            </CardTitle>
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="space-x-4">
              <Link
                to="/"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Overview
              </Link>
              <Link
                to="/sitemap"
                className="inline-block px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                View Sitemap
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
