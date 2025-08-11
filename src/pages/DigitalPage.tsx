import { DigitalParallelsExplorer } from "@/components/digital-parallels-explorer";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function DigitalPage() {
  return (
    <PageLayout
      title="Digital Parallels"
      description="Explore how Dunbar's hierarchy translates to our digital relationships and subscriptions"
    >
      <DigitalParallelsExplorer levels={dunbarLevels} />
    </PageLayout>
  );
}
