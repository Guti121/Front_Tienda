import { useLocalSearchParams } from "expo-router";
import DetailProductCatalog from "../../src/components/catalog/productDetail";


export default function DetailProduct() {
  
    const { id, name } = useLocalSearchParams();
    
  return (
    <DetailProductCatalog productId={id} name={name} />
  );
}