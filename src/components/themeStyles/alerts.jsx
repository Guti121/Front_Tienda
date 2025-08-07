import { useState } from "react";
import { Alert, Platform } from "react-native";
import { Modal, Text } from "react-native";

const platform = Platform.OS;

export const Alerts = () => {
  error = "error";
  const [alertsModal, setAlertModal] = useState(true);

  setAlertModal(true);
  if (platform == "web") {
    return (
      <Modal>
        <Text>{error}</Text>
      </Modal>
    );
  } else {
    Alert.alert("Error:", error);
  }
};

Alerts;

export const showSessionAlert = (title, message, onConfirm) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onConfirm();
  } else {
    Alert.alert(title, message, [{ text: "OK", onPress: onConfirm }]);
  }
};