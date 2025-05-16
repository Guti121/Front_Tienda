import { useFocusEffect, useRouter } from "expo-router";
import Storage from "../components/token/localstorage";
import { deleteTokenStorage } from "../components/token/token";

export default function Index() {
  const router = useRouter();

  useFocusEffect(() => {
    const isAuthenticate = async () => {
      try {
        const myUsername = await Storage.getItem("username");
        const myToken = await Storage.getItem("token");
        const user = await Storage.getItem("user");
        console.log(myUsername, myToken, user);
        if (myUsername && myToken && user) {
          console.log("envio a drawer");
          router.replace("/drawer/"); // Redirige a la página principal si la autenticación es exitosa
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
