export type ColorPreset = { fontColor: string; backgroundColor: string };

/**
 * A pool of 30 non-overlapping hex color pairs to randomize a category's color from. Colors
 * already in use by other categories are filtered out at pick time, not baked out of this list.
 */
export const COLOR_PRESETS: ColorPreset[] = [
  { fontColor: "#DC2626", backgroundColor: "#FEE2E2" },
  { fontColor: "#EA580C", backgroundColor: "#FFEDD5" },
  { fontColor: "#D97706", backgroundColor: "#FEF3C7" },
  { fontColor: "#CA8A04", backgroundColor: "#FEF9C3" },
  { fontColor: "#65A30D", backgroundColor: "#ECFCCB" },
  { fontColor: "#16A34A", backgroundColor: "#DCFCE7" },
  { fontColor: "#059669", backgroundColor: "#D1FAE5" },
  { fontColor: "#0D9488", backgroundColor: "#CCFBF1" },
  { fontColor: "#0891B2", backgroundColor: "#CFFAFE" },
  { fontColor: "#0284C7", backgroundColor: "#E0F2FE" },
  { fontColor: "#2563EB", backgroundColor: "#DBEAFE" },
  { fontColor: "#4F46E5", backgroundColor: "#E0E7FF" },
  { fontColor: "#7C3AED", backgroundColor: "#EDE9FE" },
  { fontColor: "#9333EA", backgroundColor: "#F3E8FF" },
  { fontColor: "#C026D3", backgroundColor: "#FAE8FF" },
  { fontColor: "#DB2777", backgroundColor: "#FCE7F3" },
  { fontColor: "#E11D48", backgroundColor: "#FFE4E6" },
  { fontColor: "#475569", backgroundColor: "#F1F5F9" },
  { fontColor: "#4B5563", backgroundColor: "#F3F4F6" },
  { fontColor: "#52525B", backgroundColor: "#F4F4F5" },
  { fontColor: "#525252", backgroundColor: "#F5F5F5" },
  { fontColor: "#57534E", backgroundColor: "#F5F5F4" },
  { fontColor: "#B91C1C", backgroundColor: "#FEF2F2" },
  { fontColor: "#C2410C", backgroundColor: "#FFF7ED" },
  { fontColor: "#B45309", backgroundColor: "#FFFBEB" },
  { fontColor: "#15803D", backgroundColor: "#F0FDF4" },
  { fontColor: "#1D4ED8", backgroundColor: "#EFF6FF" },
  { fontColor: "#4338CA", backgroundColor: "#EEF2FF" },
  { fontColor: "#7E22CE", backgroundColor: "#FAF5FF" },
  { fontColor: "#BE185D", backgroundColor: "#FDF2F8" },
];

export const pickRandomColorPreset = (excluding: ColorPreset[]): ColorPreset => {
  const usedKeys = new Set(excluding.map((c) => `${c.fontColor}|${c.backgroundColor}`));
  const available = COLOR_PRESETS.filter(
    (c) => !usedKeys.has(`${c.fontColor}|${c.backgroundColor}`)
  );
  const pool = available.length > 0 ? available : COLOR_PRESETS;

  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (!picked) throw new Error("COLOR_PRESETS must not be empty");

  return picked;
};
