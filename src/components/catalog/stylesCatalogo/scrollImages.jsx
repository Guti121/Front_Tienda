import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";

export default function HorizontalImageScroller({ images = [], onImagePress }) {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width, 500);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / imageSize);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.container, { width: imageSize, alignSelf: "center" }]}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => onImagePress?.(item)} style={{ width: imageSize }}>
            <Image
              source={{ uri: item }}
              style={[styles.image, { width: imageSize, height: imageSize }]} // Square image
              resizeMode="cover"
            />
          </Pressable>
        )}
      />
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  image: {
    // No border radius needed for edge-to-edge
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 35, // Positioned above the infoBox overlay
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ffffff",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -1,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
