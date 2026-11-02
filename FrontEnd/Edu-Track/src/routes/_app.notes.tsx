import { createFileRoute } from "@tanstack/react-router";
import { Sigma, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader, Panel, StatCard, fmt } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EvalType } from "@/lib/grades";
import { useGradeEntryViewModel } from "@/viewmodels/use-grade-entry-view-model";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [
      { title: "Saisie des notes – EduTrack" },
      { name: "description", content: "Saisie des notes par classe" },
      { property: "og:title", content: "Saisie des notes – EduTrack" },
      { property: "og:description", content: "Saisie des évaluations" },
    ],
  }),
  component: GradeEntry,
});

const sel = "h-9 rounded-md border bg-background px-3 text-sm";

function GradeEntry() {
  const {
    classes,
    mySubjects,
    classId,
    setClassId,
    subjectId,
    setSubjectId,
    type,
    setType,
    students,
    values,
    setValue,
    isInvalid,
    invalid,
    stats,
    save,
  } = useGradeEntryViewModel();

  if (!mySubjects.length) {
    return <PageHeader title="Saisie des notes" desc="Aucune matière ne vous est attribuée." />;
  }

  return (
    <>
      <PageHeader
        title="Saisie des notes"
        action={
          <Button onClick={save} disabled={invalid}>
            Enregistrer tout
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          className={sel}
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
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
          {mySubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <select
          className={sel}
          value={type}
          onChange={(event) => setType(event.target.value as EvalType)}
          aria-label="Évaluation"
        >
          {["DS", "TP", "Examen"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Moyenne de la classe" value={fmt(stats.average)} icon={Sigma} />
        <StatCard label="Note max" value={stats.max ?? "—"} icon={TrendingUp} tone="success" />
        <StatCard label="Note min" value={stats.min ?? "—"} icon={TrendingDown} tone="warning" />
      </div>
      <Panel>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Étudiant</th>
              <th className="w-32">Note /20</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => {
              const bad = isInvalid(student.id);
              return (
                <tr key={student.id}>
                  <td className="py-2">{student.name}</td>
                  <td>
                    <Input
                      type="number"
                      step="0.25"
                      min={0}
                      max={20}
                      value={values[student.id]}
                      onChange={(event) => setValue(student.id, event.target.value)}
                      aria-invalid={bad}
                      className={bad ? "border-destructive" : ""}
                    />
                    {bad && <p className="text-xs text-destructive">Entre 0 et 20</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
