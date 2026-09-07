import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { handleLogout } from "../src/components/sesion/axiosRequest";
import { logout } from "../src/redux/userSlice";
import { useTheme } from "../src/theme/ThemeProvider";
import { Badge, Button, Card, Icon, Screen, Text, useToast } from "../src/ui";

const ROLE_LABEL = {
  creator: "Propietario",
  admin: "Administrador",
  worker: "Colaborador",
  cliente: "Cliente",
};

export default function Profile() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { colors, spacing } = useTheme();
  const user = useSelector((state) => state.user.user);
  const role = user?.typeUser;

  const cerrarSesion = async () => {
    try {
      await handleLogout(); // limpia sesión y redirige a /login
      dispatch(logout());
    } catch {
      toast.error("Tu sesión no se pudo cerrar.");
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text variant="subtitle" weight="bold">
            {user?.username || "Usuario"}
          </Text>
          {user?.email ? (
            <Text variant="small" muted>
              {user.email}
            </Text>
          ) : null}
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={ROLE_LABEL[role] || "Sin rol"} tone="brand" />
          </View>
        </Card>

        <Button
          title="Cerrar sesión"
          variant="danger"
          left={<Icon name="logout" size={18} color={colors.textOnBrand} />}
          onPress={cerrarSesion}
        />
      </View>
    </Screen>
  );
}
