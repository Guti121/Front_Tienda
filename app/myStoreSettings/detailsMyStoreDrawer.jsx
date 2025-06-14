import DetailsMyStore from "../../src/components/settingsStore/detailStore/detailsMyStore";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";


export default function DetailsMyStoreDrawer (){
    useUserCAAuthRedirect()
    return(<DetailsMyStore/>)
}