import { randomInt } from "crypto";
import { matchMaker } from "colyseus";
import { FRIENDS_CODE_ALPHABET, FRIENDS_CODE_LENGTH } from "@pontinho/protocol";

function drawCode() {
  return Array.from({ length: FRIENDS_CODE_LENGTH }, () => FRIENDS_CODE_ALPHABET[randomInt(FRIENDS_CODE_ALPHABET.length)]).join("");
}

export async function newFriendsCode() {
  let code = drawCode();
  while ((await matchMaker.query({ roomId: code })).length > 0) {
    code = drawCode();
  }
  return code;
}
