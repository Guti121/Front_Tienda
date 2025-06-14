import AddUserCompany from "../../src/components/settingsStore/addUserCompany/addUserCompany";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";

export default function addUserCompanyDrawer(){
    useUserCAAuthRedirect()
 return(<AddUserCompany/>)
}