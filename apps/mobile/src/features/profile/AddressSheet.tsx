import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { addressSchema, type Address } from "@pontinho/api-contract";
import { fetchWithTimeout } from "@/shared/api/fetchWithTimeout";
import { Button } from "@/shared/ui/Button";
import { ErrorLine } from "@/shared/ui/Notice";
import { TextField } from "@/shared/ui/TextField";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import profile from "@/messages/profile.json";

const POSTAL_CODE_INPUT_LENGTH = 9;
const EMPTY_ADDRESS: Address = { postalCode: "", street: "", number: "", complement: "", district: "", city: "", state: "SP" };

type ViaCepAddress = { erro?: boolean; logradouro: string; bairro: string; localidade: string; uf: string };

function postalCodeDigits(text: string) {
  return text.replace(/\D/g, "").slice(0, 8);
}

function formatPostalCode(text: string) {
  const digits = postalCodeDigits(text);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

async function lookUpPostalCode(postalCode: string): Promise<ViaCepAddress | undefined> {
  try {
    const response = await fetchWithTimeout(`https://viacep.com.br/ws/${postalCode}/json/`);
    const found: ViaCepAddress = await response.json();
    return found.erro ? undefined : found;
  } catch {
    return undefined;
  }
}

type Props = { current: Address | null; saving: boolean; error: string; onSave: (address: Address | null) => void };

export function AddressSheet({ current, saving, error, onSave }: Props) {
  const [address, setAddress] = useState<Address>(current ?? EMPTY_ADDRESS);
  const [stateText, setStateText] = useState(current?.state ?? "");
  const [notFound, setNotFound] = useState(false);
  const parsed = addressSchema.safeParse({ ...address, state: stateText.toUpperCase() });
  const canSave = parsed.success && !saving;

  function change(field: keyof Address) {
    return (text: string) => setAddress({ ...address, [field]: text });
  }

  async function changePostalCode(text: string) {
    const postalCode = postalCodeDigits(text);
    setAddress({ ...address, postalCode });
    setNotFound(false);
    if (postalCode.length < 8) {
      return;
    }
    const found = await lookUpPostalCode(postalCode);
    if (!found) {
      setNotFound(true);
      return;
    }
    setAddress((latest) => ({ ...latest, street: found.logradouro, district: found.bairro, city: found.localidade }));
    setStateText(found.uf);
  }

  function save() {
    if (!parsed.success) {
      return;
    }
    onSave(parsed.data);
  }

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {profile.addressLabel}
      </Text>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label={profile.postalCodeLabel}
          value={formatPostalCode(address.postalCode)}
          onChangeText={changePostalCode}
          keyboardType="number-pad"
          maxLength={POSTAL_CODE_INPUT_LENGTH}
          autoComplete="postal-code"
          error={notFound ? profile.postalCodeNotFound : ""}
        />
        <TextField label={profile.streetLabel} value={address.street} onChangeText={change("street")} maxLength={120} autoComplete="street-address" />
        <View style={styles.row}>
          <View style={styles.short}>
            <TextField label={profile.numberLabel} value={address.number} onChangeText={change("number")} maxLength={10} />
          </View>
          <View style={styles.long}>
            <TextField label={profile.complementLabel} value={address.complement} onChangeText={change("complement")} maxLength={60} />
          </View>
        </View>
        <TextField label={profile.districtLabel} value={address.district} onChangeText={change("district")} maxLength={80} />
        <View style={styles.row}>
          <View style={styles.long}>
            <TextField label={profile.cityLabel} value={address.city} onChangeText={change("city")} maxLength={80} />
          </View>
          <View style={styles.short}>
            <TextField label={profile.stateLabel} value={stateText} onChangeText={setStateText} maxLength={2} autoCapitalize="characters" />
          </View>
        </View>
      </ScrollView>
      <ErrorLine text={error} />
      <Button title={saving ? profile.saving : profile.save} onPress={save} disabled={!canSave} loading={saving} />
      {current && <Button title={profile.removeAddress} onPress={() => onSave(null)} variant="secondary" disabled={saving} />}
    </>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  fields: { maxHeight: 420 },
  fieldsContent: { gap: 12 },
  row: { flexDirection: "row", gap: 10 },
  short: { flex: 1 },
  long: { flex: 2 },
});
