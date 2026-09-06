import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const ROLE = {
  CREATOR: ["creator"],
  CREATOR_ADMIN: ["creator", "admin"],
  CREATOR_ADMIN_WORKER: ["creator", "admin", "worker"],
};

// Redirige si no hay sesión (-> /login) o si el rol no está permitido (-> /badRequest).
// Antes había 3 hooks idénticos salvo la lista de roles.
export function useRequireRole(allowedRoles) {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (!user) {
      router.replace("/login");
    } else if (!allowedRoles.includes(user?.typeUser)) {
      router.replace("/badRequest");
    }
  }, [user, router, allowedRoles]);
}

// Alias de compatibilidad (nombres usados por las pantallas actuales).
export const useUserCAuthRedirect = () => useRequireRole(ROLE.CREATOR);
export const useUserCAAuthRedirect = () => useRequireRole(ROLE.CREATOR_ADMIN);
export const useUserCAWAuthRedirect = () =>
  useRequireRole(ROLE.CREATOR_ADMIN_WORKER);
