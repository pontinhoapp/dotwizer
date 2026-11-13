import { Redirect, useLocalSearchParams } from "expo-router";
import { JoinByCode } from "@/features/lobby/JoinByCode";
import { OpenMatchPrompt } from "@/features/lobby/OpenMatchPrompt";
import { useMatch } from "@/features/match/MatchProvider";
import { useCardStyle } from "@/shared/cards/useCardStyle";
import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import lobby from "@/messages/lobby.json";

export default function Friends() {
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const { room, connecting, error, openMatch, canResume, join, resume, dismissOpenMatch } = useMatch();
  const { cardStyle } = useCardStyle();

  function goBack() {
    dismissOpenMatch();
    goBackOrHome();
  }

  if (room) {
    return <Redirect href="/match" />;
  }

  return (
    <Screen>
      <ScreenHeader title={lobby.enterWithCode} backLabel={lobby.back} onBack={goBack} />
      {openMatch ? (
        <OpenMatchPrompt canResume={canResume} connecting={connecting} error={error} onResume={resume} onBack={goBack} />
      ) : (
        <JoinByCode initialCode={codigo} connecting={connecting} error={error} onJoin={(code) => join({ code, cardStyle })} />
      )}
    </Screen>
  );
}
