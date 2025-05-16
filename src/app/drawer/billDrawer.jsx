import Bill from "../../components/billing/bill";
import { useUserCAWAuthRedirect } from "../../redux/viewsPermissions";

export default function BillDrawer() {
  //verificar Creador admin o worker
  useUserCAWAuthRedirect();
  return <Bill />;
}
