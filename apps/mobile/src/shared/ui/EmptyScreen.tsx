import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import lobby from "@/messages/lobby.json";
import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";

export function EmptyScreen({ title }: { title: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} backLabel={lobby.back} onBack={goBackOrHome} />
    </Screen>
  );
}
