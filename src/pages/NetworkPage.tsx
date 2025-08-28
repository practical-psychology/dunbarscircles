import { RelationshipInventory } from "../../components/relationship-inventory";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../../data/dunbarLevels";

export default function NetworkPage() {
  return (
    <PageLayout
      title="Network Graph"
      description="Interactive relationship inventory and network visualization"
    >
      <RelationshipInventory levels={dunbarLevels} />
    </PageLayout>
  );
}
