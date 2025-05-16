import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import BadRequest from "../app/badRequest";

export function useUserCAuthRedirect() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [isMounted, setIsMounted] = useState(false);

  // Esperar a que el componente se monte completamente
  useEffect(() => {
    setIsMounted(true);
  }, []); // Se ejecuta una sola vez al montar

  useEffect(() => {
    if (!isMounted) return; // Si el componente no ha montado, no hagas nada

    if (!user) {
      console.log("🔴 No hay usuario, redirigiendo a login...");
      router.replace("/login");
    } else if (!["creator"].includes(user?.typeUser)) {
      console.log("⚠️ Usuario no autorizado, redirigiendo a badRequest...");
      router.replace("/badRequest");
    }
  }, [user, router, isMounted]);
}

export function useUserCAAuthRedirect() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [isMounted, setIsMounted] = useState(false);

  // Esperar a que el componente se monte completamente
  useEffect(() => {
    setIsMounted(true);
  }, []); // Se ejecuta una sola vez al montar

  useEffect(() => {
    if (!isMounted) return; // Si el componente no ha montado, no hagas nada

    if (!user) {
      console.log("🔴 No hay usuario, redirigiendo a login...");
      router.replace("/login");
    } else if (!["creator", "admin"].includes(user?.typeUser)) {
      console.log("⚠️ Usuario no autorizado, redirigiendo a badRequest...");
      router.replace("/badRequest");
    }
  }, [user, router, isMounted]);
}


export function useUserCAWAuthRedirect() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [isMounted, setIsMounted] = useState(false);

  // Esperar a que el componente se monte completamente
  useEffect(() => {
    setIsMounted(true);
  }, []); // Se ejecuta una sola vez al montar

  useEffect(() => {
    if (!isMounted) return; // Si el componente no ha montado, no hagas nada

    if (!user) {
      console.log("🔴 No hay usuario, redirigiendo a login...");
      router.replace("/login");
    } else if (!["creator", "admin", "worker"].includes(user?.typeUser)) {
      console.log("⚠️ Usuario no autorizado, redirigiendo a badRequest...");
      router.replace("/badRequest");
    }
  }, [user, router, isMounted]);
}
