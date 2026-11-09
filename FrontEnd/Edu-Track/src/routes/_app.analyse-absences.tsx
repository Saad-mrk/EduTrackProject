import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarX, Clock, Percent, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/shared";
import { useAbsenceAnalysisViewModel } from "@/viewmodels/use-absence-analysis-view-model";

export const Route = createFileRoute("/_app/analyse-absences")({
  head: () => ({
    meta: [
      { title: "Analyse des absences — EduTrack" },
      {
        name: "description",
        content: "Comparer les taux d'absence par mois, filière et classe.",
      },
      { property: "og:title", content: "Analyse des absences — EduTrack" },
      {
        property: "og:description",
        content: "Tendances et taux d'absence avec graphiques interactifs.",
      },
    ],
  }),
  component: Analysis,
});

const sel = "rounded-lg border bg-card px-3 py-2 text-sm";

function Analysis() {
  const vm = useAbsenceAnalysisViewModel();

  return (
    <>
      <PageHeader
        title="Analyse des absences"
        desc="Comparez les mois, filières et classes"
        action={
          <div className="flex flex-wrap gap-2">
            <select
              className={sel}
              value={vm.month}
              onChange={(event) => vm.setMonth(event.target.value)}
            >
              <option value="all">Tous les mois</option>
              {vm.months.map((month) => (
                <option key={month} value={month}>
                  {vm.mLabel(month)}
                </option>
              ))}
            </select>
            <select
              className={sel}
              value={vm.kind}
              onChange={(event) => vm.setKind(event.target.value)}
            >
              <option value="all">Absences & retards</option>
              <option value="Absent">Absences</option>
              <option value="Retard">Retards</option>
            </select>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={vm.list.length} icon={CalendarX} />
        <StatCard
          label="Taux global"
          value={`${vm.rate(vm.list.length, vm.studentsCount)} %`}
          icon={Percent}
          tone="destructive"
        />
        <StatCard label="Retards" value={vm.delays} icon={Clock} tone="warning" />
        <StatCard
          label="Taux de justification"
          value={`${vm.justified} %`}
          icon={ShieldCheck}
          tone="success"
        />
      </div>
      <Panel title="Comparaison" className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["class", "Classes"],
              ["filiere", "Filières"],
              ["subject", "Matières"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => vm.setDim(key)}
              className={`rounded-full border px-4 py-1.5 text-sm ${vm.dim === key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={vm.compare} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" %" />
                <YAxis type="category" dataKey="name" fontSize={11} width={110} />
                <Tooltip formatter={(value) => `${value} %`} />
                <Bar
                  dataKey="taux"
                  name="Taux d'absence"
                  fill="var(--destructive)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={vm.compare}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="justifiées" stackId="a" fill="var(--success)" />
                <Bar dataKey="en attente" stackId="a" fill="var(--warning)" />
                <Bar dataKey="non justifiées" stackId="a" fill="var(--destructive)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Tendance mensuelle par classe" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={vm.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                {vm.classes.map((klass, index) => (
                  <Area
                    key={klass.id}
                    type="monotone"
                    dataKey={klass.name}
                    stackId="1"
                    stroke={vm.colors[index % 6]}
                    fill={vm.colors[index % 6]}
                    fillOpacity={0.35}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Par jour de la semaine">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={vm.weekday}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="absences" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
