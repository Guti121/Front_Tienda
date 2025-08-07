import { useFocusEffect, useRouter } from "expo-router";
import Storage from "../src/components/token/localstorage";
import { deleteTokenStorage } from "../src/components/token/token";
import { useSelector } from "react-redux";

export default function Index() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);

  useFocusEffect(() => {
    const isAuthenticate = async () => {
      try {
        const myUsername = await Storage.getItem("username");
        const myToken = await Storage.getItem("token");
        if (myUsername && myToken && user) {
          router.replace("/drawer"); // Redirige a la página principal si la autenticación es exitosa
        } else {
          deleteTokenStorage();
          router.replace("/login"); // Redirige al login si no está autenticado
        }
      } catch (error) {
        console.error(error);
      }
    };

    isAuthenticate();
  }); // Asegúrate de que el efecto solo se ejecute una vez al montar el componente
}
