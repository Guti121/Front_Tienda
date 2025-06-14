import { useEffect } from "react";
import { Text } from "react-native";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";

export default function Index() {
  useEffect(() => {
    expiredGetToken();
  }, []);
  return <Text>Principal</Text>;
}
