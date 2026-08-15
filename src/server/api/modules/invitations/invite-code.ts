import { randomInt } from "crypto";

// Excludes visually-ambiguous characters (0/O, 1/I, L) since this code is read from an email
// and hand-typed into a registration form.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const DEFAULT_LENGTH = 6;

export function generateInviteCode(length = DEFAULT_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}
