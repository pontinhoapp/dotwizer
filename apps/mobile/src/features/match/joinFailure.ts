import { ErrorCode, MatchMakeError } from "@colyseus/sdk";
import { toJoinRefusal, toReconnectionToken } from "@pontinho/protocol";
import type { SessionEndReason } from "@/shared/api/sessionEnd";
import errors from "@/messages/errors.json";
import home from "@/messages/home.json";
import lobby from "@/messages/lobby.json";

const LOCKED_ROOM = / is locked$/;

type JoinFailure =
  | { kind: "openMatch"; reconnectionToken?: string }
  | { kind: "sessionEnded"; reason: SessionEndReason }
  | { kind: "profileIncomplete" }
  | { kind: "refused"; text: string };

function isUnreachable(error: unknown) {
  if (error instanceof MatchMakeError) {
    return typeof error.code !== "number";
  }
  return error instanceof Error && error.name === "AbortError";
}

export function toJoinFailure(error: unknown): JoinFailure {
  if (isUnreachable(error)) {
    return { kind: "refused", text: errors.unreachable };
  }
  if (!(error instanceof MatchMakeError)) {
    return { kind: "refused", text: home.joinFailed };
  }
  if (error.code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID && LOCKED_ROOM.test(error.message)) {
    return { kind: "refused", text: lobby.friendsMatchStarted };
  }
  if (error.code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID) {
    return { kind: "refused", text: lobby.friendsRoomNotFound };
  }
  const refusal = toJoinRefusal(error.message);
  if (refusal === "openMatch") {
    return { kind: "openMatch", reconnectionToken: toReconnectionToken(error.message) };
  }
  if (refusal === "invalidToken") {
    return { kind: "sessionEnded", reason: "expired" };
  }
  if (refusal === "accountDisabled") {
    return { kind: "sessionEnded", reason: "accountDisabled" };
  }
  if (refusal === "profileIncomplete") {
    return { kind: "profileIncomplete" };
  }
  if (refusal === "tooManyRequests") {
    return { kind: "refused", text: errors.tooManyRequests };
  }
  if (!refusal || refusal === "entryFailed") {
    return { kind: "refused", text: home.joinFailed };
  }
  return { kind: "refused", text: home.joinRefusals[refusal] };
}
