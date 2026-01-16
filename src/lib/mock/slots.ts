import type { AvailabilityRule } from "./availability";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function getSlotsForDate(dateISO: string, rules: AvailabilityRule[]) {
  const d = new Date(dateISO + "T00:00:00");
  const day = d.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const rule = rules.find((r) => r.day === day);
  if (!rule) return [];

  const startMin = toMinutes(rule.start);
  const endMin = toMinutes(rule.end);

  const slots: string[] = [];
  for (let t = startMin; t + rule.slotMin <= endMin; t += rule.slotMin) {
    slots.push(fromMinutes(t));
  }
  return slots;
}
