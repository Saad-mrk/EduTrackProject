import { getDb } from "@/data/local-database";
import type { User } from "@/models";
import { studentAverages, viewedStudent } from "@/models/selectors";
import { absenceAlert, computeRanking, mention } from "@/lib/grades";

export interface AdminOverview {
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  absenceRate: string;
  perClass: { name: string; moy: number }[];
  mentions: Record<string, number>;
  months: { mois: string; absences: number }[];
}

export interface TeacherOverview {
  subjects: ReturnType<typeof getDb>["subjects"];
  classesCount: number;
  pendingCount: number;
}

export interface StudentOverview {
  student: User;
  classLabel?: string;
  general: number | null;
  mention: string;
  rank?: number;
  classmatesCount: number;
  unjustified: number;
  threshold: number;
  alert: boolean;
  rows: ReturnType<typeof studentAverages>["rows"];
}

export interface DashboardService {
  admin(): AdminOverview;
  teacher(user: User): TeacherOverview;
  student(user: User): StudentOverview | null;
}

export const dashboardService: DashboardService = {
  admin() {
    const db = getDb();
    const students = db.users.filter((user) => user.role === "STUDENT");
    const perClass = db.classes.map((klass) => {
      const averages = students
        .filter((student) => student.classId === klass.id)
        .map((student) => studentAverages(db, student.id).general ?? 0);
      return {
        name: klass.name,
        moy: +(
          averages.reduce((sum, average) => sum + average, 0) / (averages.length || 1)
        ).toFixed(2),
      };
    });
    const months = ["2026-09", "2026-10"].map((month) => ({
      mois: month === "2026-09" ? "Sept." : "Oct.",
      absences: db.absences.filter((absence) => absence.date.startsWith(month)).length,
    }));
    const mentions: Record<string, number> = {};
    students.forEach((student) => {
      const label = mention(studentAverages(db, student.id).general);
      mentions[label] = (mentions[label] ?? 0) + 1;
    });
    const rate = ((db.absences.length / (students.length * 60)) * 100).toFixed(1);
    return {
      studentsCount: students.length,
      teachersCount: db.users.filter((user) => user.role === "TEACHER").length,
      classesCount: db.classes.length,
      absenceRate: rate,
      perClass,
      mentions,
      months,
    };
  },
  teacher(user) {
    const db = getDb();
    return {
      subjects: db.subjects.filter((subject) => subject.teacherId === user.id),
      classesCount: db.classes.length,
      pendingCount: db.absences.filter((absence) => absence.status === "en attente").length,
    };
  },
  student(user) {
    const db = getDb();
    const student = viewedStudent(db, user);
    if (!student) return null;
    const { rows, general } = studentAverages(db, student.id);
    const classmates = db.users.filter((candidate) => candidate.classId === student.classId);
    const rank = computeRanking(
      classmates.map((classmate) => ({
        id: classmate.id,
        avg: studentAverages(db, classmate.id).general,
      })),
    )[student.id];
    const unjustified = db.absences.filter(
      (absence) => absence.studentId === student.id && absence.status === "non justifiée",
    ).length;
    return {
      student,
      classLabel: db.classes.find((klass) => klass.id === student.classId)?.name,
      general,
      mention: mention(general),
      rank,
      classmatesCount: classmates.length,
      unjustified,
      threshold: db.threshold,
      alert: absenceAlert(unjustified, db.threshold - 1),
      rows,
    };
  },
};
