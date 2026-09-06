import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useDispatch } from "react-redux";

import { handleLogin } from "./axiosRequest";
import { setUser } from "../../redux/userSlice";
import { clearSession } from "../../auth/session";
import { useTheme } from "../../theme/ThemeProvider";
import { Button, TextField, Icon, useToast } from "../../ui";

export default function FormLogin() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { spacing } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await handleLogin(email.trim().toLowerCase(), password);
      dispatch(setUser(user));
      setDone(true);
    } catch (e) {
      await clearSession();
      dispatch(setUser(null));
      const msg = typeof e === "string" ? e : "Verifica las credenciales.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (done) router.replace("/drawer");
  }, [done]);

  return (
    <View style={{ gap: spacing.md }}>
      <TextField
        label="Correo"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setError(null);
        }}
        placeholder="tucorreo@ejemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        left={<Icon name="email-outline" size={18} />}
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        placeholder="••••••••"
        secureTextEntry={!showPass}
        left={<Icon name="lock-outline" size={18} />}
        right={
          <Icon
            name={showPass ? "eye-off-outline" : "eye-outline"}
            size={18}
            onPress={() => setShowPass((v) => !v)}
          />
        }
        error={error}
      />
      <Button
        title="Iniciar sesión"
        onPress={submit}
        loading={loading}
        disabled={!email || !password}
      />
    </View>
  );
}
