import React from "react";
import { Image, Text, View } from "react-native";

export const CompanyInfoRequest = ({ info }) => {
  const imageUri = info?.url_logo?.trim()
    ? info.url_logo
    : "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 20,
        backgroundColor: '#f8f9fa',
      }}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: '#e0e0e0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        resizeMode="cover"
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#222222',
          }}
        >
          {info?.company || "Nombre de la Empresa"}
        </Text>

        <Text style={{ fontSize: 12, color: '#666666' }}>
          {info?.name || "Nombre del representante"}
        </Text>

        <Text style={{ fontSize: 16, color: '#666666' }}>
          {info?.municipality || "Municipio Desconocido"}
        </Text>
      </View>
    </View>
  );
};
