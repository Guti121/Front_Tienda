import Bill from "../../src/components/billing/bill";
import { useUserCAWAuthRedirect } from "../../src/redux/viewsPermissions";

export default function BillDrawer() {
  //verificar Creador admin o worker
  useUserCAWAuthRedirect();
  return <Bill />;
}
