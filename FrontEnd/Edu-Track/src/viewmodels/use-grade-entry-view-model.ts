import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalDatabase } from "@/data/use-local-database";
import { isValidGrade, type EvalType } from "@/lib/grades";
import { gradesService } from "@/services/grades.service";

export function useGradeEntryViewModel() {
  const { db, session } = useLocalDatabase();
  const mySubjects = db.subjects.filter((subject) => subject.teacherId === session?.id);
  const [classId, setClassId] = useState(db.classes[0]?.id ?? "");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const subjectId = mySubjects.some((subject) => subject.id === selectedSubjectId)
    ? selectedSubjectId!
    : (mySubjects[0]?.id ?? "");
  const [type, setType] = useState<EvalType>("DS");

  const students = db.users.filter((user) => user.role === "STUDENT" && user.classId === classId);
  const key = `${classId}-${subjectId}-${type}`;
  const initial = useMemo(
    () =>
      Object.fromEntries(
        students.map((student) => [
          student.id,
          String(
            db.grades.find(
              (grade) =>
                grade.studentId === student.id &&
                grade.subjectId === subjectId &&
                grade.type === type,
            )?.value ?? "",
          ),
        ]),
      ) as Record<string, string>,
    [db.grades, students, subjectId, type],
  );
  const [draft, setDraft] = useState<{ key: string; values: Record<string, string> }>({
    key: "",
    values: {},
  });
  const values = draft.key === key ? { ...initial, ...draft.values } : initial;
  const setValue = (id: string, value: string) =>
    setDraft((current) => ({
      key,
      values: { ...(current.key === key ? current.values : {}), [id]: value },
    }));
  const numbers = students
    .map((student) => parseFloat(values[student.id]))
    .filter((value) => isValidGrade(value));
  const isInvalid = (id: string) => values[id] !== "" && !isValidGrade(parseFloat(values[id]));
  const invalid = students.some((student) => isInvalid(student.id));
  const stats = {
    average: numbers.length
      ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
      : null,
    max: numbers.length ? Math.max(...numbers) : null,
    min: numbers.length ? Math.min(...numbers) : null,
  };
  const save = () => {
    if (invalid) {
      toast.error("Certaines notes ne sont pas entre 0 et 20");
      return;
    }
    gradesService.save(
      classId,
      subjectId,
      type,
      Object.fromEntries(
        students.map((student) => [
          student.id,
          values[student.id] === "" ? null : parseFloat(values[student.id]),
        ]),
      ),
    );
    toast.success(`${numbers.length} notes enregistrées`);
  };

  return {
    classes: db.classes,
    mySubjects,
    classId,
    setClassId,
    subjectId,
    setSubjectId: setSelectedSubjectId,
    type,
    setType,
    students,
    values,
    setValue,
    isInvalid,
    invalid,
    stats,
    save,
  };
}
