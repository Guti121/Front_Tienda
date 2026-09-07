import StocktakingPage from "../../src/components/stocktaking/stocktaking";
import { useUserCAuthRedirect } from "../../src/redux/viewsPermissions";

export default function Stocktaking() {
  useUserCAuthRedirect(); // solo creator
  return <StocktakingPage />;
}
