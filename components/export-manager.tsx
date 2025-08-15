import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exportCanvasToPNG, exportSVGToFile } from "@/lib/export-utils";

interface ExportManagerProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  svgRef?: React.RefObject<SVGElement>;
}

export default function ExportManager({
  canvasRef,
  svgRef,
}: ExportManagerProps) {
  const handleExportPNG = () => {
    if (canvasRef?.current) {
      exportCanvasToPNG(canvasRef.current, "network-diagram.png");
    }
  };

  const handleExportSVG = () => {
    if (svgRef?.current) {
      exportSVGToFile(svgRef.current, "diagram.svg");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
        <CardDescription>
          Export your visualizations and data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleExportPNG}
            disabled={!canvasRef?.current}
            variant="outline"
            data-testid="export-png"
          >
            Export as PNG
          </Button>
          <Button
            onClick={handleExportSVG}
            disabled={!svgRef?.current}
            variant="outline"
            data-testid="export-svg"
          >
            Export as SVG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
