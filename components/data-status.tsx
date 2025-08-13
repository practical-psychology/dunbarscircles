import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  HardDrive,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Info,
  Upload,
  RefreshCw,
} from "lucide-react";
import { EnhancedContactStorage } from "@/lib/contact-storage-enhanced";

interface DataStatusProps {
  onImportClick?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function DataStatus({
  onImportClick,
  onRefresh,
  className,
}: DataStatusProps) {
  const [status, setStatus] = useState<{
    hasData: boolean;
    source: string;
    contactCount: number;
    isComplete: boolean;
    recommendations: string[];
    loading: boolean;
    error?: string;
  }>({
    hasData: false,
    source: "unknown",
    contactCount: 0,
    isComplete: false,
    recommendations: [],
    loading: true,
  });

  const checkDataStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const completeness = await EnhancedContactStorage.checkDataCompleteness();
      setStatus({
        ...completeness,
        loading: false,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check data status",
      }));
    }
  };

  useEffect(() => {
    checkDataStatus();
  }, []);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "database":
        return <Database className="w-4 h-4" />;
      case "localStorage":
        return <HardDrive className="w-4 h-4" />;
      case "sample":
        return <TestTube className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "database":
        return "Cloud Database";
      case "localStorage":
        return "Local Storage";
      case "sample":
        return "Sample Data";
      default:
        return "Unknown";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "database":
        return "bg-green-100 text-green-800";
      case "localStorage":
        return "bg-blue-100 text-blue-800";
      case "sample":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isComplete: boolean, hasData: boolean) => {
    if (isComplete) return "text-green-600";
    if (hasData) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (isComplete: boolean, _hasData: boolean) => {
    if (isComplete) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  if (status.loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">
              Checking data status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to check data status: {status.error}
            </AlertDescription>
          </Alert>
          <Button
            onClick={checkDataStatus}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.isComplete, status.hasData)}
            <CardTitle className="text-lg">Data Status</CardTitle>
          </div>
          <Button
            onClick={onRefresh || checkDataStatus}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Current status of your relationship data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Data Source */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Data Source:</span>
          <Badge className={getSourceColor(status.source)}>
            {getSourceIcon(status.source)}
            <span className="ml-1">{getSourceLabel(status.source)}</span>
          </Badge>
        </div>

        {/* Contact Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Contacts:</span>
          <span
            className={`text-sm font-semibold ${getStatusColor(status.isComplete, status.hasData)}`}
          >
            {status.contactCount}
          </span>
        </div>

        {/* Completeness Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={status.isComplete ? "default" : "secondary"}>
            {status.isComplete
              ? "Complete"
              : status.hasData
                ? "Partial"
                : "Empty"}
          </Badge>
        </div>

        {/* Recommendations */}
        {status.recommendations.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Recommendations:</span>
            <div className="space-y-1">
              {status.recommendations.map((recommendation, index) => (
                <Alert key={index} className="py-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!status.isComplete && onImportClick && (
            <Button onClick={onImportClick} size="sm" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          )}

          {status.source === "sample" && (
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Sign In for Real Data
            </Button>
          )}
        </div>

        {/* Additional Info for Sample Data */}
        {status.source === "sample" && (
          <Alert className="mt-3">
            <TestTube className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You're viewing sample data. Sign in and import your social media
              data for personalized insights.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
