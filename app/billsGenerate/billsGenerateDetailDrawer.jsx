import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { BillGenerateDetail } from "../../src/components/BillsGenerate/billsGenereteDetail";

export default function billsGenerateDetailDrawer() {
  const { value } = useLocalSearchParams();

  return !value ? (
    <View>
      <Text style={{ color: "red" }}> No se proporciono Id</Text>
    </View>
  ) : (
    <BillGenerateDetail id={value} />
  );
}
