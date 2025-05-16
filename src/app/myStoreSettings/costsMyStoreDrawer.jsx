import { CostsStore } from "../../components/settingsStore/costsStore";
import { useUserCAuthRedirect,  } from "../../redux/viewsPermissions";

export default function CostsMyStoreDrawer(){
    useUserCAuthRedirect()
    return(<CostsStore/>)
}