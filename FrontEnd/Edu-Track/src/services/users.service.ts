import { getDb, uid, updateDb } from "@/data/local-database";
import type { Role, User } from "@/data/seed";

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
}

export interface UsersService {
  list(): User[];
  create(input: CreateUserInput): User;
  setActive(id: string, active: boolean): void;
  remove(id: string): void;
}

export const usersService: UsersService = {
  list: () => getDb().users,
  create(input) {
    const user: User = {
      id: uid(),
      name: input.name,
      email: input.email,
      role: input.role,
      active: true,
      classId: input.role === "STUDENT" ? getDb().classes[0]?.id : undefined,
    };
    updateDb((db) => ({ ...db, users: [user, ...db.users] }));
    return user;
  },
  setActive(id, active) {
    updateDb((db) => ({
      ...db,
      users: db.users.map((user) => (user.id === id ? { ...user, active } : user)),
    }));
  },
  remove(id) {
    updateDb((db) => ({ ...db, users: db.users.filter((user) => user.id !== id) }));
  },
};
