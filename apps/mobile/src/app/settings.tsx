import { CardStylePicker } from "@/features/lobby/CardStylePicker";
import { useCardStyle } from "@/shared/cards/useCardStyle";
import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import home from "@/messages/home.json";
import lobby from "@/messages/lobby.json";

export default function Settings() {
  const { cardStyle, setCardStyle } = useCardStyle();

  return (
    <Screen>
      <ScreenHeader title={home.settings} backLabel={lobby.back} onBack={goBackOrHome} />
      <CardStylePicker value={cardStyle} onChange={setCardStyle} />
    </Screen>
  );
}
