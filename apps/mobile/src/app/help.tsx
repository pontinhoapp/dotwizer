import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import { Button } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import help from "@/messages/help.json";
import home from "@/messages/home.json";
import lobby from "@/messages/lobby.json";

export default function Help() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    await Clipboard.setStringAsync(help.supportEmail);
    setCopied(true);
  }

  return (
    <Screen>
      <ScreenHeader title={home.help} backLabel={lobby.back} onBack={goBackOrHome} />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {help.contactTitle}
        </Text>
        <Text style={styles.text}>{help.contactText}</Text>
        <Text selectable style={styles.email}>
          {help.supportEmail}
        </Text>
        <Button title={help.sendEmail} onPress={() => Linking.openURL(`mailto:${help.supportEmail}`)} />
        <Button title={copied ? help.emailCopied : help.copyEmail} onPress={copyEmail} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  text: { color: colors.textSoft, fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
  email: { color: colors.text, fontSize: 17, fontFamily: fonts.semibold },
});
