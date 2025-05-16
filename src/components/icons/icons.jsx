import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// icon + añadir producto a factura
export function iconPlus(color) {
  return <AntDesign name="pluscircleo" size={30} color={color || "black"} />;
}
export function iconPlusAgg(color, size) {
  return <AntDesign name="plus" size={size || 24} color={color || "black"} />;
}
export function iconMinus(color) {
  return <AntDesign name="minuscircleo" size={30} color={color || "black"} />;
}

export function iconCar(color, size) {
  return (
    <FontAwesome
      name="shopping-basket"
      size={size || 30}
      color={color || "#454545"}
    />
  );
}
export function iconExclamationCircle(color, size) {
  return (
    <AntDesign
      name="exclamationcircleo"
      size={size || 24}
      color={color || "black"}
    />
  );
}
export function iconBarCode() {
  return <MaterialCommunityIcons name="barcode-scan" size={30} color="black" />;
}

export function iconDelete(color, size) {
  return <AntDesign name="delete" size={size || 24} color={color || "red"} />;
}

export function checkIcon(color, size) {
  return (
    <AntDesign name="checkcircleo" size={size || 24} color={color || "black"} />
  );
}
export function iconBroom() {
  return <MaterialCommunityIcons name="broom" size={30} color="white" />;
}

export function iconInvoice() {
  return (
    <FontAwesome6
      name="file-invoice-dollar"
      size={30}
      color="rgb(60, 196, 60)"
    />
  );
}

export function iconFilter({ color, size }) {
  return <AntDesign name="filter" size={size || 24} color={color || "black"} />;
}
export function iconEdit({ color, size }) {
  return <AntDesign name="edit" size={size || 24} color={color || "black"} />;
}

export function iconEye({ size, color }) {
  return <AntDesign name="eyeo" size={size || 24} color={color || "black"} />;
}

export function iconCalendar({ size, color }) {
  return (
    <AntDesign name="calendar" size={size || 24} color={color || "black"} />
  );
}

export function iconError({ size, color }) {
  return (
    <MaterialIcons name="error" size={size || 24} color={color || "black"} />
  );
}

export function iconInfo({ size, color }) {
  return (
    <MaterialIcons
      name="info-outline"
      size={size || 24}
      color={color || "black"}
    />
  );
}

export function iconSearch({ size, color }) {
  return (
    <FontAwesome name="search" size={size || 24} color={color || "black"} />
  );
}

export function iconStore({ size, color }) {
  return (
    <MaterialIcons
      name="storefront"
      size={size || 24}
      color={color || "black"}
    />
  );
}

export function iconPersonPlus({ size, color }) {
  return (
    <MaterialIcons
      name="person-add-alt"
      size={size || 24}
      color={color || "black"}
    />
  );
}
export function iconSignalMoney({ size, color }) {
  return (
    <MaterialIcons
      name="attach-money"
      size={size || 24}
      color={color || "black"}
    />
  );
}
export function iconSettingsBlack({ size, color }) {
  return (
    <MaterialIcons name="settings" size={size || 24} color={color || "black"} />
  );
}
export function iconLogout({ size, color }) {
  return (
    <MaterialIcons name="logout" size={size || 24} color={color || "black"} />
  );
}


export function iconAddUser({size,color}){
  return(
    <AntDesign name="adduser" size={size || 24} color={color || "black"} />
  )
}
export function iconCheckBox({size, color}) {
  return <FontAwesome name="check-circle-o" size={size || 24} color={color || "black"} />;
}

export function iconQrCode({size,color}){
  return <FontAwesome name="qrcode" size={size || 24} color={color||"black"} />
}