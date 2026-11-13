export const colors = {
  night: "#0A0D0C",
  nightGlow: "radial-gradient(ellipse 120% 55% at 50% 22%, #10301F 0%, #0A0D0C 70%)",
  surface: "#121715",
  option: "#1A201D",
  line: "#28302C",
  divider: "#1F2623",
  lineStrong: "#3A4540",
  text: "#F1F4F2",
  textSoft: "#DDE3DF",
  muted: "#9BA6A0",
  faint: "#6F7A74",
  action: "#C5F04A",
  onAction: "#0A0D0C",
  selected: "#000000",
  onSelected: "#FFFFFF",
  optionText: "#C9D0CC",
  optionMuted: "#8A958F",
  feltNight: "#0C3320",
  feltRoom: "radial-gradient(ellipse 110% 70% at 50% 45%, #0C3320 0%, #071F13 55%, #030B06 100%)",
  feltCard: "radial-gradient(ellipse 110% 90% at 70% 30%, #135232 0%, #0C3320 50%, #051A0E 100%)",
  gain: "#8FE3A6",
  loss: "#FF8A8A",
  feltText: "#A9C9B5",
  turnOrder: "#6F8F7C",
  feltSoft: "#C3D6CA",
  plate: "#0E1512",
  errorText: "#FF9A9A",
  errorLine: "#8A3A3A",
  dangerSurface: "#2A1515",
  dangerLine: "#5A2A2A",
  dangerText: "#FFC2C2",
  retryLine: "#7A3A3A",
  retryText: "#FFE1E1",
  successSurface: "#17210C",
  successLine: "#3F5A1E",
  successText: "#DDF5A8",
  warningText: "#F2E6A6",
  brandDot: "#FF5A4E",
  danger: "#C2353A",
};

export const felts = {
  green: ["#0C3320", "#071F13", "#030B06"],
  blue: ["#0F2C4A", "#091B2E", "#030A12"],
  wine: ["#40121D", "#270A12", "#0E0306"],
  petrol: ["#0A3538", "#062123", "#020B0C"],
  purple: ["#2A1A48", "#191030", "#080412"],
  graphite: ["#2A2D30", "#191B1D", "#08090A"],
  leather: ["#40291A", "#28190F", "#0E0805"],
  olive: ["#2F3517", "#1D210D", "#0A0B04"],
} as const;

export type FeltName = keyof typeof felts;

export function feltBackground(felt: FeltName) {
  const [center, middle, edge] = felts[felt];
  return { backgroundColor: center, backgroundImage: `radial-gradient(ellipse 110% 70% at 50% 45%, ${center} 0%, ${middle} 55%, ${edge} 100%)` };
}
