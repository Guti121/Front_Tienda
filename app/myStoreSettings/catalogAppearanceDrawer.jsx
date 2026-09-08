import CatalogAppearance from "../../src/components/settingsStore/catalogAppearance/catalogAppearance";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";

export default function CatalogAppearanceDrawer() {
  useUserCAAuthRedirect();
  return <CatalogAppearance />;
}
