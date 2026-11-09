import { useLocalDatabase } from "@/data/use-local-database";
import { authService } from "@/services/auth.service";

export function useAuthViewModel() {
  const { session } = useLocalDatabase();
  return {
    session,
    login: (email: string, password: string) => authService.login({ email, password }),
    logout: () => authService.logout(),
  };
}
