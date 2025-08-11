import { LifeStageComparison } from "@/components/life-stage-comparison";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function LifecyclePage() {
  return (
    <PageLayout
      title="Life Stages"
      description="How relationship patterns change throughout different stages of life"
    >
      <LifeStageComparison levels={dunbarLevels} />
    </PageLayout>
  );
}
