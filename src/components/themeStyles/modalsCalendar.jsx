import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Picker,
} from "react-native";
import { Calendar } from "react-native-calendars";
import theme from "./theme";


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
              [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
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
   modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  monthButton: {
    padding: 10,
    margin: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    width: "30%",
    alignItems: "center",
  },
  monthText: {
    color: "#fff",
  },
});




// ModalCalendarMonth.js


const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export const MonthPickerModal = ({ visible, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handleMonthPress = (monthIndex) => {
    setSelectedMonth(monthIndex + 1);
    onClose({ month: monthIndex + 1, year: selectedYear });
  };

  return (
  <Modal visible={visible} animationType="fade" transparent>
    <TouchableWithoutFeedback onPress={() => onClose(null)}>
    <View style={styles.overlay}>
      {/* Solo cierra si tocas fuera del contenido */}
       <TouchableWithoutFeedback onPress={() => {}}>


      {/* Contenido del modal que no debe cerrar el modal al interactuar */}
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona el mes y año</Text>

        <Picker
          selectedValue={selectedYear}
          style={{ height: 50 }}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>

        <FlatList
          data={months}
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleMonthPress(index)}
              style={styles.monthButton}
            >
              <Text style={styles.monthText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
       </TouchableWithoutFeedback>

    </View>
       </TouchableWithoutFeedback>

  </Modal>

  );
};

