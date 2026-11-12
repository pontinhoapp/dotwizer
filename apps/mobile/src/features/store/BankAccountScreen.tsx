import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankAccountSchema, type BankAccount, type ProfileResponse } from "@pontinho/api-contract";
import { profileQueryOptions, saveBankAccount } from "@/shared/api/profile";
import { maskCpf } from "@/shared/format/cpf";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { ErrorLine, Notice } from "@/shared/ui/Notice";
import { Option, optionTextColor } from "@/shared/ui/Option";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import { Sheet } from "@/shared/ui/Sheet";
import { TextField } from "@/shared/ui/TextField";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import profileMessages from "@/messages/profile.json";
import store from "@/messages/store.json";
import { BANKS } from "./banks";

const EMPTY_ACCOUNT: BankAccount = { bankCode: "", bankName: "", branch: "", account: "", accountDigit: "", type: "checking" };
const ACCOUNT_TYPES = [
  { type: "checking", label: store.checking },
  { type: "savings", label: store.savings },
] as const;

function digits(text: string, length: number) {
  return text.replace(/\D/g, "").slice(0, length);
}

type Props = { profile?: ProfileResponse; balanceCard: ReactNode; onBack: () => void };

export function BankAccountScreen({ profile, balanceCard, onBack }: Props) {
  const queryClient = useQueryClient();
  const [account, setAccount] = useState<BankAccount>(profile?.bankAccount ?? EMPTY_ACCOUNT);
  const [choosingBank, setChoosingBank] = useState(false);
  const [otherBank, setOtherBank] = useState(Boolean(profile?.bankAccount) && !BANKS.some(({ code }) => code === profile?.bankAccount?.bankCode));
  const save = useMutation({
    mutationFn: saveBankAccount,
    onSuccess: (saved) => {
      queryClient.setQueryData(profileQueryOptions().queryKey, saved);
      onBack();
    },
  });
  const parsed = bankAccountSchema.safeParse(account);
  const canSave = parsed.success && !save.isPending;

  function change(field: keyof BankAccount, value: string) {
    setAccount({ ...account, [field]: value });
  }

  function chooseBank(bank?: { code: string; name: string }) {
    setChoosingBank(false);
    setOtherBank(!bank);
    setAccount({ ...account, bankCode: bank?.code ?? "", bankName: bank?.name ?? "" });
  }

  function submit() {
    if (!parsed.success) {
      return;
    }
    save.mutate(parsed.data);
  }

  return (
    <Screen>
      <ScreenHeader title={store.bankAccount} backLabel={store.back} onBack={onBack}>
        {balanceCard}
      </ScreenHeader>
      <View style={styles.holder}>
        <Text style={styles.label}>{store.holder}</Text>
        <Text style={styles.holderName}>{profile?.fullName ?? ""}</Text>
        <Text style={styles.holderCpf}>{profile?.cpf ? `${profileMessages.cpfLabel} ${maskCpf(profile.cpf)}` : ""}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{store.bankLabel}</Text>
        <Pressable onPress={() => setChoosingBank(true)} accessibilityRole="button" accessibilityLabel={store.chooseBank} style={styles.bank}>
          <Text style={[styles.bankText, account.bankName === "" && !otherBank && styles.placeholder]}>
            {otherBank ? store.otherBank : account.bankName || store.chooseBank}
          </Text>
          <Icon name="chevron" size={18} color={colors.faint} />
        </Pressable>
      </View>
      {otherBank && (
        <View style={styles.row}>
          <View style={styles.short}>
            <TextField label={store.bankCodeLabel} value={account.bankCode} onChangeText={(text) => change("bankCode", digits(text, 3))} keyboardType="number-pad" maxLength={3} />
          </View>
          <View style={styles.long}>
            <TextField label={store.bankNameLabel} value={account.bankName} onChangeText={(text) => change("bankName", text)} maxLength={80} />
          </View>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.short}>
          <TextField label={store.branchLabel} value={account.branch} onChangeText={(text) => change("branch", digits(text, 4))} keyboardType="number-pad" maxLength={4} />
        </View>
        <View style={styles.long}>
          <TextField label={store.accountLabel} value={account.account} onChangeText={(text) => change("account", digits(text, 12))} keyboardType="number-pad" maxLength={12} />
        </View>
        <View style={styles.digit}>
          <TextField
            label={store.accountDigitLabel}
            value={account.accountDigit}
            onChangeText={(text) => change("accountDigit", text.toUpperCase().replace(/[^0-9X]/g, "").slice(0, 1))}
            autoCapitalize="characters"
            maxLength={1}
          />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{store.accountType}</Text>
        <View style={styles.row}>
          {ACCOUNT_TYPES.map(({ type, label }) => (
            <Option key={type} selected={account.type === type} onPress={() => setAccount({ ...account, type })} label={label} style={styles.type}>
              <Text style={[styles.typeText, { color: optionTextColor(account.type === type) }]}>{label}</Text>
            </Option>
          ))}
        </View>
      </View>
      <Notice text={store.holderNotice} tone="neutral" />
      <ErrorLine text={save.error?.message ?? ""} />
      <View style={styles.footer}>
        <Button title={save.isPending ? profileMessages.saving : profileMessages.save} onPress={submit} disabled={!canSave} loading={save.isPending} />
      </View>
      <Sheet visible={choosingBank} onClose={() => setChoosingBank(false)}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          {store.chooseBank}
        </Text>
        <ScrollView style={styles.banks}>
          {BANKS.map((bank) => (
            <Pressable key={bank.code} onPress={() => chooseBank(bank)} accessibilityRole="button" style={styles.bankOption}>
              <Text style={styles.bankText}>{bank.name}</Text>
              <Text style={styles.bankCode}>{bank.code}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => chooseBank()} accessibilityRole="button" style={styles.bankOption}>
            <Text style={styles.bankText}>{store.otherBank}</Text>
          </Pressable>
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  holder: { gap: 2, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  holderName: { color: colors.text, fontSize: 16, fontFamily: fonts.semibold },
  holderCpf: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular, fontVariant: ["tabular-nums"] },
  field: { gap: 7 },
  label: { color: colors.muted, fontSize: 13, fontFamily: fonts.semibold },
  bank: { height: 52, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.plate, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bankText: { color: colors.text, fontSize: 16, fontFamily: fonts.medium },
  placeholder: { color: colors.faint },
  row: { flexDirection: "row", gap: 10 },
  short: { flex: 1 },
  long: { flex: 2 },
  digit: { width: 64 },
  type: { flex: 1, paddingVertical: 12 },
  typeText: { fontSize: 15, fontFamily: fonts.semibold },
  footer: { marginTop: "auto" },
  sheetTitle: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  banks: { maxHeight: 420 },
  bankOption: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.divider },
  bankCode: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular, fontVariant: ["tabular-nums"] },
});
