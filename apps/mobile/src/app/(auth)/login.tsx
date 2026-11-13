import { useLocalSearchParams } from "expo-router";
import { friendsCodeSchema } from "@pontinho/protocol";
import { LoginScreen } from "@/features/auth/LoginScreen";
import lobby from "@/messages/lobby.json";

export default function Login() {
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const code = friendsCodeSchema.safeParse(codigo?.toUpperCase());
  if (!code.success) {
    return <LoginScreen />;
  }
  return <LoginScreen notice={lobby.signInToJoinRoom.replace("{code}", code.data)} />;
}
