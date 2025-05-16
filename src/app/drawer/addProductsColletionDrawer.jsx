import { AddProductsColletion } from "../../components/colletion/addProductsColletion";

import { useUserCAAuthRedirect } from "../../redux/viewsPermissions";
export default function AddProductsColletionDrawer() {
  useUserCAAuthRedirect();
  return <AddProductsColletion />;
}
