// =========================================================
// RÉFÉRENTIEL FIXE DES CRÉNEAUX HORAIRES (section 2.3)
// Source unique partagée par le backend et réexportable
// côté frontend pour garantir la cohérence d'affichage.
// =========================================================

export const SLOTS = [
  { index: 1, startTime: "07:00", endTime: "08:00" },
  { index: 2, startTime: "08:00", endTime: "09:00" },
  { index: 3, startTime: "09:00", endTime: "10:00" },
  { index: 4, startTime: "10:15", endTime: "11:15" },
  { index: 5, startTime: "11:15", endTime: "12:15" },
  { index: 6, startTime: "12:15", endTime: "13:15" },
  { index: 7, startTime: "14:00", endTime: "15:00" },
  { index: 8, startTime: "15:00", endTime: "16:00" },
  { index: 9, startTime: "16:15", endTime: "17:15" },
  { index: 10, startTime: "17:15", endTime: "18:15" },
];

export const DAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
];

// =========================================================
// HELPERS
// =========================================================

export const getSlotByIndex = (slotIndex) =>
  SLOTS.find((s) => s.index === slotIndex) || null;

export const getDayLabel = (dayOfWeek) =>
  DAYS.find((d) => d.value === dayOfWeek)?.label || null;

// Numéro de semaine ISO-8601 + année ISO correspondante
export const getISOWeek = (date = new Date()) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { weekNumber, year: d.getUTCFullYear() };
};
