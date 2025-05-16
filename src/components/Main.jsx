import React from "react";

import { View, StyleSheet, SafeAreaView } from "react-native";
import FormLogin from "./sesion/loginView";

export default function Main() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <FormLogin />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
});
