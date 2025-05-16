import BillsGenerate from "../../components/BillsGenerate/billsGenerate";
import { useUserCAAuthRedirect } from "../../redux/viewsPermissions";

export default function billsGenerateDrawer() {
  useUserCAAuthRedirect();
  return <BillsGenerate />;
}
