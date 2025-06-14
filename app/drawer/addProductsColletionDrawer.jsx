import { AddProductsColletion } from "../../src/components/colletion/addProductsColletion";

import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";
export default function AddProductsColletionDrawer() {
  useUserCAAuthRedirect();
  return <AddProductsColletion />;
}
