/**
 * Test script to validate color contrast improvements
 * Run with: node scripts/test-color-contrast.js
 */

// Simple HSL to RGB conversion for Node.js testing
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (1 / 6 <= h && h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (2 / 6 <= h && h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (3 / 6 <= h && h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (4 / 6 <= h && h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (5 / 6 <= h && h < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function parseHslString(hslString) {
  const cleanString = hslString.replace(/hsl\(|\)|%/g, "").trim();
  const parts = cleanString
    .split(/[\s,]+/)
    .map((part) => parseFloat(part.trim()));

  if (parts.length !== 3) {
    throw new Error(`Invalid HSL format: ${hslString}`);
  }

  return [parts[0], parts[1], parts[2]];
}

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(color1, color2) {
  try {
    const [h1, s1, l1] = parseHslString(color1);
    const [h2, s2, l2] = parseHslString(color2);

    const [r1, g1, b1] = hslToRgb(h1, s1, l1);
    const [r2, g2, b2] = hslToRgb(h2, s2, l2);

    const lum1 = getRelativeLuminance(r1, g1, b1);
    const lum2 = getRelativeLuminance(r2, g2, b2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.error("Error calculating contrast ratio:", error);
    return 1;
  }
}

function meetsWCAGAA(contrastRatio, isLargeText = false) {
  const threshold = isLargeText ? 3.0 : 4.5;
  return contrastRatio >= threshold;
}

// Test color combinations
const testCombinations = [
  // Light theme
  {
    name: "Primary Text on Background (Light)",
    foreground: "0 0% 3.9%",
    background: "0 0% 100%",
    context: "Main body text",
  },
  {
    name: "Muted Text (Light) - IMPROVED",
    foreground: "0 0% 40%", // Improved from 45.1%
    background: "0 0% 100%",
    context: "Muted/helper text",
  },
  {
    name: "Destructive Button (Light) - IMPROVED",
    foreground: "0 0% 98%",
    background: "0 84.2% 48%", // Improved from 60.2%
    context: "Error/destructive button text",
  },

  // Dark theme
  {
    name: "Primary Text on Background (Dark)",
    foreground: "0 0% 98%",
    background: "0 0% 3.9%",
    context: "Main body text (dark theme)",
  },
  {
    name: "Muted Text (Dark) - IMPROVED",
    foreground: "0 0% 70%", // Improved from 63.9%
    background: "0 0% 3.9%",
    context: "Muted/helper text (dark theme)",
  },
  {
    name: "Destructive Button (Dark) - IMPROVED",
    foreground: "0 0% 98%",
    background: "0 62.8% 40%", // Improved from 30.6%
    context: "Error/destructive button text (dark theme)",
  },

  // Chart colors
  {
    name: "Chart Color 1 - IMPROVED",
    foreground: "0 0% 98%",
    background: "12 76% 45%", // Improved from 61%
    context: "Chart data labels",
    isLargeText: true,
  },
  {
    name: "Chart Color 2 - IMPROVED",
    foreground: "0 0% 98%",
    background: "173 58% 30%", // Improved from 39%
    context: "Chart data labels",
    isLargeText: true,
  },
];

console.log("🎨 Color Contrast Validation Results\n");
console.log("WCAG AA Requirements:");
console.log("- Normal text: 4.5:1 minimum");
console.log("- Large text: 3.0:1 minimum\n");

let passedCount = 0;
let failedCount = 0;

testCombinations.forEach((combination) => {
  const contrastRatio = calculateContrastRatio(
    combination.foreground,
    combination.background,
  );
  const passes = meetsWCAGAA(contrastRatio, combination.isLargeText);
  const status = passes ? "✅ PASS" : "❌ FAIL";
  const threshold = combination.isLargeText ? "3.0:1" : "4.5:1";

  console.log(`${status} ${combination.name}`);
  console.log(
    `  Contrast: ${contrastRatio.toFixed(2)}:1 (required: ${threshold})`,
  );
  console.log(`  Context: ${combination.context}`);
  console.log(
    `  Colors: fg(${combination.foreground}) bg(${combination.background})\n`,
  );

  if (passes) {
    passedCount++;
  } else {
    failedCount++;
  }
});

console.log("📊 Summary:");
console.log(`Total combinations tested: ${testCombinations.length}`);
console.log(`✅ Passed WCAG AA: ${passedCount}`);
console.log(`❌ Failed WCAG AA: ${failedCount}`);
console.log(
  `Compliance rate: ${Math.round((passedCount / testCombinations.length) * 100)}%`,
);

if (failedCount === 0) {
  console.log("\n🎉 All color combinations meet WCAG AA standards!");
} else {
  console.log(
    `\n⚠️  ${failedCount} color combination(s) need further improvement.`,
  );
}
