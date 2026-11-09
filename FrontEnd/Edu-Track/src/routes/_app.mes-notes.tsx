import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader, Panel, fmt } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useMyGradesViewModel } from "@/viewmodels/use-my-grades-view-model";

export const Route = createFileRoute("/_app/mes-notes")({
  head: () => ({
    meta: [
      { title: "Mes notes – EduTrack" },
      { name: "description", content: "Relevé de notes" },
      { property: "og:title", content: "Mes notes – EduTrack" },
      { property: "og:description", content: "Notes et moyennes" },
    ],
  }),
  component: MyGrades,
});

function MyGrades() {
  const { student, semester, setSemester, rows, general, mention } = useMyGradesViewModel();
  if (!student) return null;

  return (
    <>
      <PageHeader
        title={`Notes de ${student.name}`}
        desc={`Moyenne S${semester} : ${fmt(general)} · ${mention}`}
        action={
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Relevé PDF
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        {([1, 2] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={semester === value ? "default" : "outline"}
            onClick={() => setSemester(value)}
          >
            Semestre {value}
          </Button>
        ))}
      </div>
      <Panel>
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">Aucune note pour ce semestre.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Matière</th>
                <th>Coef</th>
                <th>DS</th>
                <th>TP</th>
                <th>Examen</th>
                <th>Moyenne</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.subject.id}>
                  <td className="py-2 font-medium">{row.subject.name}</td>
                  <td>{row.subject.coef}</td>
                  {(["DS", "TP", "Examen"] as const).map((type) => (
                    <td key={type}>
                      {row.grades.find((grade) => grade.type === type)?.value ?? "—"}
                    </td>
                  ))}
                  <td
                    className={`font-semibold ${(row.avg ?? 0) < 10 ? "text-destructive" : "text-success"}`}
                  >
                    {fmt(row.avg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
