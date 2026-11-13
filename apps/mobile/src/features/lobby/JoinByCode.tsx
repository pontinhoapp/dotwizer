import { useEffect, useEffectEvent, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FRIENDS_CODE_LENGTH, friendsCodeSchema } from "@pontinho/protocol";
import { Button } from "@/shared/ui/Button";
import { ErrorLine } from "@/shared/ui/Notice";
import { TextField } from "@/shared/ui/TextField";
import lobby from "@/messages/lobby.json";

type Props = { initialCode?: string; connecting: boolean; error: string; onJoin: (code: string) => void };

function isValid(code: string) {
  return friendsCodeSchema.safeParse(code).success;
}

export function JoinByCode({ initialCode = "", connecting, error, onJoin }: Props) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const joinFromLink = useEffectEvent(() => {
    if (isValid(code)) {
      onJoin(code);
    }
  });

  useEffect(() => {
    joinFromLink();
  }, []);

  return (
    <>
      <TextField
        label={lobby.friendsCode}
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus={initialCode === ""}
        maxLength={FRIENDS_CODE_LENGTH}
        onSubmitEditing={() => isValid(code) && onJoin(code)}
      />
      <View style={styles.footer}>
        <ErrorLine text={error} />
        <Button title={connecting ? lobby.connecting : lobby.enter} onPress={() => onJoin(code)} loading={connecting} disabled={!isValid(code)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: "auto", gap: 10 },
});
