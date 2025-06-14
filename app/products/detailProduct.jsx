import DetailProduct from "../../src/components/colletion/product/productDetail";
import { useLocalSearchParams } from "expo-router";

export default function DetailProductDrawer() {
  const searchParams = useLocalSearchParams();
  const id = searchParams?.id; // Asegúrate de que sea seguro acceder


  return <DetailProduct id={id} />;
}
