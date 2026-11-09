import { getDb, uid, updateDb } from "@/data/local-database";
import type { Subject } from "@/data/seed";

export interface CreateSubjectInput {
  name: string;
  coef: number;
  semester: 1 | 2;
  teacherId: string;
}

export interface SubjectsService {
  list(): Subject[];
  create(input: CreateSubjectInput): Subject;
  remove(id: string): void;
}

export const subjectsService: SubjectsService = {
  list: () => getDb().subjects,
  create(input) {
    const subject: Subject = { id: uid(), ...input };
    updateDb((db) => ({ ...db, subjects: [...db.subjects, subject] }));
    return subject;
  },
  remove(id) {
    updateDb((db) => ({
      ...db,
      subjects: db.subjects.filter((subject) => subject.id !== id),
    }));
  },
};
