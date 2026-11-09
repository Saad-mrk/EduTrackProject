import { useState } from "react";
import { useLocalDatabase } from "@/data/use-local-database";
import { mention } from "@/lib/grades";
import { studentAverages, viewedStudent } from "@/models/selectors";

export function useMyGradesViewModel() {
  const { db, session } = useLocalDatabase();
  const [semester, setSemester] = useState<1 | 2>(1);
  const student = session ? viewedStudent(db, session) : undefined;
  const data = student
    ? studentAverages(db, student.id, semester)
    : {
        rows: [] as ReturnType<typeof studentAverages>["rows"],
        general: null,
      };

  return {
    student,
    semester,
    setSemester,
    rows: data.rows,
    general: data.general,
    mention: mention(data.general),
  };
}
