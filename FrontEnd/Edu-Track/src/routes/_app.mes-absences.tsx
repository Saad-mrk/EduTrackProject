import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AbsStatus } from "@/models";
import { useMyAbsencesViewModel } from "@/viewmodels/use-my-absences-view-model";

export const Route = createFileRoute("/_app/mes-absences")({
  head: () => ({
    meta: [
      { title: "Absences – EduTrack" },
      { name: "description", content: "Absences et justificatifs" },
      { property: "og:title", content: "Absences – EduTrack" },
      { property: "og:description", content: "Suivi des absences" },
    ],
  }),
  component: MyAbsences,
});

const TONE: Record<AbsStatus, string> = {
  justifiée: "bg-success/15 text-success",
  "non justifiée": "bg-destructive/10 text-destructive",
  "en attente": "bg-warning/15 text-warning",
};

function MyAbsences() {
  const {
    student,
    list,
    canJustify,
    threshold,
    subjects,
    target,
    openJustify,
    close,
    reason,
    setReason,
    file,
    attachFile,
    submit,
  } = useMyAbsencesViewModel();

  if (!student) return null;

  return (
    <>
      <PageHeader
        title={`Absences de ${student.name}`}
        desc={`${list.filter((absence) => absence.status === "non justifiée").length} non justifiée(s) · seuil ${threshold}`}
      />
      <Panel>
        {!list.length ? (
          <p className="text-sm text-muted-foreground">Aucune absence. Bravo !</p>
        ) : (
          <ul className="divide-y text-sm">
            {list.map((absence) => (
              <li
                key={absence.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <span>
                  <b>
                    {new Date(absence.date).toLocaleDateString("fr-FR", {
                      dateStyle: "long",
                    })}
                  </b>{" "}
                  · {subjects.find((subject) => subject.id === absence.subjectId)?.name} ·{" "}
                  {absence.kind}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${TONE[absence.status]}`}
                  >
                    {absence.status}
                  </span>
                  {absence.status === "non justifiée" && canJustify && (
                    <Button size="sm" variant="outline" onClick={() => openJustify(absence.id)}>
                      Justifier
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Dialog open={!!target} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un justificatif</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motif de l'absence"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            className="text-sm"
            onChange={(event) => attachFile(event.target.files?.[0])}
          />
          {file && (
            <img src={file} alt="Aperçu du justificatif" className="max-h-40 rounded-lg border" />
          )}
          <Button onClick={submit}>Envoyer</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
