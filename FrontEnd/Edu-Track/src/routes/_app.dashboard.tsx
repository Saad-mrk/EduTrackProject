import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  CalendarX,
  GraduationCap,
  School,
  Trophy,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, StatCard, fmt } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useDashboardViewModel } from "@/viewmodels/use-dashboard-view-model";
import type { AdminOverview } from "@/services/dashboard.service";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord – EduTrack" },
      { name: "description", content: "Vue d'ensemble EduTrack" },
      { property: "og:title", content: "Tableau de bord – EduTrack" },
      { property: "og:description", content: "Vue d'ensemble des notes et absences" },
    ],
  }),
  component: Dashboard,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Dashboard() {
  const vm = useDashboardViewModel();
  if (!vm) return null;

  if (vm.kind === "admin") return <AdminDash overview={vm.overview} />;

  if (vm.kind === "teacher") {
    const { user, overview } = vm;
    return (
      <>
        <PageHeader
          title={`Bonjour, ${user.name.split(" ")[0]}`}
          desc="Votre journée d'enseignement"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Mes matières" value={overview.subjects.length} icon={BookOpen} />
          <StatCard label="Classes" value={overview.classesCount} icon={School} tone="success" />
          <StatCard
            label="Justificatifs à traiter"
            value={overview.pendingCount}
            icon={AlertTriangle}
            tone="warning"
          />
        </div>
        <Panel title="Actions rapides" className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/notes">Saisir des notes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/appel">Faire l'appel</Link>
            </Button>
          </div>
          <ul className="mt-5 divide-y text-sm">
            {overview.subjects.map((subject) => (
              <li key={subject.id} className="py-2">
                {subject.name}{" "}
                <span className="text-muted-foreground">
                  · coef {subject.coef} · S{subject.semester}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </>
    );
  }

  const { user, overview } = vm;
  const { student, rows, general } = overview;
  return (
    <>
      <PageHeader
        title={
          user.role === "PARENT"
            ? `Suivi de ${student.name}`
            : `Bonjour, ${student.name.split(" ")[0]}`
        }
        desc={overview.classLabel}
      />
      {overview.alert && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning" /> {overview.unjustified} absence(s) non
          justifiée(s) — seuil : {overview.threshold}.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Moyenne générale"
          value={`${fmt(general)} · ${overview.mention}`}
          icon={GraduationCap}
        />
        <StatCard
          label="Rang"
          value={`${overview.rank ?? "—"} / ${overview.classmatesCount}`}
          icon={Trophy}
          tone="success"
        />
        <StatCard
          label="Absences non justifiées"
          value={overview.unjustified}
          icon={CalendarX}
          tone={overview.unjustified >= overview.threshold ? "destructive" : "warning"}
        />
      </div>
      <Panel title="Moyennes par matière" className="mt-6">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={rows.map((row) => ({ name: row.subject.name, moy: row.avg }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis domain={[0, 20]} />
              <Tooltip />
              <Bar dataKey="moy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}

function AdminDash({ overview }: { overview: AdminOverview }) {
  const mentionEntries = Object.entries(overview.mentions);
  return (
    <>
      <PageHeader title="Tableau de bord" desc="Année universitaire 2026–2027" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Étudiants" value={overview.studentsCount} icon={Users} />
        <StatCard
          label="Enseignants"
          value={overview.teachersCount}
          icon={GraduationCap}
          tone="success"
        />
        <StatCard label="Classes" value={overview.classesCount} icon={School} tone="warning" />
        <StatCard
          label="Taux d'absentéisme"
          value={`${overview.absenceRate} %`}
          icon={CalendarX}
          tone="destructive"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Moyenne par classe" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={overview.perClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="moy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Répartition des mentions">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={mentionEntries.map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {mentionEntries.map(([key], index) => (
                    <Cell key={key} fill={COLORS[index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Évolution des absences" className="lg:col-span-3">
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={overview.months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line dataKey="absences" stroke="var(--destructive)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
