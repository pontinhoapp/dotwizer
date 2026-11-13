import { StyleSheet, Text, View } from "react-native";
import { CardStylePicker } from "@/features/lobby/CardStylePicker";
import { CardStyleContext } from "@/shared/cards/Card";
import { useCardStyle } from "@/shared/cards/useCardStyle";
import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import { colors, feltBackground, felts, type FeltName } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import { useFeltColor } from "@/shared/theme/useFeltColor";
import { CardTrio } from "@/shared/ui/CardTrio";
import { Option, optionTextColor } from "@/shared/ui/Option";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import lobby from "@/messages/lobby.json";
import settings from "@/messages/settings.json";

const FELTS = Object.keys(felts) as FeltName[];

export default function Appearance() {
  const { cardStyle, setCardStyle } = useCardStyle();
  const { felt, setFelt } = useFeltColor();

  return (
    <Screen>
      <ScreenHeader title={settings.appearance} backLabel={lobby.back} onBack={goBackOrHome} />
      <View aria-hidden style={[styles.preview, feltBackground(felt)]}>
        <CardStyleContext value={cardStyle}>
          <CardTrio width={64} />
        </CardStyleContext>
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>{settings.tableFelt}</Text>
        <View style={styles.felts}>
          {FELTS.map((key) => (
            <Option key={key} selected={key === felt} onPress={() => setFelt(key)} label={settings.felts[key]} style={styles.felt}>
              <View style={[styles.swatch, { backgroundColor: felts[key][0], backgroundImage: `radial-gradient(circle at 50% 30%, ${felts[key][0]} 0%, ${felts[key][1]} 100%)` }]} />
              <Text style={[styles.feltName, { color: optionTextColor(key === felt) }]}>{settings.felts[key]}</Text>
            </Option>
          ))}
        </View>
      </View>
      <CardStylePicker value={cardStyle} onChange={setCardStyle} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { height: 180, borderRadius: 24, alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06)" },
  group: { gap: 6 },
  label: { color: colors.muted, fontSize: 13, fontFamily: fonts.semibold },
  felts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  felt: { flexGrow: 1, flexBasis: "21%", padding: 8, gap: 6 },
  swatch: { alignSelf: "stretch", height: 40, borderRadius: 10, boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)" },
  feltName: { fontSize: 12, fontFamily: fonts.semibold },
});
