// =========================================================
// Référentiel fixe des créneaux (section 2.3 du cahier des
// charges) — miroir de backend/src/config/slots.js pour
// garantir la cohérence d'affichage côté client.
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

export const getSlotByIndex = (slotIndex) =>
  SLOTS.find((s) => s.index === slotIndex) || null;

export const getDayLabel = (dayOfWeek) =>
  DAYS.find((d) => d.value === dayOfWeek)?.label || null;
