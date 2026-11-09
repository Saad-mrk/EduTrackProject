import { getDb, uid, updateDb } from "@/data/local-database";
import type { Absence } from "@/models";

export type AttendanceMark = "Présent" | "Absent" | "Retard";

export interface RecordAttendanceInput {
  classId: string;
  subjectId: string;
  date: string;
  marks: Record<string, AttendanceMark>;
}

export interface AttendanceService {
  list(): Absence[];
  record(input: RecordAttendanceInput): void;
  decide(id: string, approved: boolean): void;
  submitJustification(id: string, reason: string): void;
}

export const attendanceService: AttendanceService = {
  list: () => getDb().absences,
  record({ classId, subjectId, date, marks }) {
    updateDb((db) => {
      const studentIds = new Set(
        db.users
          .filter((user) => user.role === "STUDENT" && user.classId === classId)
          .map((user) => user.id),
      );
      const created: Absence[] = Object.entries(marks)
        .filter(([studentId, mark]) => studentIds.has(studentId) && mark !== "Présent")
        .map(([studentId, mark]) => ({
          id: uid(),
          studentId,
          subjectId,
          date,
          kind: mark as "Absent" | "Retard",
          status: "non justifiée",
        }));
      return { ...db, absences: [...created, ...db.absences] };
    });
  },
  decide(id, approved) {
    updateDb((db) => ({
      ...db,
      absences: db.absences.map((absence) =>
        absence.id === id
          ? { ...absence, status: approved ? "justifiée" : "non justifiée" }
          : absence,
      ),
    }));
  },
  submitJustification(id, reason) {
    updateDb((db) => ({
      ...db,
      absences: db.absences.map((absence) =>
        absence.id === id ? { ...absence, status: "en attente", reason } : absence,
      ),
    }));
  },
};
