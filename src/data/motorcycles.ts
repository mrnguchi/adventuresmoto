import type { SelectOption } from "@/components/custom-select";

export const motorcycles: Record<string, string[]> = {
  BMW: ["F 750 GS", "F 850 GS", "F 900 GS", "R 1250 GS", "R 1300 GS"],
  Ducati: ["DesertX", "Multistrada V2", "Multistrada V4"],
  Honda: ["Africa Twin", "CB500X", "CRF300L", "Transalp XL750"],
  KTM: ["390 Adventure", "690 Enduro R", "790 Adventure", "890 Adventure"],
  Suzuki: ["V-Strom 650", "V-Strom 800DE", "V-Strom 1050DE"],
  Triumph: ["Tiger 660", "Tiger 850 Sport", "Tiger 900", "Tiger 1200"],
  Yamaha: ["Ténéré 700", "Super Ténéré 1200"],
};

export const makeOptions: SelectOption[] = Object.keys(motorcycles).map(
  (make) => ({
    value: make,
    label: make,
  }),
);

export const yearOptions: SelectOption[] = Array.from(
  { length: 17 },
  (_, index) => {
    const year = String(new Date().getFullYear() + 1 - index);
    return { value: year, label: year };
  },
);

export function getModelOptions(make: string): SelectOption[] {
  return (motorcycles[make] ?? []).map((model) => ({
    value: model,
    label: model,
  }));
}
