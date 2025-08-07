import { FlatList, Image, Pressable, Text, View } from "react-native";

export default function ProductTypeFilter({
  logoUri,
  showTypes,
  setShowTypes,
  selectedType,
  setSelectedType,
  productTypes,
  onFetchTypes,
  onFilterChange,
  onLoadMoreType 
}) {
  // Esta función se llama cuando se selecciona un tipo de producto
  const handleSelect = (item) => {
    if (selectedType === item.id) {
      setSelectedType(null);
      onFilterChange(null); // quitar filtro
    } else {
      setSelectedType(item.id);
      onFilterChange(item.id); // aplicar filtro
    }
  };
  return (
    <View style={{ marginBottom: 10 }}>
        <View style={{
          flexDirection: "row", 
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 10,}}>

      <Pressable
        onPress={() => {
          if (showTypes) {
            setShowTypes(false);
            setSelectedType(null);
            onFilterChange(null); // si ocultas, también quita filtro
          } else {
            onFetchTypes();
          }
        }}
        style={{
          marginHorizontal: 20,
          backgroundColor: "#3a3a3c",
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          maxWidth: "90%",
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {showTypes ? "Ocultar filtros" : "Filtrar por tipo"}
        </Text>
      </Pressable>
       <Image
          source={{ uri: logoUri || "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png" }}
          style={{ width: 50,
          height: 50,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: '#444', // borde más oscuro
        }}
          resizeMode="cover"
        />
        </View>

      {showTypes && (
        <FlatList
          horizontal
          data={productTypes}
          keyExtractor={(item) => String(item?.id ?? Math.random())}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={{
                backgroundColor:
                  selectedType === item.id ? "#5e5ce6" : "#2c2c2e",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: 1,
                borderColor: "#444",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13 }}>
                {item.tipo_producto}
              </Text>
            </Pressable>
          )}
            onEndReachedThreshold={0.5}
            onEndReached= {onLoadMoreType}
          
        />
      )}
    </View>
  );
}
