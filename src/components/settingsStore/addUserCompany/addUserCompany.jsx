import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { listAllies, removeAlly } from "../../../api/store";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Loader,
  Sheet,
  Text,
  useToast,
} from "../../../ui";

const ROLE_LABEL = { admin: "Administrador", worker: "Cajero" };

export default function AddUserCompany() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allies"],
    queryFn: ({ pageParam }) => listAllies(pageParam),
    initialPageParam: "base/listUsersCompany/",
    getNextPageParam: (last) => last?.next ?? undefined,
  });

  const allies = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [data],
  );

  const del = useMutation({
    mutationFn: (id) => removeAlly(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allies"] });
      setToDelete(null);
      toast.success("Aliado eliminado");
    },
    onError: (err) => {
      setToDelete(null);
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar.",
      );
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text muted variant="small">
          Añade colaboradores a tu tienda con el rol que necesites y consulta
          los que ya están vinculados.
        </Text>
        <Button
          title="Generar código para un aliado"
          left={
            <Icon name="qrcode-plus" size={18} color={colors.textOnBrand} />
          }
          onPress={() =>
            router.push("/modals/modalGenerateQrCodeAddUserCompany")
          }
        />
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={allies}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? <Loader fill={false} /> : null
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: spacing.xxl }}>
              <EmptyState
                icon={
                  isError ? "alert-circle-outline" : "account-group-outline"
                }
                title={isError ? "No se pudo cargar" : "Sin aliados"}
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : "Genera un código para vincular al primero."
                }
              />
            </View>
          }
          renderItem={({ item }) => (
            <Card level={0} style={{ marginBottom: spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: spacing.xxs }}>
                  <Text weight="medium">
                    {item.name} {item.last_name}
                  </Text>
                  <Text variant="small" muted>
                    {item.email}
                  </Text>
                  <Badge
                    label={ROLE_LABEL[item.tipo_usuario] || item.tipo_usuario}
                    tone={item.tipo_usuario === "admin" ? "brand" : "neutral"}
                  />
                </View>
                <Icon
                  name="trash-can-outline"
                  size={20}
                  color={colors.danger}
                  onPress={() => setToDelete(item)}
                />
              </View>
            </Card>
          )}
        />
      )}

      <Sheet
        visible={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Quitar aliado"
      >
        <Text muted>
          {toDelete?.name} {toDelete?.last_name} dejará de tener acceso a tu
          tienda.
        </Text>
        <Button
          title="Sí, quitar"
          variant="danger"
          loading={del.isPending}
          onPress={() => del.mutate(toDelete.id)}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setToDelete(null)}
        />
      </Sheet>
    </View>
  );
}
