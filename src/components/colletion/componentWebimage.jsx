import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Platform,
} from "react-native";

import { Icon, useToast } from "../../ui";

export default function ImagePickerWeb({ images, setImages }) {
  const inputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const toast = useToast();

  const MAX_IMAGES = 5;
  const MAX_SIZE_MB = 10;

  const handlePick = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    // Validate max images
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes.`);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      const sizeInMB = file.size / (1024 * 1024);

      // Validate file size only
      if (sizeInMB > MAX_SIZE_MB) {
        rejectedFiles.push(`${file.name || "archivo"} supera ${MAX_SIZE_MB}MB`);
        return;
      }

      validFiles.push({
        file,
        uri: URL.createObjectURL(file),
      });
    });

    // Show rejected files
    if (rejectedFiles.length > 0) {
      toast.error(
        `Algunos archivos fueron rechazados: ${rejectedFiles.join(", ")}`,
      );
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
    }

    // Reset input to allow selecting same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const updated = [...images];

    // Free preview memory
    if (updated[index]?.uri) {
      URL.revokeObjectURL(updated[index].uri);
    }

    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imágenes del Producto</Text>

      <Pressable
        onPress={() => inputRef.current?.click()}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[styles.uploadBox, isHovered && styles.uploadBoxHovered]}
      >
        <View style={styles.iconContainer}>
          <Icon
            name="image-plus"
            size={32}
            color={isHovered ? "#5e5ce6" : "#8e8e93"}
          />
        </View>

        <Text style={styles.uploadTitle}>Haz clic para subir imágenes</Text>

        <Text style={styles.uploadSubtitle}>
          Puedes tomar foto o elegir desde galería
        </Text>

        <Text style={styles.uploadSubtitle}>
          Máximo {MAX_IMAGES} imágenes • Máx {MAX_SIZE_MB}MB
        </Text>
      </Pressable>

      {/* WEB + MOBILE WEB */}
      {Platform.OS === "web" && (
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePick}
        />
      )}

      {/* Preview images */}
      {images?.length > 0 && (
        <View style={styles.previewContainer}>
          {images.map((img, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />

              <Pressable
                onPress={() => removeImage(idx)}
                style={styles.deleteButton}
              >
                <Icon name="close" size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 15,
  },

  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },

  uploadBox: {
    borderWidth: 2,
    borderColor: "#e5e5ea",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },

  uploadBoxHovered: {
    borderColor: "#5e5ce6",
    backgroundColor: "#f5f5ff",
  },

  iconContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 50,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 4,
    textAlign: "center",
  },

  uploadSubtitle: {
    fontSize: 13,
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 4,
  },

  previewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },

  imageWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
