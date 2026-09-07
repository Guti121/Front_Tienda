import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useMutation } from "@tanstack/react-query";

import { generateAllyQr } from "../../src/api/store";
import { ApiError } from "../../src/api/http";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button, Card, Screen, Text, TextField } from "../../src/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = [
  [1, "Cajero"],
  [2, "Administrador"],
];

export default function ModalGenerateQrCodeAddUserCompany() {
  const { colors, spacing, radii } = useTheme();
  const [email, setEmail] = useState("");
  const [typeUser, setTypeUser] = useState(1);
  const [error, setError] = useState(null);

  const gen = useMutation({
    mutationFn: () =>
      generateAllyQr({ email: email.trim().toLowerCase(), typeUser }),
    onError: (err) =>
      setError(
        err instanceof ApiError ? err.message : "No se pudo generar el QR.",
      ),
  });
  const qr = gen.data?.qr_base64;

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError("Correo inválido.");
      return;
    }
    setError(null);
    gen.mutate();
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={0}>
          <Text weight="bold">Datos del aliado</Text>
          <Text muted variant="small" style={{ marginTop: spacing.xs }}>
            Verifica el correo y el rol antes de generar el código: define los
            permisos que tendrá el nuevo aliado.
          </Text>
        </Card>

        <TextField
          label="Correo del aliado"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="correo@ejemplo.com"
          error={error}
        />

        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Rol
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.xs,
              padding: spacing.xxs,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radii.md,
            }}
          >
            {ROLES.map(([value, label]) => {
              const active = typeUser === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setTypeUser(value)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm,
                    borderRadius: radii.sm,
                    alignItems: "center",
                    backgroundColor: active ? colors.surface : "transparent",
                  }}
                >
                  <Text
                    weight={active ? "bold" : "regular"}
                    color={active ? "text" : "textMuted"}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          title="Generar código"
          onPress={submit}
          loading={gen.isPending}
        />

        {qr ? (
          <Card level={1} style={{ alignItems: "center", gap: spacing.sm }}>
            <Text muted variant="small">
              Comparte este código con tu aliado.
            </Text>
            <Image
              source={{ uri: `data:image/png;base64,${qr}` }}
              style={{ width: 260, height: 260 }}
              resizeMode="contain"
            />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
