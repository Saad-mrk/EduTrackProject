import { useState } from "react";
import { toast } from "sonner";
import { useLocalDatabase } from "@/data/use-local-database";
import { viewedStudent } from "@/models/selectors";
import { attendanceService } from "@/services/attendance.service";

export function useMyAbsencesViewModel() {
  const { db, session } = useLocalDatabase();
  const student = session ? viewedStudent(db, session) : undefined;
  const list = student
    ? db.absences
        .filter((absence) => absence.studentId === student.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const [target, setTarget] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<string | null>(null);

  const openJustify = (id: string) => setTarget(id);
  const close = () => setTarget(null);
  const submit = () => {
    if (!target) return;
    if (reason.trim().length < 5) {
      toast.error("Motif trop court (5 caractères min.)");
      return;
    }
    attendanceService.submitJustification(target, reason);
    toast.success("Justificatif envoyé");
    setTarget(null);
    setReason("");
    setFile(null);
  };
  const attachFile = (selected: File | undefined) =>
    setFile(selected && selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null);

  return {
    student,
    list,
    canJustify: session?.role === "STUDENT",
    threshold: db.threshold,
    subjects: db.subjects,
    target,
    openJustify,
    close,
    reason,
    setReason,
    file,
    attachFile,
    submit,
  };
}
