import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { isAuthApiError } from "@supabase/supabase-js";
import { supabase } from "@/shared/supabase/client";
import { Button } from "@/shared/ui/Button";
import { ErrorLine } from "@/shared/ui/Notice";
import { TextField } from "@/shared/ui/TextField";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import errors from "@/messages/errors.json";
import profile from "@/messages/profile.json";

const PASSWORD_MIN_LENGTH = 8;
const REAUTHENTICATION_NEEDED = "reauthentication_needed";

const PASSWORD_ERROR_TEXTS: Record<string, string> = {
  weak_password: profile.weakPassword,
  same_password: profile.samePassword,
  reauthentication_not_valid: profile.invalidPasswordCode,
};

type ChangeInput = { password: string; nonce?: string };

async function changePassword({ password, nonce }: ChangeInput) {
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (!error) {
    return "changed";
  }
  if (isAuthApiError(error) && error.code === REAUTHENTICATION_NEEDED && !nonce) {
    const { error: sendError } = await supabase.auth.reauthenticate();
    if (sendError) {
      throw sendError;
    }
    return "codeSent";
  }
  throw error;
}

function errorText(error: Error | null) {
  if (!error) {
    return "";
  }
  if (isAuthApiError(error) && error.code) {
    return PASSWORD_ERROR_TEXTS[error.code] ?? errors.generic;
  }
  return errors.generic;
}

export function PasswordSheet({ onSaved }: { onSaved: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const change = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      if (result === "changed") {
        onSaved();
      }
    },
  });
  const codeSent = change.data === "codeSent";
  const long = password.length >= PASSWORD_MIN_LENGTH;
  const matches = password === confirmation;
  const canSave = long && matches && (!codeSent || code.trim().length > 0) && !change.isPending;

  function save() {
    if (!canSave) {
      return;
    }
    change.mutate({ password, nonce: codeSent ? code.trim() : undefined });
  }

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {profile.passwordLabel}
      </Text>
      <Text style={styles.hint}>{profile.passwordHint}</Text>
      <View style={styles.fields}>
        <TextField label={profile.newPasswordLabel} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" autoFocus />
        <TextField
          label={profile.confirmPasswordLabel}
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          error={confirmation !== "" && !matches ? profile.passwordMismatch : ""}
          onSubmitEditing={save}
        />
        {codeSent && <TextField label={profile.passwordCodeLabel} value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" />}
      </View>
      {codeSent && <Text style={styles.hint}>{profile.passwordCodeSent}</Text>}
      <ErrorLine text={errorText(change.error)} />
      <Button title={change.isPending ? profile.saving : profile.save} onPress={save} disabled={!canSave} loading={change.isPending} />
    </>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  hint: { color: colors.textSoft, fontSize: 14, lineHeight: 20, fontFamily: fonts.regular },
  fields: { gap: 12 },
});
