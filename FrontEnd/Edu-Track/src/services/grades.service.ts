import { getDb, uid, updateDb } from "@/data/local-database";
import type { EvalType, Grade } from "@/models";

export interface GradesService {
  list(): Grade[];
  save(
    classId: string,
    subjectId: string,
    type: EvalType,
    values: Record<string, number | null>,
  ): void;
}

export const gradesService: GradesService = {
  list: () => getDb().grades,
  save(classId, subjectId, type, values) {
    updateDb((db) => {
      const studentIds = new Set(
        db.users
          .filter((user) => user.role === "STUDENT" && user.classId === classId)
          .map((user) => user.id),
      );
      const rest = db.grades.filter(
        (grade) =>
          !(
            grade.subjectId === subjectId &&
            grade.type === type &&
            studentIds.has(grade.studentId)
          ),
      );
      const added: Grade[] = Object.entries(values)
        .filter(([studentId, value]) => studentIds.has(studentId) && value !== null)
        .map(([studentId, value]) => ({
          id: uid(),
          studentId,
          subjectId,
          type,
          value: value as number,
        }));
      return { ...db, grades: [...rest, ...added] };
    });
  },
};
