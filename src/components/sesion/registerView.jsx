import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { handleRegister, handleLogin } from "./axiosRequest";
import { useTheme } from "../../theme/ThemeProvider";
import { Button, TextField, Text, Icon, useToast } from "../../ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function FormRegister() {
  const toast = useToast();
  const { spacing } = useTheme();

  const [form, setForm] = useState({
    email: "",
    username: "",
    name: "",
    lastName: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null, _: null }));
  };

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(form.email)) e.email = "Correo inválido.";
    if (!form.username) e.username = "Requerido.";
    if (!form.name) e.name = "Requerido.";
    if (!form.lastName) e.lastName = "Requerido.";
    if (!PASS_RE.test(form.password))
      e.password = "Mín. 8, una mayúscula, un número y un símbolo.";
    if (form.password !== form.passwordConfirm)
      e.passwordConfirm = "No coincide.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await handleRegister({
        username: form.username,
        email: form.email,
        password: form.password,
        password_verify: form.passwordConfirm,
        first_name: form.name,
        last_name: form.lastName,
      });
      if (res.status === 201) {
        setOk(true);
        // Auto-login con las mismas credenciales para poder llevar al usuario
        // directo a elegir qué hacer (crear tienda / unirse por QR), en vez de
        // mandarlo a loguearse a mano.
        try {
          await handleLogin(form.email, form.password);
          router.replace("/onboarding");
        } catch {
          toast.success("¡Cuenta creada! Ya puedes iniciar sesión.");
        }
      }
    } catch (err) {
      const fields = err?.fields || err?.response?.data || {};
      setErrors({
        email: fields.email?.[0] || fields.email,
        username: fields.username?.[0] || fields.username,
        _: "Verifica los datos ingresados.",
      });
      toast.error(err?.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <TextField
        label="Correo"
        value={form.email}
        onChangeText={set("email")}
        placeholder="tucorreo@ejemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        left={<Icon name="email-outline" size={18} />}
        error={errors.email}
      />
      <TextField
        label="Usuario"
        value={form.username}
        onChangeText={set("username")}
        autoCapitalize="none"
        left={<Icon name="account-outline" size={18} />}
        error={errors.username}
      />
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <TextField
          label="Nombre"
          value={form.name}
          onChangeText={set("name")}
          style={{ flex: 1 }}
          error={errors.name}
        />
        <TextField
          label="Apellidos"
          value={form.lastName}
          onChangeText={set("lastName")}
          style={{ flex: 1 }}
          error={errors.lastName}
        />
      </View>
      <TextField
        label="Contraseña"
        value={form.password}
        onChangeText={set("password")}
        secureTextEntry={!showPass}
        left={<Icon name="lock-outline" size={18} />}
        right={
          <Icon
            name={showPass ? "eye-off-outline" : "eye-outline"}
            size={18}
            onPress={() => setShowPass((v) => !v)}
          />
        }
        error={errors.password}
      />
      <TextField
        label="Confirma la contraseña"
        value={form.passwordConfirm}
        onChangeText={set("passwordConfirm")}
        secureTextEntry={!showPass}
        left={<Icon name="lock-check-outline" size={18} />}
        error={errors.passwordConfirm}
      />

      {errors._ ? (
        <Text variant="caption" color="danger">
          {errors._}
        </Text>
      ) : null}
      {ok ? (
        <Text variant="small" color="success">
          ¡Cuenta creada con éxito!
        </Text>
      ) : null}

      <Button title="Crear cuenta" onPress={submit} loading={loading} />
    </View>
  );
}
