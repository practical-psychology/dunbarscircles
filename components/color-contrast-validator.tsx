import { useEffect, useState } from "react";
import {
  validateAllColorCombinations,
  ValidationResult,
  logValidationResults,
} from "@/lib/color-contrast-utils";
import { useTheme } from "./theme-provider";

interface ColorContrastValidatorProps {
  showResults?: boolean;
  logToConsole?: boolean;
}

export function ColorContrastValidator({
  showResults = false,
  logToConsole = true,
}: ColorContrastValidatorProps) {
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const { theme } = useTheme();

  useEffect(() => {
    // Run validation when component mounts or theme changes
    const results = validateAllColorCombinations();
    setValidationResults(results);

    if (logToConsole) {
      logValidationResults();
    }
  }, [theme, logToConsole]);

  if (!showResults) {
    return null;
  }

  const failedResults = validationResults.filter((r) => !r.passes);
  const passedResults = validationResults.filter((r) => r.passes);

  return (
    <div className="p-6 bg-card rounded-lg border">
      <h2 className="text-2xl font-bold mb-4">Color Contrast Validation</h2>
      <p className="text-muted-foreground mb-6">
        WCAG AA compliance requires a contrast ratio of at least 4.5:1 for
        normal text and 3.0:1 for large text (18pt+ or 14pt+ bold).
      </p>

      {failedResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-destructive mb-3">
            ❌ Failed WCAG AA ({failedResults.length})
          </h3>
          <div className="space-y-2">
            {failedResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-destructive/10 rounded border border-destructive/20"
              >
                <div className="font-medium">{result.combination.name}</div>
                <div className="text-sm text-muted-foreground">
                  Contrast: {result.contrastRatio.toFixed(2)}:1 ({result.level})
                  - {result.combination.context}
                </div>
                <div className="text-xs mt-1">
                  Foreground: hsl({result.combination.foreground}) | Background:
                  hsl({result.combination.background})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {passedResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
            ✅ Passed WCAG AA ({passedResults.length})
          </h3>
          <div className="space-y-2">
            {passedResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800"
              >
                <div className="font-medium">{result.combination.name}</div>
                <div className="text-sm text-muted-foreground">
                  Contrast: {result.contrastRatio.toFixed(2)}:1 ({result.level})
                  - {result.combination.context}
                </div>
                <div className="text-xs mt-1">
                  Foreground: hsl({result.combination.foreground}) | Background:
                  hsl({result.combination.background})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded">
        <h4 className="font-semibold mb-2">Summary</h4>
        <div className="text-sm">
          <div>Total combinations tested: {validationResults.length}</div>
          <div className="text-green-600 dark:text-green-400">
            Passed WCAG AA: {passedResults.length}
          </div>
          <div className="text-destructive">
            Failed WCAG AA: {failedResults.length}
          </div>
          <div className="mt-2">
            Compliance rate:{" "}
            {validationResults.length > 0
              ? Math.round(
                  (passedResults.length / validationResults.length) * 100,
                )
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to get current color contrast validation status
 */
export function useColorContrastValidation() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const validationResults = validateAllColorCombinations();
    setResults(validationResults);
  }, [theme]);

  const failedCount = results.filter((r) => !r.passes).length;
  const passedCount = results.filter((r) => r.passes).length;
  const complianceRate =
    results.length > 0 ? (passedCount / results.length) * 100 : 0;

  return {
    results,
    failedCount,
    passedCount,
    complianceRate,
    isFullyCompliant: failedCount === 0 && results.length > 0,
  };
}
