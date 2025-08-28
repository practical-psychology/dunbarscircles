import {
  ColorContrastValidator,
  useColorContrastValidation,
} from "../../components/color-contrast-validator";
import { useTheme } from "../../components/theme-provider";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Progress } from "../../components/ui/progress";

export default function ColorContrastTestPage() {
  const { theme, setTheme } = useTheme();
  const { complianceRate, isFullyCompliant, failedCount, passedCount } =
    useColorContrastValidation();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Color Contrast Validation</h1>
        <p className="text-xl text-muted-foreground">
          Testing WCAG AA compliance across all theme colors
        </p>
      </div>

      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Testing</CardTitle>
          <CardDescription>
            Switch between themes to test color contrast in both light and dark
            modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              Light Theme
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              Dark Theme
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              System Theme
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>WCAG AA Compliance Rate</span>
              <Badge variant={isFullyCompliant ? "default" : "destructive"}>
                {Math.round(complianceRate)}%
              </Badge>
            </div>
            <Progress value={complianceRate} className="w-full" />
            <div className="text-sm text-muted-foreground">
              {passedCount} passed, {failedCount} failed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Alert>
        <AlertDescription>
          {isFullyCompliant ? (
            <span className="text-green-600 dark:text-green-400">
              ✅ All color combinations meet WCAG AA standards!
            </span>
          ) : (
            <span className="text-destructive">
              ⚠️ {failedCount} color combination(s) need improvement for full
              WCAG AA compliance.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Color Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Primary Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Primary Button</Button>
            <Button variant="secondary" className="w-full">
              Secondary Button
            </Button>
            <Button variant="destructive" className="w-full">
              Destructive Button
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-foreground">Primary text color</p>
            <p className="text-muted-foreground">Muted text color</p>
            <p className="text-destructive">Destructive text color</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 bg-chart-1 rounded flex items-center justify-center text-white text-xs">
              Chart 1
            </div>
            <div className="h-4 bg-chart-2 rounded flex items-center justify-center text-white text-xs">
              Chart 2
            </div>
            <div className="h-4 bg-chart-3 rounded flex items-center justify-center text-white text-xs">
              Chart 3
            </div>
            <div className="h-4 bg-chart-4 rounded flex items-center justify-center text-black text-xs">
              Chart 4
            </div>
            <div className="h-4 bg-chart-5 rounded flex items-center justify-center text-black text-xs">
              Chart 5
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Validation Results */}
      <ColorContrastValidator showResults={true} logToConsole={true} />

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Improvements Made:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                Darkened muted text from 45.1% to 40% lightness for better
                contrast
              </li>
              <li>
                Adjusted destructive colors for both light and dark themes
              </li>
              <li>Optimized chart colors for better text readability</li>
              <li>Enhanced sidebar colors for improved contrast ratios</li>
              <li>Updated liquid animation colors to maintain accessibility</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">WCAG AA Requirements:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Normal text: minimum 4.5:1 contrast ratio</li>
              <li>
                Large text (18pt+ or 14pt+ bold): minimum 3.0:1 contrast ratio
              </li>
              <li>Non-text elements: minimum 3.0:1 contrast ratio</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
