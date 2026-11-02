import { useMemo, useState } from "react";
import { useLocalDatabase } from "@/data/use-local-database";
import type { Absence } from "@/models";
import { analyticsService } from "@/services/analytics.service";

const SESSIONS_PER_MONTH = 30;
const MONTH_FR = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];
const dayIndex = (date: string) => (new Date(date).getDay() + 6) % 7;

export function useAbsenceAnalysisViewModel() {
  useLocalDatabase();
  const data = analyticsService.absenceData();
  const [dim, setDim] = useState<"class" | "filiere" | "subject">("class");
  const [month, setMonth] = useState("all");
  const [kind, setKind] = useState("all");

  const students = data.users.filter((user) => user.role === "STUDENT");
  const classOf = (studentId: string) => {
    const student = students.find((candidate) => candidate.id === studentId);
    return data.classes.find((klass) => klass.id === student?.classId);
  };
  const months = useMemo(
    () => [...new Set(data.absences.map((absence) => absence.date.slice(0, 7)))].sort(),
    [data.absences],
  );
  const mLabel = (key: string) =>
    key === "all" ? "Tous les mois" : `${MONTH_FR[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`;
  const list = data.absences.filter(
    (absence) =>
      (month === "all" || absence.date.startsWith(month)) &&
      (kind === "all" || absence.kind === kind),
  );
  const nMonths = month === "all" ? months.length || 1 : 1;
  const rate = (count: number, population: number) =>
    +((count / (Math.max(population, 1) * SESSIONS_PER_MONTH * nMonths)) * 100).toFixed(2);

  const groups: {
    key: string;
    pop: number;
    match: (absence: Absence) => boolean;
  }[] = [];
  if (dim === "class") {
    data.classes.forEach((klass) => {
      groups.push({
        key: klass.name,
        pop: students.filter((student) => student.classId === klass.id).length,
        match: (absence) => classOf(absence.studentId)?.id === klass.id,
      });
    });
  } else if (dim === "filiere") {
    [...new Set(data.classes.map((klass) => klass.filiere))].forEach((filiere) => {
      groups.push({
        key: filiere,
        pop: students.filter(
          (student) =>
            data.classes.find((klass) => klass.id === student.classId)?.filiere === filiere,
        ).length,
        match: (absence) => classOf(absence.studentId)?.filiere === filiere,
      });
    });
  } else {
    data.subjects.forEach((subject) => {
      groups.push({
        key: subject.name,
        pop: students.length,
        match: (absence) => absence.subjectId === subject.id,
      });
    });
  }

  const compare = groups
    .map((group) => {
      const matches = list.filter(group.match);
      return {
        name: group.key,
        taux: rate(matches.length, group.pop),
        justifiées: matches.filter((absence) => absence.status === "justifiée").length,
        "non justifiées": matches.filter((absence) => absence.status === "non justifiée").length,
        "en attente": matches.filter((absence) => absence.status === "en attente").length,
      };
    })
    .sort((a, b) => b.taux - a.taux);

  const trend = months.map((key) => {
    const row: Record<string, string | number> = { mois: mLabel(key) };
    data.classes.forEach((klass) => {
      row[klass.name] = data.absences.filter(
        (absence) =>
          absence.date.startsWith(key) &&
          (kind === "all" || absence.kind === kind) &&
          classOf(absence.studentId)?.id === klass.id,
      ).length;
    });
    return row;
  });

  const weekday = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label, index) => ({
    jour: label,
    absences: list.filter((absence) => dayIndex(absence.date) === index).length,
  }));
  const justified = list.length
    ? Math.round(
        (list.filter((absence) => absence.status === "justifiée").length / list.length) * 100,
      )
    : 0;

  return {
    dim,
    setDim,
    month,
    setMonth,
    kind,
    setKind,
    months,
    mLabel,
    list,
    rate,
    compare,
    trend,
    weekday,
    justified,
    studentsCount: students.length,
    delays: list.filter((absence) => absence.kind === "Retard").length,
    classes: data.classes,
    colors: COLORS,
  };
}
