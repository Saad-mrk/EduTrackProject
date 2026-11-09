import { getDb } from "@/data/local-database";
import type { Klass } from "@/data/seed";

export interface ClassesService {
  list(): Klass[];
}

export const classesService: ClassesService = {
  list: () => getDb().classes,
};
