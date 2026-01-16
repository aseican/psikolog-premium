export type AvailabilityRule = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Pazar ... 6=Cumartesi
  start: string; // "10:00"
  end: string;   // "17:00"
  slotMin: number; // 50
};

export const defaultAvailability: AvailabilityRule[] = [
  { day: 1, start: "10:00", end: "17:00", slotMin: 50 }, // Pazartesi
  { day: 2, start: "10:00", end: "17:00", slotMin: 50 }, // Salı
  { day: 4, start: "12:00", end: "18:00", slotMin: 50 }, // Perşembe
  { day: 6, start: "10:00", end: "14:00", slotMin: 50 }, // Cumartesi
];
