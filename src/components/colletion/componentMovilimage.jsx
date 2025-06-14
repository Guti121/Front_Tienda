import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button, Image, Platform, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { iconDelete } from '../icons/icons';
import theme from '../themeStyles/theme';

export default function ImagePickerComponent({ image, setImage }) {

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Se necesita permiso para acceder a la cámara o galería');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;

      // 🔁 Convertir imagen a base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mime = pickerResult.assets[0].type || 'image/jpeg'; // por si acaso
      const base64WithPrefix = `data:${mime};base64,${base64}`;

      setImage(base64WithPrefix);
    }
  };

  return (
    <View style={{ alignItems: 'center', marginTop: 50 }}>
      <Pressable
        style={{
          ...theme.shadow,
          borderWidth: 1,
          borderColor: 'rgb(151, 149, 149)',
          backgroundColor: 'rgb(241, 241, 241)',
          padding: 10,
          borderRadius: 100,
        }}
        onPress={pickImage}
      >
        <Text style={{ fontWeight: 'bold', color: 'rgb(126, 123, 123)' }}>
          Tomar o seleccionar imagen
        </Text>
      </Pressable>

      {image && (
        <View style={{ marginTop: 20, position: 'relative' }}>
          <Image
            source={{ uri: image }}
            style={{
              width: 200,
              height: 300,
              borderRadius: 12,
            }}
          />
          <Pressable
            onPress={() => setImage(null)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 5,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            {iconDelete('red', 20)}
          </Pressable>
        </View>
      )}
    </View>
  );
}
