const PIX_DOMAIN = "br.gov.bcb.pix";
const NAME_MAX_LENGTH = 25;
const CITY_MAX_LENGTH = 15;

interface PixCopyPasteInput {
  key: string;
  name: string;
  city: string;
  amountCents: number;
}

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function ascii(text: string, maxLength: number) {
  return text
    .normalize("NFD")
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, maxLength);
}

export function crc16(payload: string) {
  let crc = 0xffff;
  for (const char of payload) {
    crc ^= char.charCodeAt(0) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function pixCopyPaste({ key, name, city, amountCents }: PixCopyPasteInput) {
  const payload = [
    field("00", "01"),
    field("26", field("00", PIX_DOMAIN) + field("01", key)),
    field("52", "0000"),
    field("53", "986"),
    field("54", (amountCents / 100).toFixed(2)),
    field("58", "BR"),
    field("59", ascii(name, NAME_MAX_LENGTH)),
    field("60", ascii(city, CITY_MAX_LENGTH)),
    field("62", field("05", "***")),
    "6304",
  ].join("");
  return payload + crc16(payload);
}
