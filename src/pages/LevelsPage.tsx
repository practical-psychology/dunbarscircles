import { useState } from "react";
import { LevelDetails } from "@/components/level-details";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function LevelsPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <PageLayout
      title="Levels"
      description="Detailed breakdown of each relationship level in the Dunbar hierarchy"
    >
      <LevelDetails
        levels={dunbarLevels}
        selectedLevel={selectedLevel}
        onLevelSelect={setSelectedLevel}
      />
    </PageLayout>
  );
}
