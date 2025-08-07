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
        backgroundColor: '#121212',
      }}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: '#444',
        }}
        resizeMode="cover"
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#fff',
          }}
        >
          {info?.company || "Nombre de la Empresa"}
        </Text>

        <Text style={{ fontSize: 12, color: '#bbb' }}>
          {info?.name || "Nombre del representante"}
        </Text>

        <Text style={{ fontSize: 16, color: '#bbb' }}>
          {info?.municipality || "Municipio Desconocido"}
        </Text>
      </View>
    </View>
  );
};
