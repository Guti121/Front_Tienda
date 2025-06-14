import BillsGenerate from "../../src/components/BillsGenerate/billsGenerate";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";

export default function billsGenerateDrawer() {
  useUserCAAuthRedirect();
  return <BillsGenerate />;
}
