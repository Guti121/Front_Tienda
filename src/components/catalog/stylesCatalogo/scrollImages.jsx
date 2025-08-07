import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet, Text } from "react-native";
import { iconArrowLeft, iconArrowRight } from "../../icons/icons";
import theme from "../../themeStyles/theme";

export default function HorizontalImageScroller({ images = [],onImagePress  }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
        
      <Pressable disabled={currentIndex > 0 ? false : true} onPress={handlePrev} style={styles.arrow}>
        {iconArrowLeft({ size: 50, color: currentIndex > 0 ? theme.colors.primary : "rgba(73, 73, 73, 1)" })}
      </Pressable>
    <Pressable style={{flex:1}}onPress={() => onImagePress?.(images[currentIndex])}>

      <Image
        source={{ uri: images[currentIndex] }}
        style={[styles.image,
            {
                width: "100%",
                maxWidth: 400,
                aspectRatio: 3 / 4,
                alignSelf: "center",
            }
        ]}
        />
    </Pressable>
    
      <Pressable disabled={currentIndex < images.length - 1 ? false :true } onPress={handleNext} style={styles.arrow}>
        {iconArrowRight({ size: 50, color: currentIndex < images.length - 1 ? theme.colors.primary : "rgba(73, 73, 73, 1)" })}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    paddingHorizontal: 50,
    gap: 10,
  },
  image: {
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  arrow: {
  
  },
  arrowText: {
    fontSize: 24,
    color: "#fff",
  },
});
