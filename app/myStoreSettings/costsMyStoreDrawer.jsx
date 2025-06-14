import { CostsStore } from "../../src/components/settingsStore/costsStore";
import { useUserCAuthRedirect,  } from "../../src/redux/viewsPermissions";

export default function CostsMyStoreDrawer(){
    useUserCAuthRedirect()
    return(<CostsStore/>)
}