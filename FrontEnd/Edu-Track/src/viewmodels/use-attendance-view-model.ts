import { useState } from "react";
import { toast } from "sonner";
import { useLocalDatabase } from "@/data/use-local-database";
import { attendanceService, type AttendanceMark } from "@/services/attendance.service";

export function useAttendanceViewModel() {
  const { db, session } = useLocalDatabase();
  const mine = db.subjects.filter((subject) => subject.teacherId === session?.id);
  const [classId, setClassId] = useState(db.classes[0]?.id ?? "");
  const subjectOptions = mine.length ? mine : db.subjects;
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const subjectId = subjectOptions.some((subject) => subject.id === selectedSubjectId)
    ? selectedSubjectId!
    : (subjectOptions[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});

  const students = db.users.filter((user) => user.role === "STUDENT" && user.classId === classId);
  const pending = db.absences.filter((absence) => absence.status === "en attente");
  const getMark = (id: string): AttendanceMark => marks[id] ?? "Présent";
  const setMark = (id: string, mark: AttendanceMark) =>
    setMarks((current) => ({ ...current, [id]: mark }));
  const changeClass = (id: string) => {
    setClassId(id);
    setMarks({});
  };
  const resetMarks = () => setMarks({});
  const save = () => {
    const marked = students.filter((student) => getMark(student.id) !== "Présent");
    attendanceService.record({ classId, subjectId, date, marks });
    toast.success(`Appel enregistré : ${marked.length} absence(s)/retard(s)`);
    setMarks({});
  };
  const decide = (id: string, approved: boolean) => {
    attendanceService.decide(id, approved);
    toast.success(approved ? "Justificatif approuvé" : "Justificatif rejeté");
  };

  return {
    classes: db.classes,
    subjects: db.subjects,
    users: db.users,
    mine,
    classId,
    changeClass,
    subjectId,
    setSubjectId: setSelectedSubjectId,
    date,
    setDate,
    students,
    marks,
    getMark,
    setMark,
    resetMarks,
    save,
    pending,
    decide,
  };
}
