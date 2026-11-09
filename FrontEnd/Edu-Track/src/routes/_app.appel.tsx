import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AttendanceMark } from "@/services/attendance.service";
import { useAttendanceViewModel } from "@/viewmodels/use-attendance-view-model";

export const Route = createFileRoute("/_app/appel")({
  head: () => ({
    meta: [
      { title: "Appel & Justificatifs – EduTrack" },
      { name: "description", content: "Faire l'appel et traiter les justificatifs" },
      { property: "og:title", content: "Appel – EduTrack" },
      { property: "og:description", content: "Gestion des présences" },
    ],
  }),
  component: Attendance,
});

type St = AttendanceMark;
const sel = "h-9 rounded-md border bg-background px-3 text-sm";
const TONE: Record<St, string> = {
  Présent: "bg-success text-primary-foreground",
  Absent: "bg-destructive text-destructive-foreground",
  Retard: "bg-warning text-foreground",
};

function Attendance() {
  const {
    classes,
    subjects,
    users,
    mine,
    classId,
    changeClass,
    subjectId,
    setSubjectId,
    date,
    setDate,
    students,
    getMark,
    setMark,
    resetMarks,
    save,
    pending,
    decide,
  } = useAttendanceViewModel();

  return (
    <>
      <PageHeader
        title="Appel"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetMarks}>
              Tout présent
            </Button>
            <Button onClick={save}>Valider l'appel</Button>
          </div>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-44"
          aria-label="Date"
        />
        <select
          className={sel}
          value={classId}
          onChange={(event) => changeClass(event.target.value)}
          aria-label="Classe"
        >
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {klass.name}
            </option>
          ))}
        </select>
        <select
          className={sel}
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
          aria-label="Matière"
        >
          {(mine.length ? mine : subjects).map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
      <Panel>
        <ul className="divide-y">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
            >
              <span className="font-medium">{student.name}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={student.name}>
                {(["Présent", "Absent", "Retard"] as St[]).map((mark) => (
                  <button
                    key={mark}
                    role="radio"
                    aria-checked={getMark(student.id) === mark}
                    onClick={() => setMark(student.id, mark)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${getMark(student.id) === mark ? TONE[mark] : "bg-muted text-muted-foreground hover:bg-accent"}`}
                  >
                    {mark}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={`Justificatifs en attente (${pending.length})`} className="mt-6">
        {!pending.length ? (
          <p className="text-sm text-muted-foreground">Aucun justificatif à traiter.</p>
        ) : (
          <ul className="divide-y text-sm">
            {pending.map((absence) => (
              <li
                key={absence.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <span>
                  <b>{users.find((user) => user.id === absence.studentId)?.name}</b> ·{" "}
                  {subjects.find((subject) => subject.id === absence.subjectId)?.name} ·{" "}
                  {absence.date}
                  <br />
                  <span className="text-muted-foreground">{absence.reason}</span>
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(absence.id, true)}>
                    <Check className="h-4 w-4" /> Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(absence.id, false)}>
                    <X className="h-4 w-4" /> Rejeter
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
