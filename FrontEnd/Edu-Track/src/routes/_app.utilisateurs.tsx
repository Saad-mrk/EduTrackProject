import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Role } from "@/models";
import { ROLES, useUsersViewModel } from "@/viewmodels/use-users-view-model";

export const Route = createFileRoute("/_app/utilisateurs")({
  head: () => ({
    meta: [
      { title: "Utilisateurs – EduTrack" },
      { name: "description", content: "Gestion des utilisateurs" },
      { property: "og:title", content: "Utilisateurs – EduTrack" },
      { property: "og:description", content: "Gestion des comptes" },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const {
    list,
    pageItems,
    pages,
    page,
    setPage,
    q,
    search,
    role,
    filterRole,
    open,
    setOpen,
    form,
    setForm,
    create,
    toggleActive,
    remove,
  } = useUsersViewModel();

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        desc={`${list.length} comptes`}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </Button>
        }
      />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Rechercher…"
            value={q}
            onChange={(event) => search(event.target.value)}
            className="max-w-xs"
          />
          <select
            className="rounded-md border bg-background px-3 text-sm"
            value={role}
            onChange={(event) => filterRole(event.target.value as Role | "")}
          >
            <option value="">Tous les rôles</option>
            {ROLES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Actif</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((user) => (
                <tr key={user.id}>
                  <td className="py-2.5 font-medium">{user.name}</td>
                  <td className="text-muted-foreground">{user.email}</td>
                  <td>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <Switch
                      checked={user.active}
                      onCheckedChange={(value) => toggleActive(user.id, value)}
                      aria-label="Activer"
                    />
                  </td>
                  <td className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Supprimer"
                      onClick={() => remove(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <span>
            {page + 1} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom complet</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div>
              <Label>Rôle</Label>
              <select
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
              >
                {ROLES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={create}>
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
