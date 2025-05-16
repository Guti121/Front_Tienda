import DetailProduct from "../../components/colletion/product/productDetail";
import { useLocalSearchParams } from "expo-router";

export default function DetailProductDrawer() {
  const searchParams = useLocalSearchParams();
  const id = searchParams?.id; // Asegúrate de que sea seguro acceder

  console.log("ID del producto:", id); // Confirmar que el ID se pasa correctamente

  return <DetailProduct id={id} />;
}
