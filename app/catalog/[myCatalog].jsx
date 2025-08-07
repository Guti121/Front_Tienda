import { useLocalSearchParams } from "expo-router";
import PrincipalCatalog from "../../src/components/catalog/principalCatalog";


export default function MyCatalog() {
  const { myCatalog } = useLocalSearchParams();
  return (
    <PrincipalCatalog name={myCatalog}/>
)}