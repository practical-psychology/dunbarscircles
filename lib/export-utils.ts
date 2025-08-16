import { Person, Level } from "@/types/relationships";

// Export formats
export type ExportFormat = "json" | "csv" | "png" | "svg";

// Export data types
export interface ExportData {
  people: Person[];
  levels: Level[];
  metadata: {
    exportDate: string;
    version: string;
    totalContacts: number;
    networkHealth: number;
  };
}

// Canvas to PNG export
export const exportCanvasToPNG = (
  canvas: HTMLCanvasElement,
  filename: string = "network-diagram.png",
): void => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

// SVG export utility
export const exportSVGToFile = (
  svgElement: SVGElement,
  filename: string = "diagram.svg",
): void => {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
};

// Convert SVG to PNG
export const convertSVGToPNG = (
  svgElement: SVGElement,
  filename: string = "diagram.png",
): void => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    exportCanvasToPNG(canvas, filename);
  };

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  img.src = url;
};

// Export relationship data as JSON
export const exportToJSON = (
  data: ExportData,
  filename: string = "relationships.json",
): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
};

// Export relationship data as CSV
export const exportToCSV = (
  people: Person[],
  levels: Level[],
  filename: string = "relationships.csv",
): void => {
  const headers = [
    "Name",
    "Level",
    "Level Name",
    "Last Contact",
    "Contact Frequency (days)",
    "Relationship Strength",
    "Decay Rate",
    "Platform",
    "Days Since Contact",
    "Status",
  ];

  const rows = people.map((person) => {
    const level = levels.find((l) => l.id === person.levelId);
    const daysSinceContact = Math.floor(
      (Date.now() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isDecaying = daysSinceContact > person.contactFrequency * 1.5;

    return [
      person.name,
      person.levelId,
      level?.name || "Unknown",
      person.lastContact.toISOString().split("T")[0],
      person.contactFrequency.toString(),
      (person.strength * 100).toFixed(1) + "%",
      person.decayRate.toString(),
      person.platform,
      daysSinceContact.toString(),
      isDecaying ? "Needs Attention" : "Healthy",
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
};

// Generate print-friendly HTML
export const generatePrintHTML = (data: ExportData): string => {
  const { people, levels, metadata } = data;

  const levelStats = levels.map((level) => {
    const levelPeople = people.filter((p) => p.levelId === level.id);
    return {
      ...level,
      actualCount: levelPeople.length,
      avgStrength:
        levelPeople.length > 0
          ? levelPeople.reduce((sum, p) => sum + p.strength, 0) /
            levelPeople.length
          : 0,
    };
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dunbar Circles - Relationship Network Report</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .page-break { page-break-before: always; }
          .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .level-section { margin-bottom: 30px; }
        .level-header { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
        .person-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
        .person-item { padding: 8px; border: 1px solid #eee; border-radius: 4px; font-size: 14px; }
        .strength-bar { height: 4px; background: #eee; border-radius: 2px; margin-top: 4px; }
        .strength-fill { height: 100%; background: #4ade80; border-radius: 2px; }
        .decaying { border-left: 4px solid #ef4444; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dunbar Circles - Personal Relationship Network</h1>
        <p>Generated on ${new Date(metadata.exportDate).toLocaleDateString()}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Contacts</h3>
          <p style="font-size: 24px; font-weight: bold;">${metadata.totalContacts}</p>
        </div>
        <div class="stat-card">
          <h3>Network Health</h3>
          <p style="font-size: 24px; font-weight: bold; color: #22c55e;">${metadata.networkHealth.toFixed(0)}%</p>
        </div>
        <div class="stat-card">
          <h3>Active Levels</h3>
          <p style="font-size: 24px; font-weight: bold;">${levelStats.filter((l) => l.actualCount > 0).length}</p>
        </div>
      </div>

      ${levelStats
        .filter((level) => level.actualCount > 0)
        .map((level) => {
          const levelPeople = people.filter((p) => p.levelId === level.id);
          return `
          <div class="level-section page-break">
            <div class="level-header">
              <h2>${level.name} (${level.actualCount} contacts)</h2>
              <p>${level.description}</p>
              <p><strong>Average Strength:</strong> ${(level.avgStrength * 100).toFixed(1)}%</p>
            </div>
            <div class="person-list">
              ${levelPeople
                .map((person) => {
                  const daysSinceContact = Math.floor(
                    (Date.now() - person.lastContact.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isDecaying =
                    daysSinceContact > person.contactFrequency * 1.5;
                  return `
                  <div class="person-item ${isDecaying ? "decaying" : ""}">
                    <strong>${person.name}</strong>
                    <div>Platform: ${person.platform}</div>
                    <div>Last Contact: ${person.lastContact.toLocaleDateString()} (${daysSinceContact} days ago)</div>
                    <div class="strength-bar">
                      <div class="strength-fill" style="width: ${person.strength * 100}%"></div>
                    </div>
                    ${isDecaying ? '<div style="color: #ef4444; font-size: 12px;">⚠️ Needs Attention</div>' : ""}
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>
        `;
        })
        .join("")}

      <div class="page-break">
        <h2>Export Details</h2>
        <p><strong>Export Date:</strong> ${new Date(metadata.exportDate).toLocaleString()}</p>
        <p><strong>Version:</strong> ${metadata.version}</p>
        <p><strong>Total Relationships:</strong> ${metadata.totalContacts}</p>
        <p><strong>Network Health Score:</strong> ${metadata.networkHealth.toFixed(1)}%</p>
      </div>
    </body>
    </html>
  `;
};

// Print report
export const printReport = (data: ExportData): void => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(generatePrintHTML(data));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

// Share functionality
export const shareData = async (
  data: ExportData,
  title: string = "My Relationship Network",
): Promise<void> => {
  const shareData = {
    title,
    text: `I have ${data.metadata.totalContacts} contacts in my network with ${data.metadata.networkHealth.toFixed(0)}% health score.`,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log("Share cancelled or failed:", error);
      // Fallback to clipboard
      await copyToClipboard(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`,
      );
    }
  } else {
    // Fallback to clipboard
    await copyToClipboard(
      `${shareData.title}\n${shareData.text}\n${shareData.url}`,
    );
  }
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

// Generate filename with timestamp
export const generateFilename = (base: string, extension: string): string => {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${base}_${timestamp}.${extension}`;
};
