import { useEffect } from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import theme from "../../src/components/themeStyles/theme";
import { router, useFocusEffect } from "expo-router";
import AnimatedButton from "../../src/components/catalog/stylesCatalogo/buttonAnimate";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";

export default function Index() {
  const user = useSelector((state) => state.user.user);

  // Animation control
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleScale = useSharedValue(0.95);

  const userOpacity = useSharedValue(0);
  const userY = useSharedValue(20);
  const userScale = useSharedValue(0.95);

 useFocusEffect(() => {
  verifyTokenAndAnimate()
  // Reset animation values
  titleOpacity.value = 0;
  titleY.value = 20;
  titleScale.value = 0.95;

  userOpacity.value = 0;
  userY.value = 20;
  userScale.value = 0.95;

  // Run animations again
  titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
  titleY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) });
  titleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });

  userOpacity.value = withTiming(1, { duration: 600, delay: 300, easing: Easing.out(Easing.exp) });
  userY.value = withTiming(0, { duration: 600, delay: 300, easing: Easing.out(Easing.exp) });
  userScale.value = withTiming(1, { duration: 600, delay: 300, easing: Easing.out(Easing.exp) });
});


  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: titleY.value },
      { scale: titleScale.value },
    ],
  }));

  const userStyle = useAnimatedStyle(() => ({
    opacity: userOpacity.value,
    transform: [
      { translateY: userY.value },
      { scale: userScale.value },
    ],
  }));
  
  const verifyTokenAndAnimate = async () => {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("login/");
        return;
      }}

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[
          theme.colors.backgroundColor,
          theme.colors.backgroundColorSecondary,
          theme.colors.primary,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
      {user && (
          <Animated.View style={[styles.section, titleStyle]}>
            <Text style={styles.title}>Bienvenida</Text>
          </Animated.View>
        )}
        {user && (
          <Animated.View style={[styles.section, userStyle]}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.role}>Rol: {user.typeUser}</Text>
          </Animated.View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundColor,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 10,
    alignItems: "center",
  },
  title: {
    ...theme.textTitle,
    color: theme.colors.textPrimary,
    fontSize: 32,
    textAlign: "center",
  },
  username: {
    ...theme.textTitle,
    color: theme.colors.textSecundary,
    fontSize: 22,
    textAlign: "center",
  },
  role: {
    ...theme.textNormal,
    color: theme.colors.textTerciary,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
});
