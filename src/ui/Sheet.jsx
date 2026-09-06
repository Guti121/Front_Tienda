import { Modal, Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";
import { Icon } from "./Icon";

// Hoja inferior modal. Reemplaza los <Modal> sueltos con estilos hardcodeados.
export function Sheet({ visible, onClose, title, children }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
            gap: spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="subtitle" weight="bold">
              {title}
            </Text>
            <Icon
              name="close"
              size={22}
              color={colors.textMuted}
              onPress={onClose}
            />
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default Sheet;
