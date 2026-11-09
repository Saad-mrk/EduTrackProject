import { getDb } from "@/data/local-database";
import type { Absence, Klass, Subject, User } from "@/models";

export interface AbsenceAnalysisData {
  absences: Absence[];
  classes: Klass[];
  subjects: Subject[];
  users: User[];
}

export interface AnalyticsService {
  absenceData(): AbsenceAnalysisData;
}

export const analyticsService: AnalyticsService = {
  absenceData() {
    const db = getDb();
    return {
      absences: db.absences,
      classes: db.classes,
      subjects: db.subjects,
      users: db.users,
    };
  },
};
