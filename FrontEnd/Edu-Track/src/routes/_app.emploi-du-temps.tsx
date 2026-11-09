import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, MapPin, Pencil, Plus, Trash2, User as UserIcon, X } from "lucide-react";
import { PageHeader } from "@/components/shared";
import type { Klass, Session, Subject, User } from "@/models";
import { useTimetableViewModel } from "@/viewmodels/use-timetable-view-model";

export const Route = createFileRoute("/_app/emploi-du-temps")({
  head: () => ({
    meta: [
      { title: "Emploi du temps — EduTrack" },
      {
        name: "description",
        content: "Emploi du temps hebdomadaire par classe et par jour.",
      },
      { property: "og:title", content: "Emploi du temps — EduTrack" },
      {
        property: "og:description",
        content: "Consultez les cours de la semaine par classe et par jour.",
      },
    ],
  }),
  component: Timetable,
});

const TONES = [
  "bg-primary/10 border-primary/30 text-primary",
  "bg-success/10 border-success/30 text-success",
  "bg-warning/15 border-warning/40 text-foreground",
  "bg-accent border-border text-accent-foreground",
];

function Timetable() {
  const vm = useTimetableViewModel();
  if (!vm.user) return null;

  const days = vm.day === "all" ? vm.days.map((_, index) => index) : [vm.day];

  return (
    <div>
      <PageHeader
        title="Emploi du temps"
        desc={`${vm.sessions.length} séances · ${vm.sessions.length * 2} h par semaine`}
        action={
          <div className="flex flex-wrap gap-2">
            {!vm.ownClass && (
              <select
                value={vm.classId}
                onChange={(event) => vm.setClassId(event.target.value)}
                className="rounded-lg border bg-card px-3 py-2 text-sm"
              >
                {vm.isTeacher && <option value="mine">Mes cours</option>}
                {vm.classes.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {klass.name} — {klass.filiere}
                  </option>
                ))}
              </select>
            )}
            {vm.canEdit && (
              <button
                onClick={vm.openNew}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Ajouter un cours
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Imprimer
            </button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...vm.days.map((_, index) => index)] as const).map((value) => (
          <button
            key={value}
            onClick={() => vm.setDay(value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${vm.day === value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
          >
            {value === "all" ? "Semaine" : vm.days[value]}
            {value === vm.today ? " •" : ""}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-sidebar text-sidebar-foreground">
              <th className="w-32 p-3 text-left font-medium">
                <Clock className="inline h-4 w-4" /> Horaire
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className={`p-3 text-left font-semibold ${day === vm.today ? "text-sidebar-primary" : ""}`}
                >
                  {vm.days[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vm.slots.map((slot, slotIndex) => (
              <tr key={slot} className="border-t">
                <td className="p-3 align-top text-xs font-medium text-muted-foreground">{slot}</td>
                {days.map((day) => {
                  const sessions = vm.sessions.filter(
                    (session) => session.day === day && session.slot === slotIndex,
                  );
                  return (
                    <td
                      key={day}
                      className={`group p-2 align-top ${day === vm.today ? "bg-primary/5" : ""}`}
                    >
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`relative mb-1 rounded-xl border p-2.5 ${TONES[Number(session.subjectId.slice(1)) % 4]}`}
                        >
                          <div className="pr-12 font-semibold">
                            {vm.subjectName(session.subjectId)}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                            <MapPin className="h-3 w-3" />
                            {session.room || "—"}
                            {vm.classId === "mine" && ` · ${vm.className(session.classId)}`}
                          </div>
                          {!vm.isTeacher && (
                            <div className="flex items-center gap-1 text-xs opacity-80">
                              <UserIcon className="h-3 w-3" />
                              {vm.teacherName(session.teacherId)}
                            </div>
                          )}
                          {vm.canEdit && (
                            <div className="absolute right-1.5 top-1.5 flex gap-0.5">
                              <button
                                aria-label="Modifier"
                                onClick={() => vm.openEdit(session)}
                                className="rounded p-1 hover:bg-card"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                aria-label="Supprimer"
                                onClick={() => vm.remove(session)}
                                className="rounded p-1 text-destructive hover:bg-card"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {vm.canEdit && !sessions.length && (
                        <button
                          onClick={() => vm.addAt(day, slotIndex)}
                          className="flex w-full items-center justify-center rounded-xl border border-dashed py-3 text-xs text-muted-foreground opacity-0 transition hover:bg-accent group-hover:opacity-100"
                        >
                          <Plus className="h-3.5 w-3.5" /> Ajouter
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vm.edit && (
        <EditDialog
          value={vm.edit}
          isNew={vm.isNew}
          classes={vm.classes}
          subjects={vm.subjects}
          teachers={vm.teachers}
          days={vm.days}
          slots={vm.slots}
          onClose={vm.closeEdit}
          onSave={vm.submit}
          onDelete={vm.remove}
        />
      )}
    </div>
  );
}

function EditDialog({
  value,
  isNew,
  classes,
  subjects,
  teachers,
  days,
  slots,
  onClose,
  onSave,
  onDelete,
}: {
  value: Session;
  isNew: boolean;
  classes: Klass[];
  subjects: Subject[];
  teachers: User[];
  days: readonly string[];
  slots: readonly string[];
  onClose: () => void;
  onSave: (session: Session) => void;
  onDelete: (session: Session) => void;
}) {
  const [session, setSession] = useState(value);
  const set = (patch: Partial<Session>) => setSession((current) => ({ ...current, ...patch }));
  const field = "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(session);
        }}
        className="w-full max-w-md space-y-3 rounded-2xl border bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isNew ? "Nouveau cours" : "Modifier le cours"}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="block text-sm">
          Classe
          <select
            className={field}
            value={session.classId}
            onChange={(event) => set({ classId: event.target.value })}
          >
            {classes.map((klass) => (
              <option key={klass.id} value={klass.id}>
                {klass.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Jour
            <select
              className={field}
              value={session.day}
              onChange={(event) => set({ day: +event.target.value })}
            >
              {days.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Horaire
            <select
              className={field}
              value={session.slot}
              onChange={(event) => set({ slot: +event.target.value })}
            >
              {slots.map((slot, index) => (
                <option key={slot} value={index}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Matière
          <select
            className={field}
            value={session.subjectId}
            onChange={(event) =>
              set({
                subjectId: event.target.value,
                teacherId:
                  subjects.find((subject) => subject.id === event.target.value)?.teacherId ??
                  session.teacherId,
              })
            }
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Enseignant
          <select
            className={field}
            value={session.teacherId}
            onChange={(event) => set({ teacherId: event.target.value })}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Salle
          <input
            required
            className={field}
            value={session.room}
            onChange={(event) => set({ room: event.target.value })}
            placeholder="Ex. Salle B12"
          />
        </label>
        <div className="flex justify-between gap-2 pt-2">
          {!isNew ? (
            <button
              type="button"
              onClick={() => onDelete(value)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
