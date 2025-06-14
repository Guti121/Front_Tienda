import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar } from "react-native-calendars";

export const ModalCalendar = ({ state, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const handleDayPress = (day) => {
    onClose(day.dateString);
    setSelectedDate(day.dateString);
  };

  return (
    <Modal
      visible={state}
      animationType="fade"
      transparent={true}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback
        onPress={() => onClose(new Date().toISOString().split("T")[0])}
      >
        <View style={styles.container}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "blue" },
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
