import { DEMO_PASSWORD, type User } from "@/data/seed";
import { getDb, getSession, setSession } from "@/data/local-database";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthService {
  getSession(): User | null;
  login(input: LoginInput): User | null;
  logout(): void;
}

export const authService: AuthService = {
  getSession,
  login({ email, password }) {
    const user = getDb().users.find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.active,
    );
    if (!user || password !== DEMO_PASSWORD) return null;
    setSession(user);
    return user;
  },
  logout() {
    setSession(null);
  },
};
