import Caja from "../../src/components/caja/caja";
import { useUserCAWAuthRedirect } from "../../src/redux/viewsPermissions";

export default function CajaDrawer() {
  useUserCAWAuthRedirect();
  return <Caja />;
}
