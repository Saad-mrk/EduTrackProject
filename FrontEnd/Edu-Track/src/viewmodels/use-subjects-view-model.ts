import { useState } from "react";
import { toast } from "sonner";
import { useLocalDatabase } from "@/data/use-local-database";
import { settingsService } from "@/services/settings.service";
import { subjectsService, type CreateSubjectInput } from "@/services/subjects.service";

export function useSubjectsViewModel() {
  const { db } = useLocalDatabase();
  const teachers = db.users.filter((user) => user.role === "TEACHER");
  const [form, setForm] = useState<CreateSubjectInput>({
    name: "",
    coef: 2,
    semester: 1,
    teacherId: teachers[0]?.id ?? "",
  });

  const add = () => {
    if (form.name.trim().length < 2 || form.coef < 1) {
      toast.error("Nom ou coefficient invalide");
      return;
    }
    subjectsService.create(form);
    setForm((current) => ({ ...current, name: "" }));
    toast.success("Matière ajoutée");
  };
  const remove = (id: string) => {
    if (confirm("Supprimer cette matière ?")) subjectsService.remove(id);
  };
  const reset = () => {
    if (confirm("Réinitialiser toutes les données de démo ?")) settingsService.resetAll();
  };
  const setThreshold = (value: number) => settingsService.setThreshold(value);

  return {
    classes: db.classes,
    subjects: db.subjects,
    users: db.users,
    teachers,
    threshold: db.threshold,
    form,
    setForm,
    add,
    remove,
    reset,
    setThreshold,
  };
}
