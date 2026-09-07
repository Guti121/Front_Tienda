import DailyStockTaking from "../../src/components/stocktaking/dailyStockTaking";
import { useUserCAuthRedirect } from "../../src/redux/viewsPermissions";

export default function DailyStockTakingDrawer() {
  useUserCAuthRedirect(); // solo creator
  return <DailyStockTaking />;
}
