import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Calendar } from "react-native-calendars";

import { useTheme } from "../../theme/ThemeProvider";
import { Text } from "../../ui";
import { toLocalDateStr } from "../../utils/date";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Selector de día. `onClose` recibe la fecha "YYYY-MM-DD" (o la de hoy al tocar
// fuera del calendario).
export const ModalCalendar = ({ state, onClose }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState("");

  return (
    <Modal visible={state} animationType="fade" transparent>
      <Pressable
        onPress={() => onClose(toLocalDateStr())}
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 20,
          backgroundColor: colors.overlay,
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Calendar
            onDayPress={(day) => {
              setSelected(day.dateString);
              onClose(day.dateString);
            }}
            markedDates={{
              [selected]: { selected: true, selectedColor: colors.primary },
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Selector de mes/año. `onClose` recibe `{ month, year }` o `null` al cancelar.
export const MonthPickerModal = ({ visible, onClose }) => {
  const { colors, spacing, radii } = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable
        onPress={() => onClose(null)}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.overlay,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "88%",
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <Text variant="subtitle" weight="bold" center>
            Selecciona mes y año
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.lg,
            }}
          >
            <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={10}>
              <Text variant="subtitle" color="primary">
                ‹
              </Text>
            </Pressable>
            <Text variant="subtitle" weight="bold">
              {year}
            </Text>
            <Pressable onPress={() => setYear((y) => y + 1)} hitSlop={10}>
              <Text variant="subtitle" color="primary">
                ›
              </Text>
            </Pressable>
          </View>

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {MESES.map((m, i) => (
              <Pressable
                key={m}
                onPress={() => onClose({ month: i + 1, year })}
                style={{
                  width: "30%",
                  flexGrow: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.sm,
                  alignItems: "center",
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Text color="primary" weight="medium">
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
