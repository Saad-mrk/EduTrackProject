import { useState } from "react";
import { toast } from "sonner";
import { uid } from "@/data/local-database";
import { useLocalDatabase } from "@/data/use-local-database";
import { DAYS, SLOTS, type Session } from "@/models";
import { timetableService } from "@/services/timetable.service";

export function useTimetableViewModel() {
  const { db, session } = useLocalDatabase();
  const all = timetableService.list();
  const isAdmin = session?.role === "ADMIN";
  const isTeacher = session?.role === "TEACHER";
  const ownClass =
    session?.role === "STUDENT"
      ? session.classId
      : session?.role === "PARENT"
        ? db.users.find((user) => user.id === session.childId)?.classId
        : undefined;
  const defaultClassId = ownClass ?? (isTeacher ? "mine" : (db.classes[0]?.id ?? ""));
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const classId = selectedClassId ?? defaultClassId;
  const [day, setDay] = useState<number | "all">("all");
  const [edit, setEdit] = useState<Session | null>(null);

  const canEdit = isAdmin && classId !== "mine";
  const sessions = all.filter((item) =>
    classId === "mine" ? item.teacherId === session?.id : item.classId === classId,
  );
  const today = (new Date().getDay() + 6) % 7;

  const subjectName = (id: string) => db.subjects.find((subject) => subject.id === id)?.name ?? "";
  const teacherName = (id: string) => db.users.find((user) => user.id === id)?.name ?? "";
  const className = (id: string) => db.classes.find((klass) => klass.id === id)?.name ?? "";
  const blank = (targetDay: number, targetSlot: number): Session => {
    const subject = db.subjects[0];
    return {
      id: `new-${uid()}`,
      classId,
      day: targetDay,
      slot: targetSlot,
      subjectId: subject?.id ?? "",
      teacherId: subject?.teacherId ?? "",
      room: "",
    };
  };
  const addAt = (targetDay: number, targetSlot: number) => setEdit(blank(targetDay, targetSlot));
  const openNew = () => setEdit(blank(day === "all" ? 0 : day, 0));
  const openEdit = (item: Session) => setEdit(item);

  const submit = (next: Session) => {
    const clash = all.find(
      (item) =>
        item.id !== next.id &&
        item.day === next.day &&
        item.slot === next.slot &&
        (item.classId === next.classId || item.teacherId === next.teacherId),
    );
    if (clash) {
      toast.error(
        clash.classId === next.classId
          ? "Cette classe a déjà un cours sur ce créneau."
          : "Cet enseignant a déjà un cours sur ce créneau.",
      );
      return;
    }
    const payload = next.id.startsWith("new-") ? { ...next, id: uid() } : next;
    timetableService.save(payload);
    toast.success("Cours enregistré");
    setEdit(null);
  };
  const remove = (item: Session) => {
    if (
      !confirm(
        `Supprimer ${subjectName(item.subjectId)} (${DAYS[item.day]}, ${SLOTS[item.slot]}) ?`,
      )
    ) {
      return;
    }
    timetableService.remove(item.id);
    toast.success("Cours supprimé");
    setEdit(null);
  };

  return {
    user: session,
    classes: db.classes,
    subjects: db.subjects,
    teachers: db.users.filter((user) => user.role === "TEACHER"),
    ownClass,
    isAdmin,
    isTeacher,
    classId,
    setClassId: setSelectedClassId,
    day,
    setDay,
    days: DAYS,
    slots: SLOTS,
    sessions,
    today,
    canEdit,
    edit,
    isNew: edit ? edit.id.startsWith("new-") : false,
    openNew,
    openEdit,
    addAt,
    closeEdit: () => setEdit(null),
    submit,
    remove,
    subjectName,
    teacherName,
    className,
  };
}
