import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalDatabase } from "@/data/use-local-database";
import type { Role } from "@/models";
import { usersService, type CreateUserInput } from "@/services/users.service";

export const ROLES: Role[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];
const PAGE_SIZE = 10;

export function useUsersViewModel() {
  const { db } = useLocalDatabase();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({ name: "", email: "", role: "STUDENT" });

  const list = useMemo(
    () =>
      db.users.filter(
        (user) =>
          (!role || user.role === role) &&
          (user.name + user.email).toLowerCase().includes(q.toLowerCase()),
      ),
    [db.users, role, q],
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageItems = list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const search = (value: string) => {
    setQ(value);
    setPage(0);
  };
  const filterRole = (value: Role | "") => {
    setRole(value);
    setPage(0);
  };
  const create = () => {
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Nom ou e-mail invalide");
      return;
    }
    usersService.create(form);
    toast.success("Utilisateur créé");
    setOpen(false);
    setForm({ name: "", email: "", role: "STUDENT" });
  };
  const toggleActive = (id: string, active: boolean) => usersService.setActive(id, active);
  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return;
    usersService.remove(id);
    toast.success("Supprimé");
  };

  return {
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
  };
}
