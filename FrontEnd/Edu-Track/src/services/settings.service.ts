import { getDb, resetDb, updateDb } from "@/data/local-database";

export interface SettingsService {
  getThreshold(): number;
  setThreshold(value: number): void;
  resetAll(): void;
}

export const settingsService: SettingsService = {
  getThreshold: () => getDb().threshold,
  setThreshold(value) {
    updateDb((db) => ({ ...db, threshold: Math.max(1, value) }));
  },
  resetAll() {
    resetDb();
  },
};
