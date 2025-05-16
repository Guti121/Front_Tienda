import { useState } from "react";
import { Alert, Platform } from "react-native";
import { Modal, Text } from "react-native";

const platform = Platform.OS;

const Alerts = () => {
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

export default Alerts;
