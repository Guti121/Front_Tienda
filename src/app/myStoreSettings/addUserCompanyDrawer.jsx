import AddUserCompany from "../../components/settingsStore/addUserCompany/addUserCompany";
import { useUserCAAuthRedirect } from "../../redux/viewsPermissions";

export default function addUserCompanyDrawer(){
    useUserCAAuthRedirect()
 return(<AddUserCompany/>)
}