import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjectsViewModel } from "@/viewmodels/use-subjects-view-model";

export const Route = createFileRoute("/_app/matieres")({
  head: () => ({
    meta: [
      { title: "Classes & Matières – EduTrack" },
      { name: "description", content: "Filières, classes et matières" },
      { property: "og:title", content: "Classes & Matières – EduTrack" },
      { property: "og:description", content: "Gestion pédagogique" },
    ],
  }),
  component: Subjects,
});

function Subjects() {
  const {
    classes,
    subjects,
    users,
    teachers,
    threshold,
    form,
    setForm,
    add,
    remove,
    reset,
    setThreshold,
  } = useSubjectsViewModel();

  return (
    <>
      <PageHeader
        title="Classes & Matières"
        action={
          <Button variant="outline" onClick={reset}>
            Réinitialiser les données
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Classes">
          <ul className="divide-y text-sm">
            {classes.map((klass) => (
              <li key={klass.id} className="flex justify-between py-2">
                <span>
                  <b>{klass.name}</b>{" "}
                  <span className="text-muted-foreground">· {klass.filiere}</span>
                </span>
                <span>{users.filter((user) => user.classId === klass.id).length} étud.</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t pt-4 text-sm">
            <p className="font-medium">Seuil d'absences non justifiées</p>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(event) => setThreshold(+event.target.value)}
            />
          </div>
        </Panel>
        <Panel title="Matières" className="lg:col-span-2">
          <div className="mb-4 grid gap-2 sm:grid-cols-5">
            <Input
              className="sm:col-span-2"
              placeholder="Nom de la matière"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <Input
              type="number"
              min={1}
              max={6}
              aria-label="Coefficient"
              value={form.coef}
              onChange={(event) => setForm({ ...form, coef: +event.target.value })}
            />
            <select
              className="rounded-md border bg-background px-2 text-sm"
              value={form.teacherId}
              onChange={(event) => setForm({ ...form, teacherId: event.target.value })}
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <Button onClick={add}>Ajouter</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Matière</th>
                <th>Coef</th>
                <th>Semestre</th>
                <th>Enseignant</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="py-2 font-medium">{subject.name}</td>
                  <td>{subject.coef}</td>
                  <td>S{subject.semester}</td>
                  <td>{users.find((user) => user.id === subject.teacherId)?.name}</td>
                  <td className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Supprimer"
                      onClick={() => remove(subject.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
