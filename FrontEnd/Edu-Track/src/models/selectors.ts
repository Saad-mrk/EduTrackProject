import type { DB, User } from "@/data/seed";
import { subjectAverage, weightedAverage } from "@/lib/grades";

export function viewedStudent(db: DB, user: User): User | undefined {
  const id = user.role === "PARENT" ? user.childId : user.id;
  return db.users.find((candidate) => candidate.id === id);
}

export function studentAverages(db: DB, studentId: string, semester?: 1 | 2) {
  const rows = db.subjects
    .filter((subject) => !semester || subject.semester === semester)
    .map((subject) => {
      const grades = db.grades.filter(
        (grade) => grade.studentId === studentId && grade.subjectId === subject.id,
      );
      return { subject, grades, avg: subjectAverage(grades) };
    })
    .filter((row) => row.grades.length);
  return {
    rows,
    general: weightedAverage(rows.map((row) => ({ avg: row.avg, coef: row.subject.coef }))),
  };
}
